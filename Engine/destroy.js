let entities_destroyed = 0;

/// Destroy an entity
const DESTROY = (ent,unloading = false) => {
    if(ent.__destroyed)
        return
	// Removal
    Game.active_game.all_entities[ent.id] = null;
	Game.active_game.recently_free_slots.push(ent.id);
	// Cleanup
    ent.OnDestroy(unloading);
    ent.id = -1;
    if(ent.collider != null) delete ent.collider;
    ent.collider = null;
    ent.__destroyed = true;
    ent.__canvas = null;
    delete ent;
    entities_destroyed++;
};

/// Destroy all entities
const DESTROY_ALL = (unloading,forced) => {
	Game.active_game.all_entities.forEach(element => {
		if(element != null && !element.__destroyed && (!element.PERSISTANT || forced)) DESTROY(element,unloading);
	});
	Game.active_game.recently_free_slots = []; // Purge
};