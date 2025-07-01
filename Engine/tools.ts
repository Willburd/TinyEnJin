import {BLENDMODE} from "./constants";
import {Game,isKeyHeld} from "./engine";
import {sprite_data,__DRAWSPRITE} from "./sprites";
import {main_canvas} from "./render";
import {Vector2} from "./vector";
import {Entity} from "./entity";

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Proximity
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
* Locks a point inside of a rectangle from top left to bottom right.
* @param {number} x - point's x.
* @param {number} y - point's y.
* @param {number} tlx - top left x boundary.
* @param {number} tly - top left y boundary.
* @param {number} brx - bottom right x boundary.
* @param {number} bry - bottom right y boundary.
* @returns {Vector2}
*/
export function ConstrainPoint(x:number,y:number,tlx:number,tly:number,brx:number,bry:number) : Vector2 
{
    let pr = new Vector2(x,y);
    if(x < tlx) pr.x = tlx;
    if(x > brx) pr.x = brx;
    if(y < tly) pr.y = tly;
    if(y > bry) pr.y = bry;
    return pr;
}

/**
* Same as ConstrainPoint, but uses the current object's x and y, and returns their constrained position.
* @param {Entity} ent - The entity to constrain.
* @param {number} tlx - top left x boundary.
* @param {number} tly - top left y boundary.
* @param {number} brx - bottom right x boundary.
* @param {number} bry - bottom right y boundary.
* @returns {Vector2}
*/
export function ConstrainEntity(ent:Entity,tlx:number,tly:number,brx:number,bry:number) : Vector2 {
    return ConstrainPoint(ent.position.x,ent.position.y,tlx,tly,brx,bry);
}

/**
* Gets the distance between two points. The distance will never be under 0 regardless of input.
* @param {number} x1 - First point's x position.
* @param {number} y1 - First point's y position.
* @param {number} x2 - Second point's x position.
* @param {number} y2 - Second point's y position.
* @returns {number} Distance between the points.
*/
export function PointDistance(x1:number,y1:number,x2:number,y2:number) : number
{
    return Math.abs(Math.sqrt( ((x1 - x2) ** 2) + ((y1 - y2) ** 2))); // Pythag!
}

/**
* Gets the value between two values, using a percent between them.
* @param {number} start - the start value
* @param {number} end - the end value
* @param {number} percent - the percent between the two points, with 0 returning the start, 1 returning the end, and 0.5 being halfway between them.
* @returns {number}
*/
export function Lerp(start: number, end: number, percent: number) : number
{
    return (start * (1 - percent)) + (end * percent);
}

/**
* Gets a value rounded to a multiple of the incriment provided. ex: rounding to 10 means 8 will round up to 10, or 3 to 0.
* @param {number} val - The value being rounded.
* @param {number} round - the incriment to round to.
* @returns {number}
*/
export function RoundToIncriment(val,round) : number
{
    return Math.round(val / round) * round;
}

/**
* Gets a value floored to a multiple of the incriment provided. ex: rounding to 10 means 8 will round up to 10, or 3 to 0.
* @param {number} val - The value being floored.
* @param {number} round - the incriment to floored to.
* @returns {number}
*/
export function FloorToIncriment(val,round) : number 
{
    return Math.floor(val / round) * round;
}

/**
* Gets a value ceil to a multiple of the incriment provided. ex: rounding to 10 means 8 will round up to 10, or 3 to 0.
* @param {number} val - The value being ceil.
* @param {number} round - the incriment to ceil to.
* @returns {number}
*/
export function CeilToIncriment(val,round) :  number
{
    return Math.ceil(val / round) * round;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Collision
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
* If a point is within a rectangle from top left to bottom right, return true
* @param {number} x - point's x.
* @param {number} y - point's y.
* @param {number} tlx - rectangle's top left x boundary.
* @param {number} tly - rectangle's top left y boundary.
* @param {number} brx - rectangle's bottom right x boundary.
* @param {number} bry - rectangle's bottom right y boundary.
* @returns {boolean} If the point is within the rectangle.
*/
export function PointInsideRectangle(x,y,tlx,tly,brx,bry) : boolean
{
    if(x <= tlx || x >= brx || y <= tly || y >= bry) return false;
    return true;
}

/**
* If a rectangle is within the bounds of another other rectangle, return true.
* @param {number} tlx - rectangle's top left x boundary.
* @param {number} tly - rectangle's top left y boundary.
* @param {number} brx - rectangle's bottom right x boundary.
* @param {number} bry - rectangle's bottom right y boundary.
* @param {number} tlx2 - other rectangle's top left x boundary.
* @param {number} tly2 - other rectangle's top left y boundary.
* @param {number} brx2 - other rectangle's bottom right x boundary.
* @param {number} bry2 - other rectangle's bottom right y boundary.
* @returns {boolean} If the rectangles overlap.
*/
export function rectangle_inside_rectangle(tlx,tly,brx,bry,tlx2,tly2,brx2,bry2) : boolean
{
    let center_x = tlx + ((brx - tlx)*0.5);
    let center_y = tly + ((bry - tly)*0.5);
    if(PointInsideRectangle(center_x,center_y,tlx2,tly2,brx2,bry2)) return true; // Center
    if(PointInsideRectangle(tlx,tly,tlx2,tly2,brx2,bry2)) return true; // TL
    if(PointInsideRectangle(brx,tly,tlx2,tly2,brx2,bry2)) return true; // TR
    if(PointInsideRectangle(tlx,bry,tlx2,tly2,brx2,bry2)) return true; // BL
    if(PointInsideRectangle(brx,bry,tlx2,tly2,brx2,bry2)) return true; // BR
    return false;
}

/**
* If any points of a rectangle are within the radius of the circle, return true
* @param {number} tlx - rectangle's top left x boundary.
* @param {number} tly - rectangle's top left y boundary.
* @param {number} brx - rectangle's bottom right x boundary.
* @param {number} bry - rectangle's bottom right y boundary.
* @param {number} cx - the x position of the circle;
* @param {number} cy - the y position of the circle;
* @param {number} rad - the radius of the circle
* @returns {boolean} If the rectangle and circle overlap.
*/
export function rectangle_inside_circle(tlx,tly,brx,bry,cx,cy,rad) : boolean
{
    if(PointInsideRectangle(cx,cy,tlx,tly,brx,bry)) return true; // Center
    if(PointInsideCircle(tlx,tly,cx,cy,rad)) return true; // TL
    if(PointInsideCircle(brx,tly,cx,cy,rad)) return true; // TR
    if(PointInsideCircle(tlx,bry,cx,cy,rad)) return true; // BL
    if(PointInsideCircle(brx,bry,cx,cy,rad)) return true; // BR
    return false;
}

/**
* If a point is within the radius of the circle, return true
* @param {number} x - point's x.
* @param {number} y - point's y.
* @param {number} cx - the x position of the circle;
* @param {number} cy - the y position of the circle;
* @param {number} rad - the radius of the circle
* @returns {boolean} If the point overlaps the circle
*/
export function PointInsideCircle(x,y,cx,cy,rad) : boolean
{
    return PointDistance(x,y,cx,cy) <= rad;
}

/**
* If the circle overlaps with the radius of the other circle, return true
* @param {number} cx - the x position of the circle;
* @param {number} cy - the y position of the circle;
* @param {number} rad - the radius of the circle
* @param {number} cx2 - the x position of the other circle;
* @param {number} cy2 - the y position of the other circle;
* @param {number} rad2 - the radius of the other circle
* @returns {boolean} If the circles overlap
*/
export function circle_inside_circle(cx,cy,rad,cx2,cy2,rad2) : boolean
{
    return PointInsideCircle(cx,cy,cx2,cy2,rad + rad2);
}

/**
* If a point is inside the game's view. A padding may be specified.
* @param {number} x - point's x.
* @param {number} y - point's y.
* @param {number} pad - A padding distance around the view, that is considered to still be inside of the view.
* @returns {boolean} If the point is within the view or the padding specified.
*/
export function PointInsideView(x,y,pad) : boolean
{
    return PointInsideRectangle(x,y, Game.active_scene.view_position.x - pad, Game.active_scene.view_position.y - pad, Game.active_scene.view_position.x + ViewWidth() + pad, Game.active_scene.view_position.y + ViewHeight() + pad);
}

/**
* If a point is outside the game's view. A padding may be specified.
* @param {number} x - point's x.
* @param {number} y - point's y.
* @param {number} pad - A padding distance around the view, that is considered to still be inside of the view.
* @returns {boolean} If the point is outside the view and the padding specified.
*/
export function PointOutsideView(x,y,pad) : boolean
{
    return !PointInsideView(x,y,pad);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Direction
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
* Get the angle from point1 to point2 in degrees from 0 to 360.
* @param {number} x1 - First point's x position.
* @param {number} y1 - First point's y position.
* @param {number} x2 - Second point's x position.
* @param {number} y2 - Second point's y position.
* @returns {number} Angle from the first point to the second in degrees.
*/
export function FindAngle(x1,y1,x2,y2) : number
{
    return (360 + (Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI)) % 360; // ALWAYS positive!
}

/**
* Get the angle from point1 to point2 in degrees from 0 to 360.
* @param {Vector2} vec1 - First point's position.
* @param {Vector2} vec2 - Second point's position.
* @returns {number} Angle from the first point to the second in degrees.
*/
export function FindVectorAngle(vec1, vec2) : number
{
    return FindAngle(vec1.x,vec1.y,vec2.x,vec2.y);
}

/**
* Returns an angle from 0 to 360 from the position to the entity's x/y. 
* @param {number} x1 - First point's x position.
* @param {number} y1 - First point's y position.
* @param {Entity} ent - Entity to use the position of.
* @returns {number} Angle from the first point to the entity's position. If it is unable to find an angle it will return -1
*/
export function AngleTo(x,y,ent) : number
{
    if(ent == null) return -1;
    return FindAngle(x,y,ent.position.x,ent.position.y); 
}

/**
* Get a new position from an angle and distance specified.
* @param {number} angle - The angle that will be used to calculate the new position.
* @param {number} distance - The distance to move along the angle provided.
* @returns {Vector2}
*/
export function MoveToward(angle,distance) : Vector2
{
    if(angle < 0) return new Vector2(0,0);
    if(distance == 0) return new Vector2(0,0);
    let dir = angle / (180 / Math.PI);
    return new Vector2(Math.cos(dir) * distance, Math.sin(dir) * distance);
}

/**
* Gets a normalized vector based on the angle provided
* @param {number} angle - angle to create a vector from.
* @returns {Vector2}
*/
export function VectorFromAngle(angle) : Vector2
{
    return MoveToward(angle,1);
}

/**
* Snaps input angle to a multiple of the snap angle provided. ex: snapping to every 45 degree angle.
* @param {number} angle - The source angle.
* @param {number} snap - The angle incriments that will be used to round the source angle.
* @returns {number} The source angle rounded to the nearest incriment of the snap angle provided.
*/
export function AngleSnap(angle, snap) : number
{
    return (Math.round(angle / snap) * snap);
}

/**
* Returns an index from 0 to the max specified, based on the angle input. Intended for turning angles into frame number in a rotation animation.
* @param {number} angle - The source angle.
* @param {number} max_index - The max number of segments desired. Usually the maximum number of rotation frames.
* @returns {number} The current index from 0 to max_index that the angle would be if converted from degrees to segments.
*/
export function AngleToIndex(angle, max_index) : number
{
    let angle_per_index = 360 / max_index;
    return (Math.round(angle / angle_per_index));
}

/**
* Returns an index from 0 to the max specified, based on the angle input. Intended for turning angles into frame number in a rotation animation.
* @param {string} upkey Up keyboard key.
* @param {string} downkey Down keyboard key.
* @param {string} leftkey Left keyboard key.
* @param {string} rightkey Right keyboard key.
* @returns {Vector2} A non-normalized vector representing the current inputs of up down left and right.
*/
export function GetInputVector(upkey:string,downkey:string,leftkey:string,rightkey:string) : Vector2
{
    let UD = (isKeyHeld(downkey) ? 1 : 0) - (isKeyHeld(upkey) ? 1 : 0) ;
    let LR = (isKeyHeld(rightkey) ? 1 : 0)  - (isKeyHeld(leftkey) ? 1 : 0) ;
    return new Vector2( LR, UD);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Drawing sprites
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
* Get the width of the game's viewport
* @returns {number}
*/
export function ViewWidth() : number
{
    return main_canvas.width
}
/**
* Get the height of the game's viewport
* @returns {number}
*/
export function ViewHeight() : number
{
    return main_canvas.height
}

/**
* Draws an entity using it's current properties.
* @param {Entity} ent - The source entity to draw.
* @returns {void}
*/
export function DrawEntity(ent)
{
    __DRAWSPRITE(ent.__canvas,ent.sprite,ent.frame,
                ent.position.x,
                ent.position.y,
                ent.image_alpha,
                ent.image_xscale,ent.image_yscale,
                ent.sprite_align.x,ent.sprite_align.y,
                ent.image_angle);
}

/**
* Draws an arbitrary sprite to the canvas specified.
* @param {Canvas} draw_canvas - Canvas context to draw to.
* @param {string} spr - text ID of the sprite to draw.
* @param {number} frame - Frame index of an animation. Loops if a number larger than the animation length is provided.
* @param {number} x - The x position to draw the sprite.
* @param {number} y - The y position to draw the sprite.
* @param {number} alpha - A percent between 0 and 1 that controls the transparency of the sprite being drawn. Defaults to 1.
* @param {number} xscale - The x scale multiplier. Defaults to 1.
* @param {number} yscale - The y scale multiplier. Defaults to 1.
* @param {number} align_h - The x offset of the sprite, from the object's x position.
* @param {number} align_v - The y offset of the sprite, from the object's y position.
* @param {number} angle - The angle the sprite is drawn at. (CURRENTLY WIP)
* @returns {void}
*/
export function DrawSprite(draw_canvas: CanvasRenderingContext2D,spr: string,frame: number,x: number,y: number,alpha: number = 1, xscale: number = 1, yscale: number = 1, align_h: number = 0,align_v: number = 0,angle: number = 0)
{
    __DRAWSPRITE(draw_canvas,spr,frame,
                x,
                y,
                alpha,
                xscale,yscale,
                align_h,align_v,
                angle);
}

/**
* Gets length of a sprite's animation
* @param {string} spr - The string id of the sprite.
* @returns {number} The length of the sprite's animation in frames.
*/
export function AnimationLength(spr:string) : number
{
	if(spr == "")
		return 0;
	let data = sprite_data[spr];
	return data.anim_length;
}

/**
* Changing the blending mode globally, pass no arguments to reset it
* @param {BLENDMODE} new_mode - BLENDMODE constant that will be the new blending mode.
* @returns {void}
*/
export function SetBlendMode(context: CanvasRenderingContext2D, new_mode: GlobalCompositeOperation = BLENDMODE.SOURCEOVER) : void
{
	context.globalCompositeOperation = new_mode;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Math and RNG
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
* Gets a random number within the range provided
* @param {number} start - The lowest value possible.
* @param {number} end - The highest value, exclusive. It will not return this value, but come very close to it.
* @returns {number}
*/
export function Rand(start: number, end: number) : number
{
    return Lerp(start, end, Math.random());
}

/**
* Gets a random angle from 0 to 360
* @returns {number}
*/
export function RandomAngle() : number
{
    return Rand(0,360);
}

/**
* returns true if rng rolls a value under the 0 to 100% percent argument.
* @param {number} percent - Percent threshold.
* @returns {boolean}
*/
export function Prob(percent: number) : boolean
{
    return (Math.random() * 100) < percent;
}