/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Proximity
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/// Locks a point inside of a rectangle from top left to bottom right
const constraint_point = (x,y,tlx,tly,brx,bry) => {
    let pr = {x: x, y: y};
    if(x < tlx) pr.x = tlx;
    if(x > brx) pr.x = brx;
    if(y < tly) pr.y = tly;
    if(y > bry) pr.y = bry;
    return pr;
}

/// Same as constraint_point, but uses the current object's x and y, and automatically constrains them.
const constrain_entity = (ent,tlx,tly,brx,bry) => {
    let pr = constraint_point(ent.x,ent.y,tlx,tly,brx,bry);
    ent.x = pr.x;
    ent.y = pr.y;
}

/// Gets the distance between two points. The distance will never be under 0 regardless of input.
const point_distance = (x1,y1,x2,y2) => 
{
    return Math.abs(Math.sqrt( ((x1 - x2) ** 2) + ((y1 - y2) ** 2))); // Pythag!
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Collision
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/// If a point is within a rectangle from top left to bottom right, return true
const point_inside_rectangle = (x,y,tlx,tly,brx,bry) => {
    if(x <= tlx || x >= brx || y <= tly || y >= bry) return false;
    return true;
}

/// If any point of a rectangle is within the bounds of the other rectangle, return true.
const rectangle_inside_rectangle = (tlx,tly,brx,bry,tlx2,tly2,brx2,bry2) => {
    if(point_inside_rectangle(tlx,tly,tlx2,tly2,brx2,bry2)) return true; // TL
    if(point_inside_rectangle(brx,tly,tlx2,tly2,brx2,bry2)) return true; // TR
    if(point_inside_rectangle(tlx,bry,tlx2,tly2,brx2,bry2)) return true; // BL
    if(point_inside_rectangle(brx,bry,tlx2,tly2,brx2,bry2)) return true; // BR
    return false;
}

/// If any points of a rectangle are within the radius of the circle, return true
const rectangle_inside_circle = (tlx,tly,brx,bry,cx,cy,rad) => {
    if(point_inside_circle(tlx,tly,cx,cy,rad)) return true; // TL
    if(point_inside_circle(brx,tly,cx,cy,rad)) return true; // TR
    if(point_inside_circle(tlx,bry,cx,cy,rad)) return true; // BL
    if(point_inside_circle(brx,bry,cx,cy,rad)) return true; // BR
    return false;
}

/// If a point is within the radius of the circle, return true
const point_inside_circle = (x,y,cx,cy,rad) => {
    return point_distance(x,y,cx,cy) <= rad;
}

// If the circle overlaps with the radius of the other circle, return true
const circle_inside_circle = (cx,cy,rad,cx2,cy2,rad2) => {
    return point_inside_circle(cx,cy,cx2,cy2,rad + rad2);
}

/// If a point is inside the game's view. A padding may be specified.
const point_inside_view = (x,y,pad) => {
    return point_inside_rectangle(x,y, Game.active_scene.view_x - pad, Game.active_scene.view_y - pad, Game.active_scene.view_x + view_width() + pad, Game.active_scene.view_y + view_height() + pad);
}

/// If a point is outside the game's view. A padding may be specified.
const point_outside_view = (x,y,pad) => {
    return !point_inside_view(x,y,pad);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Direction
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/// Get the angle from point1 to point2 in degrees. 
const point_angle = (x1,y1,x2,y2) => {
    return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
}

/// Get a new position from an angle and distance specified.
const move_toward = (angle,distance) => {
    let dir = angle / (180 / Math.PI);
    return {x: Math.cos(dir) * distance, y: Math.sin(dir) * distance}
}

/// Snaps input angle to a multiple of the snap angle provided. ex: snapping to every 45 degree angle.
const angle_snap = (angle, snap) => {
    return (Math.round(angle / snap) * snap);
}

/// Returns an index from 0 to the max specified, based on the angle input. Intended for turning angles into sprite sheet offsets.
const angle_to_index = (angle, max_index) => {
    let angle_per_index = 360 / max_index;
    return (Math.round(angle / angle_per_index));
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Drawing sprites
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/// Get the width or height of the game's viewport
const view_width = () => {
    return main_canvas.width
}
const view_height = () => {
    return main_canvas.height
}

const draw_entity = (ent) =>
{
    __DRAWSPRITE(ent.__canvas,ent.sprite,ent.frame,
                ent.x,
                ent.y,
                ent.image_alpha,
                ent.image_xscale,ent.image_yscale,
                ent.align_h,ent.align_v,
                ent.image_angle);
}

const draw_sprite = (draw_canvas, spr, frame, xx, yy, alpha = 1, scale_x = 1, scale_y = 1, align_x = 0, align_y = 0, angle = 0) =>
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
const animation_length = (spr) => {
	if(spr == "")
		return 0;
	let data = sprite_data[spr];
	return data.anim_length;
}

/// Changing the blending mode globally, pass no arguments to reset it
const set_blend_mode = (new_mode = BLENDMODE_SOURCEOVER) =>
{
	context.globalCompositeOperation = new_mode;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Math and RNG
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const lerp = (start, end, percent) =>
{
    return (start * (1 - percent)) + (end * percent);
}

/// Gets a random number within the range provided
const rand = (start, end) =>
{
    return lerp(start, end, Math.random());
}

/// returns true if rng rolls a value under the 0 to 100% percent argument.
const prob = (percent) =>
{
    return (Math.random() * 100) < percent;
}