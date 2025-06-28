
let entities_created = 0;

/**
* Gets an entity from a unique string ID. 
* @param {string} identity_string - Entity's unique string id.
* @returns {Entity}
*/
const GET_ENTITY = (identity_string) => {
	if(identity_string == undefined || identity_string == null || Game.active_game.id_to_entity[identity_string] == undefined) return null;
	return Game.active_game.id_to_entity[identity_string];
}

/**
* Gets the unique string id of the entity so it can be quickly referenced later by other entities.
* @param {Entity} ent - Entity to get the unique string id from.
* @returns {string} Entity's unique string id.
*/
const GET_UNIQUE_ID = (ent) => {
	if(ent == undefined || ent == null || ent.__destroyed) return null;
	return ent.__identifier;
}

class Entity 
{
	// Internal
	__identifier = "";
	__SLOT_NUM = 0;
	__destroyed = false;
	__canvas = null;
	PERSISTANT = false; // If it can surface destroy_all()

	// Core
	ent_name = "";
	position = new Vector2(0,0);
	start_position = new Vector2(0,0);
	prev_position = new Vector2(0,0);
	depth = 0;		// Draw depth, higher numbers Draw closer to the screen
	collider = null;

	// Drawing
	sprite = "";
	visible = true;
	image_xscale = 1;
	image_yscale = 1;
	sprite_align = new Vector2(0,0); // Center offset of sprite
	image_angle = 0; // rotation in degrees to Draw at
	image_alpha = 1; // Transparency, with 1 being fully opaque

	// Animation
	animation_speed = 0;
	frame = 0;

	/**
	* Initilizes the entity to a base state.
	* @param {number} start_x - Entity's initial x position
	* @param {number} start_y - Entity's initial y position
	* @returns {null}
	*/
	constructor(start_x,start_y) 
	{
		// Onto creation!
		this.__canvas = ctx;
		this.position = new Vector2(start_x,start_y);
		this.start_position = new Vector2(start_x,start_y);
		this.prev_position = new Vector2(start_x,start_y);
		Game.active_game.init_queue.push(this);
		entities_created++;
	}

	/**
	* Custom Init code. Can be safely overridden.
	* @returns {null}
	*/
	OnInit() {};
	
	/**
	* Custom early update code. Can be safely overridden. Happens before an entity runs __INTERNAL_UPDATE();
	* @returns {null}
	*/
	EarlyUpdate() {};
	/**
	* Entity internal update. Handles processing of automatically adjusted vars, or functions called by an entity's state.
	* @returns {null}
	*/
	__INTERNAL_UPDATE() 
	{
		let len = AnimationLength(this.sprite)
		let frame_before = this.frame;
		this.frame += this.animation_speed;
		if(this.animation_speed > 0 && len > 0 && (Math.abs(this.frame) % len) <= (Math.abs(frame_before) % len)) this.OnAnimationLoop();
	};
	/**
	* Custom update code. Can be safely overridden.
	* @returns {null}
	*/
	Update() {};
	/**
	* Custom late update code. Can be safely overridden.
	* @returns {null}
	*/
	LateUpdate() {};

	/**
	* Collision behavior. Called when a collider overlaps with another collider at the end of a frame. This is checked after all objects have been processed.
	* @param {Entity} other - Other entity involved in the collision. Use "other instanceof ClassTypeHere" to identify specific entity types for complex logic. 
	* @returns {null}
	*/
	OnCollision(other) {};

	
	/**
	* Custom early draw code. Can be safely overridden.
	* @returns {null}
	*/
	EarlyDraw() {};
	/**
	* Custom draw code. Can be safely overridden. By default, it will draw the current sprite at the current x and y position. Use the depth variable to change an entity's draw order in relation to other entities.
	* @returns {null}
	*/
	Draw()
	{
		DrawEntity(this);
	};
	/**
	* Custom late draw code. Can be safely overridden.
	* @returns {null}
	*/
	LateDraw() {};

	/**
	* Custom cleanup, unloading is set during DESTROY_ALL or if outside of view edge and can be used to hid destruction effects, etc. Can be safely overridden.
	* @returns {null}
	*/
	OnDestroy(unloading) {};

	/**
	* Triggers each time the animation loop reaches the length of it's animation. Only for built in animation_speed. Can be safely overridden.
	* @returns {null}
	*/
	OnAnimationLoop() {};
}

class GameObj extends Entity 
{
	SPEED = new Vector2(0,0); // Automatic x/y movement, does not handle collision(yet?)
	VIEW_EDGE_LIMIT = -1; // If above 0, will be destroyed if it goes outside of the view + this as padding

	__INTERNAL_UPDATE()
	{
		super.__INTERNAL_UPDATE();
		this.prev_position = this.position.Copy();
		this.position.Merge(this.SPEED);
		if(this.VIEW_EDGE_LIMIT >= 0 && PointOutsideView(this.position.x,this.position.y,this.VIEW_EDGE_LIMIT)) DESTROY(this,true);
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
