import {GAMEMODE,DEPTH_DEFAULT} from "./constants";
import {Vector2} from "./vector";
import {ColliderPoint,CollisionData} from "./collision";
import {AnimationLength,DrawEntity,PointOutsideView} from "./tools";
import {entities_destroyed} from "./destroy";
import {ctx} from "./render";
import {Game} from "./engine";
import * as TL from "../Engine/tools";

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
	private __identifier: string = "";
	public GetIdentifier() : string {return this.__identifier;};
	private __canvas = null;
	public PERSISTANT: boolean = false; // If it can survive destroy_all(), allowing it to exist between scenes.
	
	// Core
	public ent_name: string = "";
	public position: Vector2 = new Vector2(0,0);
	public start_position: Vector2 = new Vector2(0,0);
	public prev_position: Vector2 = new Vector2(0,0);
	public depth: number = DEPTH_DEFAULT;		// Draw depth, higher numbers Draw closer to the screen

	// Drawing
	public sprite: string = "";
	public visible: boolean = true;
	public image_xscale: number = 1;
	public image_yscale: number = 1;
	public sprite_align: Vector2 = new Vector2(0,0); // Center offset of sprite
	public image_angle: number = 0; // rotation in degrees to Draw at
	public image_alpha: number = 1; // Transparency, with 1 being fully opaque

	// Animation
	public animation_speed: number = 0;
	public frame: number = 0;

	// Processing State
	public PROCESSFLAGS: number = GAMEMODE.BASIC; // Bitflags that is used to check if this object processes during a frame. Such as if it processes while the game is paused.
	public RENDERFLAGS: number = GAMEMODE.ALL; // Bitflags, as above, but when the object renders.
	private __SLOT_NUM: number = 0;
	public AssignSlot(slot:number) {this.__SLOT_NUM = slot}; // Do not call unless you know what you are doing.
	public GetProcessSlot() : number {return this.__SLOT_NUM;};

	// Collision
	protected colliders: ColliderPoint[]|null = null;
	public GetColliders() : ColliderPoint[] {return this.colliders == null ? [] : this.colliders;};

	// Destruction
	private __destroyed: boolean = false;	
	/**
	* Destroy an entity
	* @param {Entity} ent - Entity being destroyed
	* @param {boolean} unloading - Special condition for unloading. Useful if you don't want to spawn effects when an object is unloaded, vs destroyed in some other way like gameplay.
	* @returns {void}
	*/
	public DESTROY(unloading:boolean = false) : void 
	{
		if(this.__destroyed == true) return;
		//console.log("DESTROY ENTITY: " + ent.__identifier + " slot: " + ent.__SLOT_NUM);
		this.OnDestroy(unloading);
		Game.active_game.__REMOVEENTITY(this);
		Game.entities_destroyed++;
		this.__destroyed = true
		this.__SLOT_NUM = -1;
		this.__canvas = null;
		if(this.colliders != null) 
		{
			delete this.colliders;
		}
		this.colliders = null;
	};
	public IsDestroyed() : boolean {return this.__destroyed;};

	/**
	* Initilizes the entity to a base state.
	* @param {number} start_x - Entity's initial x position
	* @param {number} start_y - Entity's initial y position
	*/
	constructor(start_x: number,start_y: number)
	{
		// Onto creation!
		this.__canvas = ctx;
		this.position = new Vector2(start_x,start_y);
		this.start_position = new Vector2(start_x,start_y);
		this.prev_position = new Vector2(start_x,start_y);
		Game.active_game.__ADDENTITY(this);
		Game.entities_created++;
	}

	/**
	* Custom Init code. Can be safely overridden.
	* @returns {void}
	*/
	__INTERNAL_INIT(new_slot:number) : void
	{
		this.__SLOT_NUM = new_slot;
		this.__identifier = btoa(TL.Rand(1,999999999).toString() + Game.active_game.__PREVIOUS_UPDATE_MS.toString() + Game.entities_created.toString() + Game.entities_destroyed.toString());
		this.OnInit();
	};

	/**
	* Custom Init code. Can be safely overridden.
	* @returns {void}
	*/
	protected OnInit() : void {};
	
	/**
	* Custom early update code. Can be safely overridden. Happens before an entity runs __INTERNAL_UPDATE();
	* @returns {void}
	*/
	public EarlyUpdate() {};
	/**
	* Entity internal update. Handles processing of automatically adjusted vars, or functions called by an entity's state.
	* @returns {void}
	*/
	public __INTERNAL_UPDATE() 
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
	public Update() : void {};
	/**
	* Custom late update code. Can be safely overridden.
	* @returns {void}
	*/
	public LateUpdate() : void {};

	/**
	* Collision behavior. Called when a collider overlaps or collides with other colliders, called seperately for each collision registered with each collider.
	* @param {CollisionData} collision_data - Data of the collision that happened.
	* @returns {void}
	*/
	public OnCollision(collision_data: CollisionData) : void {};

	
	/**
	* Custom early draw code. Can be safely overridden.
	* @returns {void}
	*/
	public EarlyDraw() : void {};
	/**
	* Custom draw code. Can be safely overridden. By default, it will draw the current sprite at the current x and y position. Use the depth variable to change an entity's draw order in relation to other entities.
	* @returns {void}
	*/
	public Draw() : void
	{
		DrawEntity(this);
	};
	/**
	* Custom late draw code. Can be safely overridden.
	* @returns {void}
	*/
	public LateDraw() : void {};

	/**
	* Custom cleanup, unloading is set during DESTROY_ALL or if outside of view edge and can be used to hid destruction effects, etc. Can be safely overridden.
	* @returns {void}
	*/
	protected OnDestroy(unloading: boolean) : void {};

	/**
	* Triggers each time the animation loop reaches the length of it's animation. Only for built in animation_speed. Can be safely overridden.
	* @returns {void}
	*/
	protected OnAnimationLoop() {};
}

export class GameObj extends Entity 
{
	SPEED: Vector2 = new Vector2(0,0); // Automatic x/y movement, does not handle collision(yet?)
	VIEW_EDGE_LIMIT: number = -1; // If above 0, will be destroyed if it goes outside of the view + this as padding

	__INTERNAL_UPDATE()
	{
		super.__INTERNAL_UPDATE();
		this.prev_position = this.position.Copy();
		this.position.Add(this.SPEED);
		if(this.VIEW_EDGE_LIMIT >= 0 && PointOutsideView(this.position.x,this.position.y,this.VIEW_EDGE_LIMIT)) this.DESTROY(true);
	};
}

export class Tile extends Entity 
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

export class Background extends Entity
{
	constructor(start_x: number,start_y: number,spr,dep: number) 
	{
		super(start_x,start_y);
		this.sprite = spr;
		this.depth = dep;
	}
}
