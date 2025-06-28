let entities_destroyed = 0;

/**
* Destroy an entity
* @param {Entity} ent - Entity being destroyed
* @param {boolean} unloading - Special condition for unloading. Useful if you don't want to spawn effects when an object is unloaded, vs destroyed in some other way like gameplay.
* @returns {null}
*/
const DESTROY = (ent,unloading = false) => {
    if(ent.__destroyed)
        return
	// Removal
    Game.active_game.all_entities[ent.__SLOT_NUM] = null;
    delete Game.active_game.id_to_entity[ent.__identifier];
	Game.active_game.recently_free_slots.push(ent.__SLOT_NUM);
	// Cleanup
	//console.log("DESTROY ENTITY: " + ent.__identifier + " slot: " + ent.__SLOT_NUM);
    ent.__SLOT_NUM = -1;
    ent.OnDestroy(unloading);
    if(ent.collider != null) delete ent.collider;
    ent.collider = null;
    ent.__destroyed = true;
    ent.__canvas = null;
    delete ent;
    entities_destroyed++;
};

/**
* Destroy all entities
* @param {boolean} unloading - Special condition for unloading. Useful if you don't want to spawn effects when an object is unloaded, vs destroyed in some other way like gameplay.
* @param {boolean} forced - Forces all entities to be destroyed, including ones protected by PERSISTANT being true.
* @returns {null}
*/
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
                // Re-add to list, apply new ID
                element.__SLOT_NUM = new_list.length;
                new_list.push(element);
            }
        }
	});
    // Wipe prior list state
    REFRESH_ENTITY_LIST(new_list);
};

/**
* Refreshes entity list with a new list. Safely refreshes cached open slots too.
* @param {Array<Entity>} new_list - List that will become the new processing list once cleanup completes.
* @returns {null}
*/
const REFRESH_ENTITY_LIST = (new_list) => {
    console.log("Refreshed entity list. " + Game.active_game.all_entities.length + " => " + new_list.length + " Diff: " + Math.abs(new_list.length - Game.active_game.all_entities.length));
    Game.active_game.all_entities.length = 0;
    Game.active_game.all_entities = new_list;
    Game.active_game.recently_free_slots = [];
}