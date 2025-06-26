const __RESOLVE_COLLISIONS = (caller,all_colliders) => {
	all_colliders.forEach(clu => {
		if(clu != caller && caller != null && !caller.__destroyed && !clu.__destroyed && caller.collider != null)
		{
			if(caller.collider.check_collider(caller,clu)) caller.on_collision(clu);
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

	check_collider(owner,other)
	{
		let x = owner.x + owner.collider.offset_x;
		let y = owner.y + owner.collider.offset_y;

		let otherx = other.x + other.collider.offset_x;
		let othery = other.y + other.collider.offset_y;

		// If we're not in this range don't bother with anything more complex
		if(!point_inside_circle(x,y,otherx,othery, (owner.collider.width + owner.collider.height + other.collider.width + other.collider.height) )) return false;

		switch(owner.collider.collider_type)
		{
			case COLLIDERTYPE_POINT:
				switch(other.collider.collider_type)
				{
					case COLLIDERTYPE_POINT:
						return Math.round(x) == Math.round(otherx) && Math.round(y) == Math.round(othery);
						
					case COLLIDERTYPE_RECTANGLE:
						return point_inside_rectangle(x,y, 
														otherx, othery, otherx + other.collider.width, othery + other.collider.height);

					case COLLIDERTYPE_CIRCLE:
						return point_inside_circle(x,y, 
													otherx, othery, other.collider.width);
				}
				return false;

			case COLLIDERTYPE_RECTANGLE:
				switch(other.collider.collider_type)
				{
					case COLLIDERTYPE_POINT:
						return point_inside_rectangle(otherx,othery, 
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
						return point_inside_circle(otherx,othery, 
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

	draw_collider(owner)
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