
let entities_created = 0;

class Entity 
{
	// Internal
	__destroyed = false;
	__canvas = null;
	PERSISTANT = false; // If it can surface destroy_all()

	// Core
	ent_name = "";
	id = 0;
	x = 0;
	y = 0;
	start_x = 0;
	start_y = 0;
	prev_x = 0;
	prev_y = 0;
	depth = 0;		// Draw depth, higher numbers Draw closer to the screen
	collider = null;

	// Drawing
	sprite = "";
	visible = true;
	image_xscale = 1;
	image_yscale = 1;
	align_v = 0;	// Center offset of sprite x
	align_h = 0;	// Center offset of sprite y
	image_angle = 0; // rotation in degrees to Draw at
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
		this.start_x = start_x;
		this.start_y = start_y;
		this.prev_x = start_x;
		this.prev_y = start_y;
		Game.active_game.init_queue.push(this);
		entities_created++;
	}

	// Custom Init
	OnInit() {};

	// Custom Update, in order
	EarlyUpdate() {};
	__INTERNAL_UPDATE() 
	{
		let len = AnimationLength(this.sprite)
		let frame_before = this.frame;
		this.frame += this.animation_speed;
		if(this.animation_speed > 0 && len > 0 && (Math.abs(this.frame) % len) <= (Math.abs(frame_before) % len)) this.OnAnimationLoop();
	};
	Update() {};
	LateUpdate() {};

	// Collision behavior
	OnCollision(other) {};

	// Custom Draw, in order
	EarlyDraw() {};
	Draw()
	{
		DrawEntity(this);
	};
	LateDraw() {
	};

	/// Custom cleanup, unloading is set during DESTROY_ALL or if outside of view edge and can be used to hid destruction effects, etc.
	OnDestroy(unloading) {};

	/// Triggers each time the animation loop reaches the length of it's animation. Only for built in animation_speed.
	OnAnimationLoop() {};

	/// Get the current x and y as a vector
	GetPosition() {
		return {x: this.x, y: this.y};
	};
}

class GameObj extends Entity 
{
	SPEED = {x: 0, y: 0}; // Automatic x/y movement, does not handle collision(yet?)
	VIEW_EDGE_LIMIT = -1; // If above 0, will be destroyed if it goes outside of the view + this as padding

	__INTERNAL_UPDATE()
	{
		super.__INTERNAL_UPDATE();
		this.prev_x = this.x;
		this.prev_y = this.y;
		this.x += this.SPEED.x;
		this.y += this.SPEED.y;
		if(this.VIEW_EDGE_LIMIT >= 0 && PointOutsideView(this.x,this.y,this.VIEW_EDGE_LIMIT)) DESTROY(this,true);
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
