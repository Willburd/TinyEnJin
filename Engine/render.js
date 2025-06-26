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
				if(DRAW_COLLIDERS && enr.collider) enr.collider.draw_collider(enr);
			});
		}
	});
	if(DRAW_STATIC_COLLIDERS && Game.active_scene.static_collision_map.length > 0)
	{
		for (let yy = 0; yy < Game.active_scene.static_collision_map.length; yy++) {
			let submap = Game.active_scene.static_collision_map[yy];
			if(submap != null && submap.length == 0) break;
			for (let xx = 0; xx < submap.length; xx++) {
				if(submap[xx] == 0) continue;

				let xpos = (xx * Game.active_scene.static_col_resolution) - Game.active_scene.view_x;
				let ypos = (yy * Game.active_scene.static_col_resolution) - Game.active_scene.view_y;

				ctx.beginPath();
				ctx.rect(xpos,
						ypos,
						Game.active_scene.static_col_resolution,
						Game.active_scene.static_col_resolution);
				ctx.fillStyle = "#ff0000BB";
				ctx.fill();
				ctx.lineWidth = 1;
				ctx.strokeStyle = "#00eeffBB";
				ctx.stroke();
				ctx.fillStyle = "#ffffffBB";
				ctx.fillText(submap[xx], xpos , ypos + Game.active_scene.static_col_resolution, Game.active_scene.static_col_resolution);
			}
		} 
	}
	return rendered_ents;
};