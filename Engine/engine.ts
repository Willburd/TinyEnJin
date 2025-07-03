import {
  GAMEMODE,
  RENDER_WARNING_LIMIT,
  ENTITY_CAP,
  ENTITY_LIST_REFRESH_THRESHOLD,
} from "./constants";
import { Scene } from "./scene";
import { Entity } from "./entity";
import { DESTROY_ALL } from "./destroy";
import { __CREATE_RENDER_CONTEXT, __RENDER } from "./render";
import {
  __IMGS_TOTAL,
  __IMGS_ERR,
  __LOAD_ASSETS,
  __LOAD_PROGRESS,
} from "./sprites";
import { __RESOLVE_COLLISIONS } from "./collision";

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Launch logic, this is where everything STARTS! Create a render context, then get the game assets
// __INTERNAL_LOADING will wait until all assets have loaded, then call the game's defined __SETUP().
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
window.addEventListener("load", () => {
  // This is literally the first code that runs!
  console.log("Getting tipsy with EnJin...");
  __CREATE_RENDER_CONTEXT();
  __INTERNAL_LOADING();
});
/**
 * Load assets, makes sure everything gets done instead of blindly trusting the page to be loaded instantly!
 * @returns {number}
 */
export function __INTERNAL_LOADING(): number {
  if (__IMGS_TOTAL > 0) console.log("Loading progress: " + __LOAD_PROGRESS());
  if (__IMGS_ERR > 0) {
    console.log("Errors: " + __IMGS_ERR);
    return 0;
  }
  if (!__LOAD_ASSETS()) return requestAnimationFrame(__INTERNAL_LOADING);
  console.log("Asset loading complete: " + __IMGS_TOTAL);
  console.log("Turning over...");
  // Finally, end of the startup code. We trigger the game object to spawn by sending a signal.
  // The project itself will impliment this in its files instead of the engine. This starts the game.
  dispatchEvent(new Event("__SETUP"));
  return __IMGS_TOTAL;
}

// Setup input handler
let previous_pressed_keys: Set<String> = new Set();
let pressed_keys: Set<String> = new Set();
export function isKeyHeld(key: string): boolean {
  return pressed_keys.has(key);
}
export function isKeyPressed(key: string): boolean {
  return !previous_pressed_keys.has(key) && pressed_keys.has(key);
}
export function isKeyReleased(key: string): boolean {
  return previous_pressed_keys.has(key) && !pressed_keys.has(key);
}
document.addEventListener("keydown", (e) =>
  pressed_keys.add(e.key.toLowerCase()),
);
document.addEventListener("keyup", (e) =>
  pressed_keys.delete(e.key.toLowerCase()),
);
export function __UPDATE_KEYPRESS() {
  previous_pressed_keys = new Set(pressed_keys);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Frame render loop. Where the game ACTUALLY updates. But much more often renders...
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export let SHOW_FPS: boolean = true;
export let fps: number = 1;
const times: number[] = [];
/**
 * This loop goes on forever by requesting it to trigger next browser frame. This is not recursive, as it's schedualing a call instead of just calling.
 * @param {number} currentTimeMs - The current requestAnimationFrame time that the frame is being called with. Used in deltatime calculation.
 * @param {boolean} forced - If this function is called manually, this will need to be set to true to ignore deltatime likely missing the update tick.
 * @returns {void}
 */
export function __FRAME(currentTimeMs: number, forced: boolean = false): void {
  if (!forced) requestAnimationFrame(__FRAME);
  if (!document.hasFocus()) return;
  const deltaTimeMs = currentTimeMs - Game.active_game.__PREVIOUS_UPDATE_MS;
  if (deltaTimeMs >= Game.active_game.__UPDATE_RATE_MS || forced) {
    if (!forced && SHOW_FPS) {
      while (times.length > 0 && (times[0] as number) <= currentTimeMs - 1000) {
        times.shift();
      }
      times.push(currentTimeMs);
      fps = times.length;
    }
    Game.active_game.__PROCESS();
    const offset = deltaTimeMs % Game.active_game.__UPDATE_RATE_MS;
    Game.active_game.__PREVIOUS_UPDATE_MS = currentTimeMs - offset;
    __UPDATE_KEYPRESS();
  }
  if (Game.active_scene != null) {
    let rendered_ents = __RENDER();
    if (rendered_ents >= RENDER_WARNING_LIMIT)
      console.error("EXCESSIVE ENTITY RENDERING: " + rendered_ents);
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Core classes
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export class Game {
  name: string = "";
  static active_game: Game;
  static active_scene: Scene;

  protected __MODESTATE: number = GAMEMODE.BASIC;
  private init_queue: Array<Entity> = [];
  private depth_sort: Array<Array<Entity>> = [];
  private all_entities: Array<Entity> = [];
  private recently_free_slots: number[] = [];
  protected id_to_entity: Record<string, Entity> = {};

  private __UPDATERATE: number = 60; // Updates per second, browser sets fps

  static entities_created: number = 0;
  static entities_destroyed: number = 0;

  /**
   * Gets an entity from a unique string ID.
   * @param {string} identity_string - Entity's unique string id.
   * @returns {Entity}
   */
  static GET_ENTITY(identity_string: string): Entity | null {
    if (
      identity_string == undefined ||
      identity_string == null ||
      Game.active_game.id_to_entity[identity_string] == undefined
    )
      return null;
    return Game.active_game.id_to_entity[identity_string];
  }

  /**
   * Starts game and begins Update loop
   * @returns {void}
   */
  public __START(): void {
    if (Game.active_game != null) {
      console.error("MULTIPLE GAMES ATTEMPTED TO START");
      return;
    }
    console.log("GAMESTARTED");
    Game.active_game = this;
    this.__UPDATE_RATE_MS = 1000 / Game.active_game.__UPDATERATE;
    this.Init();
    requestAnimationFrame(__FRAME);
  }
  public __UPDATE_RATE_MS: number = 0;
  public __PREVIOUS_UPDATE_MS: number = 0;
  protected loops: number = 0;

  /**
   * Ends game and destroys all scenes and entities
   * @returns {void}
   */
  public __STOP(): void {
    DESTROY_ALL(true, true);
    Game.active_game;
  }

  /**
   * Custom Init code. Can be safely overridden.
   * @returns {void}
   */
  public Init(): void {
    return;
  }

  /**
   * Custom Update code. Can be safely overridden.
   * @returns {void}
   */
  public Update(): void {}

  /**
   * Sets the mode state of the game, can be used to give processing filter layers to entities. Such as entities that only process or render on a pause screen.
   * @returns {void}
   */
  public SetModeState(new_state: number): void {
    this.__MODESTATE = new_state;
  }

  /**
   * Assigns core data to an entity, such as where it is in the processing list, and the callback ID.
   * @param {Entity} inti - Entity being constructed
   * @returns {void}
   */
  protected __ENTITYINIT(inti: Entity): void {
    // Use recently freed slots first
    let finder = Game.active_game.recently_free_slots.pop();
    if (finder == undefined) {
      finder = Game.active_game.all_entities.length;
      if (finder >= ENTITY_CAP)
        console.error("BREACHING ENTITY CAP: " + finder);
    }
    //console.log(Game.active_game.recently_free_slots);
    Game.active_game.all_entities[finder] = inti;
    inti.__INTERNAL_INIT(finder);
    this.id_to_entity[inti.GetIdentifier()] = inti;
    //console.log("CREATED ENTITY: " + inti.__identifier + " slot: " + inti.__SLOT_NUM);
  }

  /**
   * Core game update function. All entities process here.
   * @returns {number} The number of entities that exist by the end of the frame.
   */
  public __PROCESS(): number {
    // Create pending objects
    while (this.init_queue.length) {
      this.__ENTITYINIT(this.init_queue.pop() as Entity);
    }

    // Self Update
    this.Update();
    if (Game.active_scene) Game.active_scene.Update();

    // Update objects
    let all_colliding_entities: Array<Entity> = [];
    let processed_ents: number = 0;

    // Process and sort depth for rendering
    this.depth_sort = [];
    if (this.all_entities.length > 0) {
      let new_list: Array<Entity> = []; // Removing nulls
      this.all_entities.forEach((enu) => {
        // Update early event
        if (
          enu != null &&
          !enu.IsDestroyed() &&
          enu.PROCESSFLAGS & this.__MODESTATE
        )
          enu.EarlyUpdate();
      });
      this.all_entities.forEach((enu) => {
        // Update main event
        if (
          enu != null &&
          !enu.IsDestroyed() &&
          enu.PROCESSFLAGS & this.__MODESTATE
        )
          enu.__INTERNAL_UPDATE();
        if (
          enu != null &&
          !enu.IsDestroyed() &&
          enu.PROCESSFLAGS & this.__MODESTATE
        ) {
          enu.Update();
          processed_ents++;
        }
      });
      this.all_entities.forEach((enu) => {
        // Update late event
        if (enu != null && !enu.IsDestroyed()) {
          if (enu.PROCESSFLAGS & this.__MODESTATE) enu.LateUpdate();
          if (!enu.IsDestroyed()) {
            // Check if late Update destroyed us...
            if (enu.visible && enu.RENDERFLAGS & this.__MODESTATE) {
              // Prepare for drawing
              if (this.depth_sort[100000 + enu.depth] == undefined)
                this.depth_sort[100000 + enu.depth] = [];
              let sublist = this.depth_sort[
                100000 + enu.depth
              ] as Array<Entity>;
              sublist.push(enu);
            }
            // prepare to resolve collisions
            if (enu.GetColliders().length > 0) all_colliding_entities.push(enu);
            // Still exists, place is regnerated list
            new_list.push(enu);
          }
        }
      });
      // Removes nulls by only adding objects that survived to the new loop.
      // Only does this if there is a significant amount of nulls in the list
      if (
        Math.abs(Game.active_game.all_entities.length - new_list.length) >=
        ENTITY_LIST_REFRESH_THRESHOLD
      )
        this.REFRESH_ENTITY_LIST(new_list);
    }

    if (all_colliding_entities.length > 0) {
      all_colliding_entities.forEach((clu) => {
        // Update early event
        if (clu != null) __RESOLVE_COLLISIONS(clu, all_colliding_entities);
      });
    }
    return processed_ents;
  }

  /**
   * Returns the current list of processing entities
   * @returns {Array<Entity>}
   */
  public GetEntityList(): Array<Entity> {
    return this.all_entities;
  }

  /**
   * Returns the current list of processing entities
   * @returns {Array<Entity>}
   */
  public GetRenderList(): Array<Array<Entity>> {
    return this.depth_sort;
  }

  /**
   * Removes entity from the processing list and pushes the slot as free
   * @returns {void}
   */
  public __ADDENTITY(ent: Entity): void {
    this.init_queue.push(ent);
  }

  /**
   * Removes entity from the processing list and pushes the slot as free
   * @returns {void}
   */
  public __REMOVEENTITY(ent: Entity): void {
    delete this.all_entities[ent.GetProcessSlot()];
    delete this.id_to_entity[ent.GetIdentifier()];
    this.recently_free_slots.push(ent.GetProcessSlot());
  }

  /**
   * Refreshes entity list with a new list. Safely refreshes cached open slots too.
   * @param {Array<Entity>} new_list - List that will become the new processing list once cleanup completes.
   * @returns {void}
   */
  public REFRESH_ENTITY_LIST(new_list: Array<Entity>): void {
    console.log(
      "Refreshed entity list. " +
        Game.active_game.all_entities.length +
        " => " +
        new_list.length +
        " Diff: " +
        Math.abs(new_list.length - Game.active_game.all_entities.length),
    );
    Game.active_game.all_entities = new_list;
    Game.active_game.recently_free_slots = [];
  }
}
