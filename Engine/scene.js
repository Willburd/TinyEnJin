START_SCENE = (new_scene) =>
{
    let old_scene = Game.active_scene;
    if(old_scene != null)
    {
        old_scene.on_destroy();
        if(new_scene != null) new_scene.on_transfer(old_scene);
    }
    Game.active_scene = new_scene;
    if(Game.active_scene) Game.active_scene.init();
    __FRAME(0,true);
}

class Scene {
    // View scrolling
    view_x = 0;
    view_y = 0;

	/// Custom init code
    init() {};

	/// Custom update code
    update() {};

    /// If this scene has unique logic when loading the next scene
    on_transfer(old_scene) {};

    on_destroy()
    {
        DESTROY_ALL(true, false);
    }
}