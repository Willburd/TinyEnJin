import {GAMEMODE,DEPTH_DEFAULT} from "./constants";
import {Vector2} from "./vector";
import {ColliderPoint,CollisionData} from "./collision";
import {AnimationLength,DrawEntity,PointOutsideView} from "./tools";
import {DESTROY} from "./destroy";
import {ctx} from "./render";
import {Game} from "./engine";

export let entities_created: number = 0;

/**
* Gets the unique string id of the entity so it can be quickly referenced later by other entities.
* @param {Entity} ent - Entity to get the unique string id from.
* @returns {string} Entity's unique string id.
*/
export function GET_UNIQUE_ID(ent) : string
{
	if(ent == undefined || ent == null || ent.__destroyed) return null;
	return ent.__identifier;
}

export class Entity 
{
	// Internal
	__identifier: string = "";
	__SLOT_NUM: number = 0;
	__destroyed: boolean = false;
	__canvas = null;
	PERSISTANT: boolean = false; // If it can survive destroy_all(), allowing it to exist between scenes.
	PROCESSFLAGS: number = GAMEMODE.BASIC; // Bitflags that is used to check if this object processes during a frame. Such as if it processes while the game is paused.
	RENDERFLAGS: number = GAMEMODE.ALL; // Bitflags, as above, but when the object renders.

	// Core
	ent_name: string = "";
	position: Vector2 = new Vector2(0,0);
	start_position: Vector2 = new Vector2(0,0);
	prev_position: Vector2 = new Vector2(0,0);
	depth: number = DEPTH_DEFAULT;		// Draw depth, higher numbers Draw closer to the screen
	colliders: ColliderPoint[]|null = null;

	// Drawing
	sprite: string = "";
	visible: boolean = true;
	image_xscale: number = 1;
	image_yscale: number = 1;
	sprite_align: Vector2 = new Vector2(0,0); // Center offset of sprite
	image_angle: number = 0; // rotation in degrees to Draw at
	image_alpha: number = 1; // Transparency, with 1 being fully opaque

	// Animation
	animation_speed: number = 0;
	frame: number = 0;

	/**
	* Initilizes the entity to a base state.
	* @param {number} start_x - Entity's initial x position
	* @param {number} start_y - Entity's initial y position
	* @returns {void}
	*/
	constructor(start_x: number,start_y: number) 
	{
		// Onto creation!
		this.__canvas = ctx;
		this.position = new Vector2(start_x,start_y);
		this.start_position = new Vector2(start_x,start_y);
		this.prev_position = new Vector2(start_x,start_y);
		Game.active_game.__ADDENTITY(this);
		entities_created++;
	}

	/**
	* Custom Init code. Can be safely overridden.
	* @returns {void}
	*/
	OnInit() {};
	
	/**
	* Custom early update code. Can be safely overridden. Happens before an entity runs __INTERNAL_UPDATE();
	* @returns {void}
	*/
	EarlyUpdate() {};
	/**
	* Entity internal update. Handles processing of automatically adjusted vars, or functions called by an entity's state.
	* @returns {void}
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
	* @returns {void}
	*/
	Update() {};
	/**
	* Custom late update code. Can be safely overridden.
	* @returns {void}
	*/
	LateUpdate() {};

	/**
	* Collision behavior. Called when a collider overlaps or collides with other colliders, called seperately for each collision registered with each collider.
	* @param {CollisionData} collision_data - Data of the collision that happened.
	* @returns {void}
	*/
	OnCollision(collision_data: CollisionData) {};

	
	/**
	* Custom early draw code. Can be safely overridden.
	* @returns {void}
	*/
	EarlyDraw() {};
	/**
	* Custom draw code. Can be safely overridden. By default, it will draw the current sprite at the current x and y position. Use the depth variable to change an entity's draw order in relation to other entities.
	* @returns {void}
	*/
	Draw()
	{
		DrawEntity(this);
	};
	/**
	* Custom late draw code. Can be safely overridden.
	* @returns {void}
	*/
	LateDraw() {};

	/**
	* Custom cleanup, unloading is set during DESTROY_ALL or if outside of view edge and can be used to hid destruction effects, etc. Can be safely overridden.
	* @returns {void}
	*/
	OnDestroy(unloading: boolean) {};

	/**
	* Triggers each time the animation loop reaches the length of it's animation. Only for built in animation_speed. Can be safely overridden.
	* @returns {void}
	*/
	OnAnimationLoop() {};
}

class GameObj extends Entity 
{
	SPEED: Vector2 = new Vector2(0,0); // Automatic x/y movement, does not handle collision(yet?)
	VIEW_EDGE_LIMIT: number = -1; // If above 0, will be destroyed if it goes outside of the view + this as padding

	__INTERNAL_UPDATE()
	{
		super.__INTERNAL_UPDATE();
		this.prev_position = this.position.Copy();
		this.position.Add(this.SPEED);
		if(this.VIEW_EDGE_LIMIT >= 0 && PointOutsideView(this.position.x,this.position.y,this.VIEW_EDGE_LIMIT)) DESTROY(this,true);
	};
}

class Tile extends Entity 
{
	// Spot in tileset
	tx: number = 0;
	ty: number = 0;
	width: number = 0;
	hight: number = 0;
	
	constructor(start_x: number,start_y: number,spr: string,dep: number,tlx: number,tly: number,wid: number,hig: number) 
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
	constructor(start_x: number,start_y: number,spr,dep: number) 
	{
		super(start_x,start_y);
		this.sprite = spr;
		this.depth = dep;
	}
}
