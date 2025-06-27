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
const ConstrainPoint = (x,y,tlx,tly,brx,bry) => {
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
const ConstrainEntity = (ent,tlx,tly,brx,bry) => {
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
const PointDistance = (x1,y1,x2,y2) => 
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
const Lerp = (start, end, percent) =>
{
    return (start * (1 - percent)) + (end * percent);
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
const PointInsideRectangle = (x,y,tlx,tly,brx,bry) => {
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
const rectangle_inside_rectangle = (tlx,tly,brx,bry,tlx2,tly2,brx2,bry2) => {
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
const rectangle_inside_circle = (tlx,tly,brx,bry,cx,cy,rad) => {
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
const PointInsideCircle = (x,y,cx,cy,rad) => {
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
const circle_inside_circle = (cx,cy,rad,cx2,cy2,rad2) => {
    return PointInsideCircle(cx,cy,cx2,cy2,rad + rad2);
}

/**
* If a point is inside the game's view. A padding may be specified.
* @param {number} x - point's x.
* @param {number} y - point's y.
* @param {number} pad - A padding distance around the view, that is considered to still be inside of the view.
* @returns {boolean} If the point is within the view or the padding specified.
*/
const PointInsideView = (x,y,pad) => {
    return PointInsideRectangle(x,y, Game.active_scene.view_position.x - pad, Game.active_scene.view_position.y - pad, Game.active_scene.view_position.x + ViewWidth() + pad, Game.active_scene.view_position.y + ViewHeight() + pad);
}

/**
* If a point is outside the game's view. A padding may be specified.
* @param {number} x - point's x.
* @param {number} y - point's y.
* @param {number} pad - A padding distance around the view, that is considered to still be inside of the view.
* @returns {boolean} If the point is outside the view and the padding specified.
*/
const PointOutsideView = (x,y,pad) => {
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
const FindAngle = (x1,y1,x2,y2) => {
    return (360 + (Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI)) % 360; // ALWAYS positive!
}

/**
* Get the angle from point1 to point2 in degrees from 0 to 360.
* @param {Vector2} vec1 - First point's position.
* @param {Vector2} vec2 - Second point's position.
* @returns {number} Angle from the first point to the second in degrees.
*/
const FindVectorAngle = (vec1, vec2) => {
    return FindAngle(vec1.x,vec1.y,vec2.x,vec2.y);
}

/**
* Returns an angle from 0 to 360 from the position to the entity's x/y. 
* @param {number} x1 - First point's x position.
* @param {number} y1 - First point's y position.
* @param {Entity} ent - Entity to use the position of.
* @returns {number} Angle from the first point to the entity's position. If it is unable to find an angle it will return -1
*/
const AngleTo = (x,y,ent) => {
    if(ent == null) return -1;
    return FindAngle(x,y,ent.position.x,ent.position.y); 
}

/**
* Get a new position from an angle and distance specified.
* @param {number} angle - The angle that will be used to calculate the new position.
* @param {number} distance - The distance to move along the angle provided.
* @returns {Vector2}
*/
const MoveToward = (angle,distance) => {
    let dir = angle / (180 / Math.PI);
    return new Vector2(Math.cos(dir) * distance, Math.sin(dir) * distance);
}

/**
* Gets a normalized vector based on the angle provided
* @param {number} angle - angle to create a vector from.
* @returns {Vector2}
*/
const VectorFromAngle = (angle) =>
{
    return MoveToward(angle,1);
}

/**
* Snaps input angle to a multiple of the snap angle provided. ex: snapping to every 45 degree angle.
* @param {number} angle - The source angle.
* @param {number} snap - The angle incriments that will be used to round the source angle.
* @returns {number} The source angle rounded to the nearest incriment of the snap angle provided.
*/
const AngleSnap = (angle, snap) => {
    return (Math.round(angle / snap) * snap);
}

/**
* Returns an index from 0 to the max specified, based on the angle input. Intended for turning angles into frame number in a rotation animation.
* @param {number} angle - The source angle.
* @param {number} max_index - The max number of segments desired. Usually the maximum number of rotation frames.
* @returns {number} The current index from 0 to max_index that the angle would be if converted from degrees to segments.
*/
const AngleToIndex = (angle, max_index) => {
    let angle_per_index = 360 / max_index;
    return (Math.round(angle / angle_per_index));
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Drawing sprites
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
* Get the width of the game's viewport
* @returns {number}
*/
const ViewWidth = () => {
    return main_canvas.width
}
/**
* Get the height of the game's viewport
* @returns {number}
*/
const ViewHeight = () => {
    return main_canvas.height
}

/**
* Draws an entity using it's current properties.
* @param {Entity} ent - The source entity to draw.
* @returns {null}
*/
const DrawEntity = (ent) =>
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
* @returns {null}
*/
const DrawSprite = (draw_canvas,spr,frame,x,y,alpha = 1, xscale = 1, yscale = 1, align_h = 0,align_v = 0,angle = 0) =>
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
const AnimationLength = (spr) => {
	if(spr == "")
		return 0;
	let data = sprite_data[spr];
	return data.anim_length;
}

/**
* Changing the blending mode globally, pass no arguments to reset it
* @param {BLENDMODE} new_mode - BLENDMODE constant that will be the new blending mode.
* @returns {null}
*/
const SetBlendMode = (new_mode = BLENDMODE_SOURCEOVER) =>
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
const Rand = (start, end) =>
{
    return Lerp(start, end, Math.random());
}

/**
* Gets a random angle from 0 to 360
* @returns {number}
*/
const RandomAngle = () =>
{
    return Rand(0,360);
}

/**
* returns true if rng rolls a value under the 0 to 100% percent argument.
* @param {number} percent - Percent threshold.
* @returns {boolean}
*/
const Prob = (percent) =>
{
    return (Math.random() * 100) < percent;
}