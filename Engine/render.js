let main_canvas;
let ctx;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Render setup and context creation
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const __CREATE_RENDER_CONTEXT = () =>
{
	// Get the canvas from the webpage. Complains if it cannot, but if it fails you have worse to worry about.
	main_canvas = document.getElementById("main_surface");
	ctx = main_canvas.getContext('2d');
	if (!ctx) console.error("Failed to get the rendering context for 2D canvas");
}

const __RENDER = () => {
	// Clear canvas
	ctx.clearRect(0, 0, main_canvas.width, main_canvas.height);

	let rendered_ents = 0;
	// Draw objects
	Game.active_game.depth_sort.forEach(sub_array => {
		if(sub_array.length > 0)
		{
			sub_array.forEach(enr => {
				enr.early_draw();
			});
			sub_array.forEach(enr => {
				enr.draw();
				rendered_ents++;
			});
			sub_array.forEach(enr => {
				enr.late_draw();
				if(DRAW_COLLIDERS && enr.collider) enr.collider.draw_collider(enr,);
			});
		}
	});
	return rendered_ents;
};