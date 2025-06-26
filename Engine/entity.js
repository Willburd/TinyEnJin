class Entity 
{
	// Internal
	__destroyed = false;
	__canvas = null;
	PERSISTANT = false; // If it can surface destroy_all()

	// Core
	ent_name = "";
	id = 0;
	position = {x:0, y:0};
	x = 0;
	y = 0;
	depth = 0;		// Draw depth, higher numbers draw closer to the screen
	collider = null;

	// Drawing
	sprite = "";
	visible = true;
	image_xscale = 1;
	image_yscale = 1;
	align_v = 0;	// Center offset of sprite x
	align_h = 0;	// Center offset of sprite y
	image_angle = 0; // rotation in degrees to draw at
	image_alpha = 1; // Transparency, with 1 being fully opaque

	// Animation
	animation_speed = 0;
	frame = 0;

	constructor(start_x,start_y) 
	{
		// Onto creation!
		this.__canvas = ctx;
		this.x = start_x;
		this.y = start_y;
		Game.active_game.init_queue.push(this);
	}

	// Custom init
	on_init() {};

	// Custom update, in order
	early_update() {};
	__INTERNAL_UPDATE() 
	{
		let len = animation_length(this.sprite)
		let frame_before = this.frame;
		this.frame += this.animation_speed;
		if(this.animation_speed > 0 && len > 0 && (Math.abs(this.frame) % len) <= (Math.abs(frame_before) % len)) this.on_animation_loop();
	};
	update() {};
	late_update() {};

	// Collision behavior
	on_collision(other) {};

	// Custom draw, in order
	early_draw() {};
	draw()
	{
		draw_entity(this);
	};
	late_draw() {
	};

	/// Custom cleanup, unloading is set during DESTROY_ALL or if outside of view edge and can be used to hid destruction effects, etc.
	on_destroy(unloading) {};

	/// Triggers each time the animation loop reaches the length of it's animation. Only for built in animation_speed.
	on_animation_loop() {};
}

class GameObj extends Entity 
{
	SPEED = {x: 0, y: 0}; // Automatic x/y movement, does not handle collision(yet?)
	VIEW_EDGE_LIMIT = -1; // If above 0, will be destroyed if it goes outside of the view + this as padding

	__INTERNAL_UPDATE()
	{
		super.__INTERNAL_UPDATE();
		this.x += this.SPEED.x;
		this.y += this.SPEED.y;
		if(this.VIEW_EDGE_LIMIT >= 0 && point_outside_view(this.x,this.y,this.VIEW_EDGE_LIMIT)) DESTROY(this,true);
	};
}

class Tile extends Entity 
{
	// Spot in tileset
	tx = 0;
	ty = 0;
	width = 0;
	hight = 0;
	
	constructor(start_x,start_y,spr,dep,tlx,tly,wid,hig) 
	{
		super(start_x,start_y);
		this.sprite = spr;
		this.depth = dep;
		this.tx=tlx;
		this.ty=tly;
		this.width=wid;
		this.hight=hig;
	}
}

class Background extends Entity
{
	constructor(start_x,start_y,spr,dep) 
	{
		super(start_x,start_y);
		this.sprite = spr;
		this.depth = dep;
	}
}
