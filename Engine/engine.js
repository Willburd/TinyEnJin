/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Launch logic, this is where everything STARTS! Create a render context, then get the game assets
// __INTERNAL_LOADING will wait until all assets have loaded, then call the game's defined __SETUP().
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
window.addEventListener("load", () => {
	// This is literally the first code that runs!
	__CREATE_RENDER_CONTEXT();
	__INTERNAL_LOADING();
})
/**
* Load assets, makes sure everything gets done instead of blindly trusting the page to be loaded instantly!
* @returns {null}
*/
const __INTERNAL_LOADING = () => {
	if(__IMGS_TOTAL > 0) console.log("Loading progress: " + __LOAD_PROGRESS());
	if(__IMGS_ERR > 0) 
	{
		console.log("Errors: " + __IMGS_ERR);
		return;
	}
	if(!__LOAD_ASSETS()) return requestAnimationFrame(__INTERNAL_LOADING);
	__SETUP(); // Must be defined in PROJECT
}
// Setup input handler
let previous_pressed_keys = new Set();
let pressed_keys = new Set();
const isKeyHeld = (key) => pressed_keys.has(key);
const isKeyPressed = (key) => (!previous_pressed_keys.has(key) && pressed_keys.has(key));
const isKeyReleased = (key) => (previous_pressed_keys.has(key) && !pressed_keys.has(key));
document.addEventListener('keydown', (e) => pressed_keys.add(e.key.toLowerCase()));
document.addEventListener('keyup', (e) => pressed_keys.delete(e.key.toLowerCase()));
__UPDATE_KEYPRESS = () => {
	if(previous_pressed_keys != null) delete previous_pressed_keys;
	previous_pressed_keys = new Set(pressed_keys);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Frame render loop. Where the game ACTUALLY updates. But much more often renders...
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let SHOW_FPS = true;
let fps = 1;
const times = [];
/**
* This loop goes on forever by requesting it to trigger next browser frame. This is not recursive, as it's schedualing a call instead of just calling.
* @param {number} currentTimeMs - The current requestAnimationFrame time that the frame is being called with. Used in deltatime calculation.
* @param {boolean} forced - If this function is called manually, this will need to be set to true to ignore deltatime likely missing the update tick.
* @returns {null}
*/
const __FRAME = (currentTimeMs, forced) => {
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
class Game 
{
	name = "";
	static active_game = null;
	static active_scene = null;

	__MODESTATE = GAMEMODE_BASIC;
	init_queue = [];
	all_entities = [];
	depth_sort = [];
	recently_free_slots = [];
	id_to_entity = {};
	
	__UPDATERATE = 60; // Updates per second, browser sets fps

	/**
	* Starts game and begins Update loop
	* @returns {null}
	*/
	__START() {
		if(Game.active_game != null)
		{
			console.error("MULTIPLE GAMES ATTEMPTED TO START");
			return
		}
		Game.active_game = this;
		this.__UPDATE_RATE_MS = 1000 / Game.active_game.__UPDATERATE;
		this.Init();
		requestAnimationFrame(__FRAME);
		return 1;
	};
	__UPDATE_RATE_MS = 0; 
	__PREVIOUS_UPDATE_MS = 0;
	loops = 0;

	/**
	* Ends game and destroys all scenes and entities
	* @returns {null}
	*/
	__STOP() {
		END_SCENE();
		DESTROY_ALL(TRUE,TRUE);
		active_game = null
	}

	/**
	* Custom Init code. Can be safely overridden.
	* @returns {null}
	*/
    Init() {
		return;
	};

	/**
	* Custom Update code. Can be safely overridden.
	* @returns {null}
	*/
    Update() {};

	/**
	* Sets the mode state of the game, can be used to give processing filter layers to entities. Such as entities that only process or render on a pause screen.
	* @returns {null}
	*/
    SetModeState(new_state) {
		this.__MODESTATE = new_state;
	};

	/**
	* Assigns core data to an entity, such as where it is in the processing list, and the callback ID.
	* @param {Entity} inti - Entity being constructed
	* @returns {null}
	*/
	__ENTITYINIT(inti) {
		// Use recently freed slots first
		let finder = Game.active_game.recently_free_slots.pop();
		if(finder == undefined)
		{
			finder = Game.active_game.all_entities.length;
			if(finder >= ENTITY_CAP)
				console.error("BREACHING ENTITY CAP: " + finder);
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
    __PROCESS() {
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
						if(enu.collider)
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
			if(Math.abs(Game.active_game.all_entities.length - new_list.length) >= ENTITY_LIST_REFRESH_THRESHOLD) REFRESH_ENTITY_LIST(new_list);
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
}
