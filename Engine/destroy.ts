import { Entity } from "./entity";
import { Game } from "./engine";

export let entities_destroyed = 0;

/**
 * Destroy all entities
 * @param {boolean} unloading - Special condition for unloading. Useful if you don't want to spawn effects when an object is unloaded, vs destroyed in some other way like gameplay.
 * @param {boolean} forced - Forces all entities to be destroyed, including ones protected by PERSISTANT being true.
 * @returns {void}
 */
export function DESTROY_ALL(unloading: boolean, forced: boolean): void {
	const new_list: Array<Entity> = [];
	Game.active_game.GetEntityList().forEach((element) => {
		if (element != null && !element.IsDestroyed()) {
			if (!element.PERSISTANT || forced) {
				element.DESTROY(unloading);
			} else {
				// Re-add to list, apply new ID
				element.AssignSlot(new_list.length);
				new_list.push(element);
			}
		}
	});
	// Wipe prior list state
	Game.active_game.REFRESH_ENTITY_LIST(new_list);
}
