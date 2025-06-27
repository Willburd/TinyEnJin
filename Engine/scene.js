/**
* Initilizes and prepares a scene object for processing. Must be called when creating a new scene instance. If this function is not called, the scene will not be transitioned to.
* @param {Scene} new_scene - Newly created Scene instance.
* @returns {null}
*/
const START_SCENE = (new_scene) =>
{
    let old_scene = Game.active_scene;
    if(old_scene != null)
    {
        let datapack = old_scene.OnDestroy(); // Called before we destroy everything.
        DESTROY_ALL(true, false);
        if(new_scene != null) new_scene.OnTransfer(old_scene,datapack);
        delete old_scene;
    }
    Game.active_scene = new_scene;
    if(Game.active_scene) Game.active_scene.Init();
    __FRAME(0,true);
}

class Scene {
    // View scrolling
    view_x = 0;
    view_y = 0;

    static_collision_map = []; // Collision 2d array for static collisions
    static_col_resolution = 16; // Pixels per collision index

	/**
	* Custom Init code. Can be safely overridden.
	* @returns {null}
	*/
    Init() {};

	/**
	* Custom Update code. Can be safely overridden.
	* @returns {null}
	*/
    Update() {};

	/**
	* If this scene has unique logic when loading the next scene. Entities from the prior scene will already have already been destroyed when this is called. See OnDestroy() for sending data of non-persistant objects between scenes. Can be safely overridden.
    * @param {Scene} old_scene - The previous scene, can be used to get the scene's state, or other related data.
    * @param {object} data - A custom object from the previous scene's OnDestroy() function. Can be used to transfer information on entities that existed in the scene, without devoting logic to do so in the scene itself.
	* @returns {null}
	*/
    OnTransfer(old_scene,data) {};

	/**
	* Called when a scene ends. Before all entities are destroyed. Can be used to collect information about the scene's state or entities before OnTransfer sends the data to the next scene. Can be safely overridden.
	* @returns {object} Optional data that will be sent to the 
	*/
    OnDestroy() 
    { 
        return {};
    };
}