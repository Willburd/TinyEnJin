/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Dynamic collisions
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Internal collision resolution
 * @param {Entity} caller
 * @param {Array<Entity>} all_colliders
 * @returns {null}
 */
const __RESOLVE_COLLISIONS = (caller,all_colliders) => {
	// Dynamic collisions. Static collisions are handled in Update() manually.
	if(caller == null) return;
	if(all_colliders.length <= 1) return;
	all_colliders.forEach(clu => {
		if(clu != caller && !caller.__destroyed && !clu.__destroyed && caller.collider != null)
		{
			if(caller.collider.CheckCollider(caller,clu)) caller.OnCollision(clu);
		}
	});
};

class ColliderPoint
{
	collider_type = COLLIDERTYPE_POINT;
	
	offset_x = 0;
	offset_y = 0;
	width = 0;
	height = 0;

	constructor(xoff,yoff,wid,hig)
	{
		this.offset_x = xoff;
		this.offset_y = yoff;
		if(wid != undefined) this.width = wid;
		if(hig != undefined) this.height = hig;
	}

	/**
	* @param {Entity} owner
	* @param {Entity} other
	* @returns {boolean}
	*/
	CheckCollider(owner,other)
	{
		let x = owner.x + owner.collider.offset_x;
		let y = owner.y + owner.collider.offset_y;

		let otherx = other.x + other.collider.offset_x;
		let othery = other.y + other.collider.offset_y;

		// If we're not in this range don't bother with anything more complex
		if(!PointInsideCircle(x,y,otherx,othery, (owner.collider.width + owner.collider.height + other.collider.width + other.collider.height) )) return false;

		switch(owner.collider.collider_type)
		{
			case COLLIDERTYPE_POINT:
				switch(other.collider.collider_type)
				{
					case COLLIDERTYPE_POINT:
						return Math.round(x) == Math.round(otherx) && Math.round(y) == Math.round(othery);
						
					case COLLIDERTYPE_RECTANGLE:
						return PointInsideRectangle(x,y, 
														otherx, othery, otherx + other.collider.width, othery + other.collider.height);

					case COLLIDERTYPE_CIRCLE:
						return PointInsideCircle(x,y, 
													otherx, othery, other.collider.width);
				}
				return false;

			case COLLIDERTYPE_RECTANGLE:
				switch(other.collider.collider_type)
				{
					case COLLIDERTYPE_POINT:
						return PointInsideRectangle(otherx,othery, 
														x, y, x + owner.collider.width, y + owner.collider.height);

					case COLLIDERTYPE_RECTANGLE:
						return rectangle_inside_rectangle(x, y, x + owner.collider.width, y + owner.collider.height, 
															otherx, othery, otherx + other.collider.width, othery + other.collider.height);

					case COLLIDERTYPE_CIRCLE:
						return rectangle_inside_circle(x, y, x + owner.collider.width, y + owner.collider.height, 
														otherx, othery, other.collider.width);
				}
				return false;

			case COLLIDERTYPE_CIRCLE: // CIRCLE
				switch(other.collider.collider_type)
				{
					case COLLIDERTYPE_POINT:
						return PointInsideCircle(otherx,othery, 
													x, y, owner.collider.width);

					case COLLIDERTYPE_RECTANGLE: // vs SQUARE
						return rectangle_inside_circle(otherx, othery, otherx + other.collider.width, othery + other.collider.height, 
														x, y, owner.collider.width);

					case COLLIDERTYPE_CIRCLE: // vs CIRCLE
						return circle_inside_circle(otherx,othery,other.collider.width,
														x,y, owner.collider.width);
				}
				return false;
		}
	}

	/**
	* @param {Entity} owner
	* @returns {null}
	*/
	DrawCollider(owner)
	{
		let x = owner.x + this.offset_x - Game.active_scene.view_x;
		let y = owner.y + this.offset_y - Game.active_scene.view_y;

		switch(this.collider_type)
		{
			case COLLIDERTYPE_POINT:
				ctx.beginPath();
				ctx.arc(x, y, 0.5, 0, 2 * Math.PI);
				ctx.fillStyle = "#ff0000BB";
				ctx.fill();
				ctx.lineWidth = 1;
				ctx.strokeStyle = "#00ff00BB";
				ctx.stroke();
				break;

			case COLLIDERTYPE_RECTANGLE:
				ctx.beginPath();
				ctx.rect(x, y, this.width, this.height);
				ctx.fillStyle = "#ff0000BB";
				ctx.fill();
				ctx.lineWidth = 1;
				ctx.strokeStyle = "#00ff00BB";
				ctx.stroke();
				break;

			case COLLIDERTYPE_CIRCLE:
				ctx.beginPath();
				ctx.arc(x, y, this.width, 0, 2 * Math.PI);
				ctx.fillStyle = "#ff0000BB";
				ctx.fill();
				ctx.lineWidth = 1;
				ctx.strokeStyle = "#00ff00BB";
				ctx.stroke();
				break;
		}
	}
}

class ColliderRectangle extends ColliderPoint
{
	collider_type = COLLIDERTYPE_RECTANGLE;
}

class ColliderCircle extends ColliderPoint
{
	collider_type = COLLIDERTYPE_CIRCLE;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Static collision map
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
* Gets the static collision data of a point in the world
* @param {number} x
* @param {number} y
* @returns {any}
*/
const GetStaticCollision = (x,y) =>
{
	if(Game.active_scene == null || Game.active_scene.static_collision_map.length <= 0) return 0;
	if(y >= Game.active_scene.static_collision_map.length) return 0;
	let submap = Game.active_scene.static_collision_map[y];
	if(submap == null || submap.length <= 0) return 0;
	if(x >= submap.length) return 0;
	return submap[x];
}

/**
* Draws the static collision array, useful for testing tilesets, but too laggy to be used in actual gameplay.
* @returns {null}
*/
const DrawStaticColliders = () => {
	if(Game.active_scene.static_collision_map.length > 0)
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
}