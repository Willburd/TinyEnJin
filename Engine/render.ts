import { DRAW_STATIC_COLLIDERS, DRAW_COLLIDERS } from "./constants";
import { Game, fps, SHOW_FPS } from "./engine";
import { DrawStaticColliders } from "./collision";

export let main_canvas: HTMLCanvasElement;
export let ctx: CanvasRenderingContext2D;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Render setup and context creation
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Constructs the render context from the canvas.
 * @returns {void}
 */
export function __CREATE_RENDER_CONTEXT(): void {
	// Get the canvas from the webpage. Complains if it cannot, but if it fails you have worse to worry about.
	main_canvas = document.getElementById("main_surface") as HTMLCanvasElement;
	ctx = main_canvas.getContext("2d") as CanvasRenderingContext2D;
	if (!ctx) console.error("Failed to get the rendering context for 2D canvas");
}

/**
 * Renders each frame based on data in the game's current depth_sort array.
 * @returns {number} The number of entities rendered this frame
 */
export function __RENDER(): number {
	// Clear canvas
	ctx.clearRect(0, 0, main_canvas.width, main_canvas.height);
	ctx.beginPath();
	ctx.rect(0, 0, main_canvas.width, main_canvas.height);
	ctx.fillStyle = Game.active_scene.DefaultDrawColor();
	ctx.fill();

	let rendered_ents = 0;
	// Draw objects
	Game.active_game.GetRenderList().forEach((sub_array) => {
		if (sub_array.length > 0) {
			sub_array.forEach((enr) => {
				enr.EarlyDraw();
			});
			sub_array.forEach((enr) => {
				enr.Draw();
				rendered_ents++;
			});
			sub_array.forEach((enr) => {
				enr.LateDraw();
				if (DRAW_COLLIDERS && enr.GetColliders().length) {
					enr.GetColliders().forEach((collid) => {
						collid.DrawCollider(enr);
					});
				}
			});
		}
	});
	if (DRAW_STATIC_COLLIDERS) DrawStaticColliders();
	if (SHOW_FPS) __DRAWFPS();
	return rendered_ents;
}

const __DRAWFPS = () => {
	ctx.fillStyle = "#ffffffBB";
	ctx.fillText(fps.toString(), 4, 12, 12);
};
