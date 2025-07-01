import {GAMEMODE,RENDER_WARNING_LIMIT,ENTITY_CAP,ENTITY_LIST_REFRESH_THRESHOLD} from "./constants";
import {Scene} from "./scene";
import {Rand} from "./tools";
import {Entity,entities_created} from "./entity";
import {DESTROY_ALL,entities_destroyed} from "./destroy";
import {__CREATE_RENDER_CONTEXT,__RENDER} from "./render";
import {__IMGS_TOTAL,__IMGS_ERR,__LOAD_ASSETS,__LOAD_PROGRESS} from "./sprites";
import {__RESOLVE_COLLISIONS} from "./collision";


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Launch logic, this is where everything STARTS! Create a render context, then get the game assets
// __INTERNAL_LOADING will wait until all assets have loaded, then call the game's defined __SETUP().
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
window.addEventListener("load", () => {
	// This is literally the first code that runs!
	__CREATE_RENDER_CONTEXT();
	__INTERNAL_LOADING();
});
/**
* Load assets, makes sure everything gets done instead of blindly trusting the page to be loaded instantly!
* @returns {void}
*/
export function __INTERNAL_LOADING()
{
	if(__IMGS_TOTAL > 0) console.log("Loading progress: " + __LOAD_PROGRESS());
	if(__IMGS_ERR > 0) 
	{
		console.log("Errors: " + __IMGS_ERR);
		return;
	}
	if(!__LOAD_ASSETS()) return requestAnimationFrame(__INTERNAL_LOADING);
	new Event("__SETUP"); // Must be defined in PROJECT
};

// Setup input handler
let previous_pressed_keys: Set<String> = new Set();
let pressed_keys: Set<String> = new Set();
export function isKeyHeld(key) : boolean {return pressed_keys.has(key)};
export function isKeyPressed(key) : boolean {return (!previous_pressed_keys.has(key) && pressed_keys.has(key))};
export function isKeyReleased(key) : boolean {return (previous_pressed_keys.has(key) && !pressed_keys.has(key))};
document.addEventListener('keydown', (e) => pressed_keys.add(e.key.toLowerCase()));
document.addEventListener('keyup', (e) => pressed_keys.delete(e.key.toLowerCase()));
export function __UPDATE_KEYPRESS() 
{
	previous_pressed_keys = new Set(pressed_keys);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Frame render loop. Where the game ACTUALLY updates. But much more often renders...
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export let SHOW_FPS: boolean = true;
export let fps: number = 1;
const times:number[] = [];
/**
* This loop goes on forever by requesting it to trigger next browser frame. This is not recursive, as it's schedualing a call instead of just calling.
* @param {number} currentTimeMs - The current requestAnimationFrame time that the frame is being called with. Used in deltatime calculation.
* @param {boolean} forced - If this function is called manually, this will need to be set to true to ignore deltatime likely missing the update tick.
* @returns {void}
*/
export function __FRAME(currentTimeMs:number, forced:boolean = false)
{
	if(!forced) requestAnimationFrame(__FRAME);
	if(!document.hasFocus()) return;
	// Requires focus to play, or GC gets really unhappy
	const deltaTimeMs = currentTimeMs - Game.active_game.__PREVIOUS_UPDATE_MS;
	if (deltaTimeMs >= Game.active_game.__UPDATE_RATE_MS || forced) {
		if(!forced && SHOW_FPS)
		{
			while (times.length > 0 && times[0] <= currentTimeMs - 1000) {
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
	if(Game.active_scene != null)
	{
		let rendered_ents = __RENDER();
		if(rendered_ents >= RENDER_WARNING_LIMIT) console.error("EXCESSIVE ENTITY RENDERING: " + rendered_ents);
	}
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Core classes
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export class Game
{
	name:string = "";
	static active_game:Game = null;
	static active_scene:Scene = null;

	protected __MODESTATE:number = GAMEMODE.BASIC;
	private init_queue:Array<Entity> = [];
	private depth_sort:Array<Array<Entity>> = [];
	private all_entities:Array<Entity> = [];
	private recently_free_slots:number[] = [];
	protected id_to_entity = {};
	
	private __UPDATERATE = 60; // Updates per second, browser sets fps

	/**
	* Starts game and begins Update loop
	* @returns {void}
	*/
	public __START(): void {
		if(Game.active_game != null)
		{
			console.error("MULTIPLE GAMES ATTEMPTED TO START");
			return
		}
		Game.active_game = this;
		this.__UPDATE_RATE_MS = 1000 / Game.active_game.__UPDATERATE;
		this.Init();
		requestAnimationFrame(__FRAME);
	};
	public __UPDATE_RATE_MS: number = 0; 
	public __PREVIOUS_UPDATE_MS: number = 0;
	protected loops: number = 0;

	/**
	* Ends game and destroys all scenes and entities
	* @returns {void}
	*/
	public __STOP() : void 
	{
		DESTROY_ALL(true,true);
		Game.active_game = null;
	}

	/**
	* Custom Init code. Can be safely overridden.
	* @returns {void}
	*/
    public Init():void
	{
		return;
	};

	/**
	* Custom Update code. Can be safely overridden.
	* @returns {void}
	*/
    public Update():void {};

	/**
	* Sets the mode state of the game, can be used to give processing filter layers to entities. Such as entities that only process or render on a pause screen.
	* @returns {void}
	*/
    public SetModeState(new_state):void 
	{
		this.__MODESTATE = new_state;
	};

	/**
	* Assigns core data to an entity, such as where it is in the processing list, and the callback ID.
	* @param {Entity} inti - Entity being constructed
	* @returns {void}
	*/
	protected __ENTITYINIT(inti:Entity):void 
	{
		// Use recently freed slots first
		let finder = Game.active_game.recently_free_slots.pop();
		if(finder == undefined)
		{
			finder = Game.active_game.all_entities.length;
			if(finder >= ENTITY_CAP) console.error("BREACHING ENTITY CAP: " + finder);
		}
		//console.log(Game.active_game.recently_free_slots);
		Game.active_game.all_entities[finder] = inti;
		inti.__SLOT_NUM = finder;
		inti.__identifier = btoa(Rand(1,999999999).toString() + this.__PREVIOUS_UPDATE_MS.toString() + entities_created.toString() + entities_destroyed.toString());
		this.id_to_entity[inti.__identifier] = inti;
		inti.OnInit();
		//console.log("CREATED ENTITY: " + inti.__identifier + " slot: " + inti.__SLOT_NUM);
	}

	/**
	* Core game update function. All entities process here.
	* @returns {number} The number of entities that exist by the end of the frame.
	*/
    public __PROCESS() : number
	{
		// Create pending objects
		while(this.init_queue.length) {
			this.__ENTITYINIT(this.init_queue.pop())
		}

		// Self Update
		this.Update();
		if(Game.active_scene) Game.active_scene.Update();

		// Update objects
		let all_colliders = [];
		let processed_ents = 0;

		// Process and sort depth for rendering
		delete this.depth_sort;
		this.depth_sort = [];
		if(this.all_entities.length > 0)
		{
			let new_list = []; // Removing nulls
			this.all_entities.forEach(enu => {
				// Update early event
				if(enu != null && !enu.__destroyed && (enu.PROCESSFLAGS & this.__MODESTATE))
				{
					enu.EarlyUpdate();
				}	
			});
			this.all_entities.forEach(enu => {
				// Update main event
				if(enu != null && !enu.__destroyed && (enu.PROCESSFLAGS & this.__MODESTATE))
				{
					enu.__INTERNAL_UPDATE();
				}
				if(enu != null && !enu.__destroyed && (enu.PROCESSFLAGS & this.__MODESTATE))
				{
					enu.Update();
					processed_ents++;
				}
			});
			this.all_entities.forEach(enu => {
				// Update late event
				if(enu != null && !enu.__destroyed)
				{
					if(enu.PROCESSFLAGS & this.__MODESTATE) enu.LateUpdate();
					if(!enu.__destroyed) // Check if late Update destroyed us...
					{
						if(enu.visible && (enu.RENDERFLAGS & this.__MODESTATE))	
						{
							// Prepare for drawing
							if(this.depth_sort[100000 + enu.depth] == undefined) 
							{
								this.depth_sort[100000 + enu.depth] = [];
							}
							let sublist = this.depth_sort[100000 + enu.depth];
							sublist.push(enu);
						}
						if(enu.colliders != null && enu.colliders.length)
						{
							// prepare to resolve collisions
							all_colliders.push(enu);
						}
						// Still exists, place is regnerated list
						new_list.push(enu);
					}
				}
			});
			// Removes nulls by only adding objects that survived to the new loop.
			// Only does this if there is a significant amount of nulls in the list
			if(Math.abs(Game.active_game.all_entities.length - new_list.length) >= ENTITY_LIST_REFRESH_THRESHOLD) this.REFRESH_ENTITY_LIST(new_list);
		}
		
		if(all_colliders.length > 0)
		{
			all_colliders.forEach(clu => {
				// Update early event
				if(clu != null)	__RESOLVE_COLLISIONS(clu,all_colliders);
			});
		}
		return processed_ents;
	}

	/**
	* Returns the current list of processing entities
	* @returns {Array<Entity>}
	*/
	public GetEntityList():Array<Entity>
	{
		return this.all_entities;
	}

	/**
	* Returns the current list of processing entities
	* @returns {Array<Entity>}
	*/
	public GetRenderList():Array<Array<Entity>>
	{
		return this.depth_sort;
	}

	/**
	* Removes entity from the processing list and pushes the slot as free
	* @returns {void}
	*/
    public __ADDENTITY(ent:Entity) : void
	{
		this.init_queue.push(ent);
	}

	/**
	* Removes entity from the processing list and pushes the slot as free
	* @returns {void}
	*/
    public __REMOVEENTITY(ent:Entity) : void
	{
		this.all_entities[ent.__SLOT_NUM] = null;
		delete this.id_to_entity[ent.__identifier];
		this.recently_free_slots.push(ent.__SLOT_NUM);
	}
	
	/**
	* Refreshes entity list with a new list. Safely refreshes cached open slots too.
	* @param {Array<Entity>} new_list - List that will become the new processing list once cleanup completes.
	* @returns {void}
	*/
    public REFRESH_ENTITY_LIST(new_list:Array<Entity>) : void
	{
		console.log("Refreshed entity list. " + Game.active_game.all_entities.length + " => " + new_list.length + " Diff: " + Math.abs(new_list.length - Game.active_game.all_entities.length));
		delete Game.active_game.all_entities;
		Game.active_game.all_entities = new_list;
		delete Game.active_game.recently_free_slots;
		Game.active_game.recently_free_slots = [];
	}
		
	/**
	* Gets an entity from a unique string ID. 
	* @param {string} identity_string - Entity's unique string id.
	* @returns {Entity}
	*/
	GET_ENTITY(identity_string:string) : Entity
	{
		if(identity_string == undefined || identity_string == null || Game.active_game.id_to_entity[identity_string] == undefined) return null;
		return Game.active_game.id_to_entity[identity_string];
	}
}
