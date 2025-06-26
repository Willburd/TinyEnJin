const START_SCENE = (new_scene) =>
{
    let old_scene = Game.active_scene;
    if(old_scene != null)
    {
        old_scene.OnDestroy();
        if(new_scene != null) new_scene.OnTransfer(old_scene);
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

	/// Custom Init code
    Init() {};

	/// Custom Update code
    Update() {};

    /// If this scene has unique logic when loading the next scene
    OnTransfer(old_scene) {};

    OnDestroy()
    {
        DESTROY_ALL(true, false);
    }
}