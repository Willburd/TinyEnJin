/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Launch logic, this is where everything STARTS! Create a render context, then get the game assets
// __INTERNAL_LOADING will wait until all assets have loaded, then call the game's defined __SETUP().
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
window.addEventListener("load", () => {
	// This is literally the first code that runs!
	__CREATE_RENDER_CONTEXT();
	__INTERNAL_LOADING();
})
// Load assets, makes sure everything gets done instead of blindly trusting!
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
const pressedKeys = new Set();
const isKeyDown = (key) => pressedKeys.has(key);
document.addEventListener('keydown', (e) => pressedKeys.add(e.key.toLowerCase()));
document.addEventListener('keyup', (e) => pressedKeys.delete(e.key.toLowerCase()));

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Frame render loop. Where the game ACTUALLY updates. But much more often renders...
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const __FRAME = (currentTimeMs, forced) => {
    const deltaTimeMs = currentTimeMs - Game.active_game.previousTimeMs;
    if (deltaTimeMs >= Game.active_game.FRAME_INTERVAL_MS || forced) {
        Game.active_game.__PROCESS();
        const offset = deltaTimeMs % Game.active_game.FRAME_INTERVAL_MS;
        Game.active_game.previousTimeMs = currentTimeMs - offset;
    }
	if(Game.active_scene != null)
	{
		let rendered_ents = __RENDER();
		if(rendered_ents >= RENDER_WARNING_LIMIT) console.error("EXCESSIVE ENTITY RENDERING: " + rendered_ents);
	}
	requestAnimationFrame(__FRAME);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Core classes
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
class Game 
{
	static active_game = null;
	static active_scene = null;
	name = "";

	init_queue = [];
	all_entities = [];
	depth_sort = [];
	recently_free_slots = [];
	
	FRAME_INTERVAL_MS = 0;
	previousTimeMs = 0;
	loops = 0;

	/// View control
	view_x = 0;
	view_y = 0;

	/// Starts game and begins update loop
	__START() {
		this.FRAME_INTERVAL_MS = 1000 / 60;
		if(Game.active_game != null)
		{
			console.error("MULTIPLE GAMES ATTEMPTED TO START");
			return
		}
		Game.active_game = this;
		this.init();
		requestAnimationFrame(__FRAME);
		return 1;
	};

	__STOP() {
		END_SCENE();
		DESTROY_ALL(TRUE,TRUE);
		active_game = null
	}

	/// Custom init code
    init() {
		return 1;
	};

	/// Update game state
    __PROCESS() {
		// Create pending objects
		while(this.init_queue.length) {
			// Use recently freed slots first
			let inti = this.init_queue.pop();
			let finder = Game.active_game.recently_free_slots.pop();
			if(finder == undefined)
			{
				finder = Game.active_game.all_entities.length;
				if(finder >= ENTITY_CAP)
					console.error("BREACHING ENTITY CAP: " + finder);
			}
			//console.log(Game.active_game.recently_free_slots);
			Game.active_game.all_entities[finder] = inti;
			inti.id = finder;
			inti.on_init();
		}

		// Self update
		this.update();
		if(Game.active_scene) Game.active_scene.update();

		// Update objects
		let all_colliders = [];
		let processed_ents = 0;
		this.depth_sort = [];
		if(this.all_entities.length > 0)
		{
			this.all_entities.forEach(enu => {
				// Update early event
				if(enu != null && !enu.__destroyed)
				{
					enu.early_update();
				}	
			});
			this.all_entities.forEach(enu => {
				// Update main event
				if(enu != null && !enu.__destroyed)
				{
					enu.__INTERNAL_UPDATE();
					enu.update();
					processed_ents++;
				}
			});
			this.all_entities.forEach(enu => {
				// Update late event
				if(enu != null && !enu.__destroyed)
				{
					enu.late_update();
					if(!enu.__destroyed) // Check if late update destroyed us...
					{
						if(enu.visible)	
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
					}
				}
			});
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

	/// Custom update code
    update() {};
}