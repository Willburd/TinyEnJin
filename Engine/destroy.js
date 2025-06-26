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
    let new_list = [];
	Game.active_game.all_entities.forEach(element => {
        if(element != null && !element.__destroyed)
        {
            if(!element.PERSISTANT || forced)
            {
                DESTROY(element,unloading);
            }
            else
            {
                new_list.push(element);
            }
        }
	});
    // Wipe prior list state
    REFRESH_ENTITY_LIST(new_list);
};

/// Refreshes entity list with the new list. Safely refreshes cached open slots too.
const REFRESH_ENTITY_LIST = (new_list) => {
    console.log("Refreshed entity list. " + Game.active_game.all_entities.length + " => " + new_list.length + " Diff: " + Math.abs(new_list.length - Game.active_game.all_entities.length));
    Game.active_game.all_entities.length = 0;
    Game.active_game.all_entities = new_list;
    Game.active_game.recently_free_slots = [];
}