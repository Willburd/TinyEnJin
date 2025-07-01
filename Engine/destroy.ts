import {Entity} from "../Engine/entity";
import {Game} from "../Engine/engine";

export let entities_destroyed = 0;

/**
* Destroy an entity
* @param {Entity} ent - Entity being destroyed
* @param {boolean} unloading - Special condition for unloading. Useful if you don't want to spawn effects when an object is unloaded, vs destroyed in some other way like gameplay.
* @returns {void}
*/
export function DESTROY(ent:Entity,unloading:boolean = false): void
{
    if(ent.__destroyed)
        return
	// Removal
    Game.active_game.__REMOVEENTITY(ent);
	// Cleanup
	//console.log("DESTROY ENTITY: " + ent.__identifier + " slot: " + ent.__SLOT_NUM);
    ent.__SLOT_NUM = -1;
    ent.OnDestroy(unloading);
    if(ent.colliders != null) 
    {
        delete ent.colliders;
    }
    ent.colliders = null;
    ent.__destroyed = true;
    ent.__canvas = null;
    entities_destroyed++;
};

/**
* Destroy all entities
* @param {boolean} unloading - Special condition for unloading. Useful if you don't want to spawn effects when an object is unloaded, vs destroyed in some other way like gameplay.
* @param {boolean} forced - Forces all entities to be destroyed, including ones protected by PERSISTANT being true.
* @returns {void}
*/
export function DESTROY_ALL(unloading:boolean,forced:boolean) : void
{
    let new_list = [];
	Game.active_game.GetEntityList().forEach(element => {
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
    Game.active_game.REFRESH_ENTITY_LIST(new_list);
};