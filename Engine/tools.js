/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Proximity
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/// Locks a point inside of a rectangle from top left to bottom right
const ConstrainPoint = (x,y,tlx,tly,brx,bry) => {
    let pr = {x: x, y: y};
    if(x < tlx) pr.x = tlx;
    if(x > brx) pr.x = brx;
    if(y < tly) pr.y = tly;
    if(y > bry) pr.y = bry;
    return pr;
}

/// Same as ConstrainPoint, but uses the current object's x and y, and automatically constrains them.
const ConstrainEntity = (ent,tlx,tly,brx,bry) => {
    let pr = ConstrainPoint(ent.x,ent.y,tlx,tly,brx,bry);
    ent.x = pr.x;
    ent.y = pr.y;
}

/// Gets the distance between two points. The distance will never be under 0 regardless of input.
const PointDistance = (x1,y1,x2,y2) => 
{
    return Math.abs(Math.sqrt( ((x1 - x2) ** 2) + ((y1 - y2) ** 2))); // Pythag!
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Collision
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/// If a point is within a rectangle from top left to bottom right, return true
const PointInsideRectangle = (x,y,tlx,tly,brx,bry) => {
    if(x <= tlx || x >= brx || y <= tly || y >= bry) return false;
    return true;
}

/// If any point of a rectangle is within the bounds of the other rectangle, return true.
const rectangle_inside_rectangle = (tlx,tly,brx,bry,tlx2,tly2,brx2,bry2) => {
    if(PointInsideRectangle(tlx,tly,tlx2,tly2,brx2,bry2)) return true; // TL
    if(PointInsideRectangle(brx,tly,tlx2,tly2,brx2,bry2)) return true; // TR
    if(PointInsideRectangle(tlx,bry,tlx2,tly2,brx2,bry2)) return true; // BL
    if(PointInsideRectangle(brx,bry,tlx2,tly2,brx2,bry2)) return true; // BR
    return false;
}

/// If any points of a rectangle are within the radius of the circle, return true
const rectangle_inside_circle = (tlx,tly,brx,bry,cx,cy,rad) => {
    if(PointInsideRectangle(cx,cy,tlx,tly,brx,bry)) return true;
    if(PointInsideCircle(tlx,tly,cx,cy,rad)) return true; // TL
    if(PointInsideCircle(brx,tly,cx,cy,rad)) return true; // TR
    if(PointInsideCircle(tlx,bry,cx,cy,rad)) return true; // BL
    if(PointInsideCircle(brx,bry,cx,cy,rad)) return true; // BR
    return false;
}

/// If a point is within the radius of the circle, return true
const PointInsideCircle = (x,y,cx,cy,rad) => {
    return PointDistance(x,y,cx,cy) <= rad;
}

// If the circle overlaps with the radius of the other circle, return true
const circle_inside_circle = (cx,cy,rad,cx2,cy2,rad2) => {
    return PointInsideCircle(cx,cy,cx2,cy2,rad + rad2);
}

/// If a point is inside the game's view. A padding may be specified.
const PointInsideView = (x,y,pad) => {
    return PointInsideRectangle(x,y, Game.active_scene.view_x - pad, Game.active_scene.view_y - pad, Game.active_scene.view_x + ViewWidth() + pad, Game.active_scene.view_y + ViewHeight() + pad);
}

/// If a point is outside the game's view. A padding may be specified.
const PointOutsideView = (x,y,pad) => {
    return !PointInsideView(x,y,pad);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Direction
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/// Get the angle from point1 to point2 in degrees from 0 to 360.
const FindAngle = (x1,y1,x2,y2) => {
    return (360 + (Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI)) % 360; // ALWAYS positive!
}

/// Returns an angle from 0 to 360 from the position to the entity's x/y. If it is unable to find an angle it will return -1
const AngleTo = (x,y,ent) => {
    if(ent == null) return -1;
    return FindAngle(x,y,ent.x,ent.y); 
}

/// Get a new position from an angle and distance specified.
const MoveToward = (angle,distance) => {
    let dir = angle / (180 / Math.PI);
    return {x: Math.cos(dir) * distance, y: Math.sin(dir) * distance}
}

/// Snaps input angle to a multiple of the snap angle provided. ex: snapping to every 45 degree angle.
const AngleSnap = (angle, snap) => {
    return (Math.round(angle / snap) * snap);
}

/// Returns an index from 0 to the max specified, based on the angle input. Intended for turning angles into sprite sheet offsets.
const AngleToIndex = (angle, max_index) => {
    let angle_per_index = 360 / max_index;
    return (Math.round(angle / angle_per_index));
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Drawing sprites
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/// Get the width or height of the game's viewport
const ViewWidth = () => {
    return main_canvas.width
}
const ViewHeight = () => {
    return main_canvas.height
}

const DrawEntity = (ent) =>
{
    __DRAWSPRITE(ent.__canvas,ent.sprite,ent.frame,
                ent.x,
                ent.y,
                ent.image_alpha,
                ent.image_xscale,ent.image_yscale,
                ent.align_h,ent.align_v,
                ent.image_angle);
}

const DrawSprite = (draw_canvas, spr, frame, xx, yy, alpha = 1, scale_x = 1, scale_y = 1, align_x = 0, align_y = 0, angle = 0) =>
{
    __DRAWSPRITE(draw_canvas,spr,frame,
                xx,
                yy,
                alpha,
                scale_x,scale_y,
                align_x,align_y,
                angle);
}

/// Gets length of a sprite's animation
const AnimationLength = (spr) => {
	if(spr == "")
		return 0;
	let data = sprite_data[spr];
	return data.anim_length;
}

/// Changing the blending mode globally, pass no arguments to reset it
const SetBlendMode = (new_mode = BLENDMODE_SOURCEOVER) =>
{
	context.globalCompositeOperation = new_mode;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Math and RNG
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const Lerp = (start, end, percent) =>
{
    return (start * (1 - percent)) + (end * percent);
}

/// Gets a random number within the range provided
const Rand = (start, end) =>
{
    return Lerp(start, end, Math.random());
}

/// Gets a random angle from 0 to 360
const RandomAngle = () =>
{
    return Rand(0,360);
}

/// returns true if rng rolls a value under the 0 to 100% percent argument.
const Prob = (percent) =>
{
    return (Math.random() * 100) < percent;
}