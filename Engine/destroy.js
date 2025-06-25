/// Destroy an entity
const DESTROY = (ent,unloading = false) => {
    if(ent.__destroyed)
        return
	// Removal
    Game.active_game.all_entities[ent.id] = null;
	Game.active_game.recently_free_slots.push(ent.id);
	// Cleanup
    ent.on_destroy(unloading);
    ent.id = -1;
    ent.__destroyed = true;
    ent.__canvas = null;
};

/// Destroy all entities
const DESTROY_ALL = (unloading,forced) => {
	Game.active_game.all_entities.forEach(element => {
		if(element != null && !element.__destroyed && (!element.PERSISTANT || forced)) DESTROY(element,unloading);
	});
	Game.active_game.recently_free_slots = []; // Purge
};