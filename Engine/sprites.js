let sprite_data = {};

/**
* Handles loading assets. If no assets have been flagged for loading, call setup functions to start loading.
* @returns {boolean} If all assets have been loaded.
*/
const __LOAD_ASSETS = () =>
{   
	if(__IMGS_TOTAL == 0)
	{
		// Attempt setup, get how many resources this game uses
		__INIT_SPRITE_LIBRARY();
		return false;
	}
	// Waiting for setup, return true or false if all assets are loaded
	return __LOAD_PROGRESS() == 1;
}
/**
* Gets progress of asset loading.
* @returns {number} Percent from 0 to 1
*/
const __LOAD_PROGRESS = () =>
{
	return __IMGS_LOADED / __IMGS_TOTAL;
}

// Sprite loading handled here
let __IMGS_TOTAL = 0;
let __IMGS_LOADED = 0;
let __IMGS_ERR = 0;

/**
* Constructs the sprite library from all images on the page.
* @returns {null}
*/
const __INIT_SPRITE_LIBRARY = () =>
{
	const all_images = document.getElementsByTagName("img");
	for (let index = 0; index < all_images.length; ++index) {
		const element = all_images[index];
		__INIT_SPRITE(element);
		__IMGS_TOTAL++;
	}
}

/**
* Handles loading state of html images, passing them to __LOAD_IMG_FINALIZE() when they are ready for processing.
* @param {Element} img - Html img element
* @returns {null}
*/
const __INIT_SPRITE = (img) =>
{
	if(img.complete) // Was ready before the script called it.
	{
		__LOAD_IMG_FINALIZE(img);
	}
	else // Needs time to load still...
	{
		img.onload = (img) => {__LOAD_IMG_FINALIZE(img)};
		img.onerror = () => {__IMGS_ERR++;};
		img.onabort = () => {__IMGS_ERR++;};
	}
}

/**
* Converts a html img element into sprite data for use in the game.
* @param {Element} img - Html img element
* @returns {null}
*/
const __LOAD_IMG_FINALIZE = (img) =>
{
	let nm = img.id;
	let wid = img.width;
	let hig = img.height;
	sprite_data[nm] = {image: img, width: wid, height: hig, anim_length: Math.ceil(img.naturalWidth / wid)};
	console.log("Made image " + nm + " : " + sprite_data[nm].width + ", " + sprite_data[nm].height);
	img.style.height = "0px";
	img.style.width = "0px";
	__IMGS_LOADED++;
}

/**
* Draws a sprite to the context specified with various arguments to change its appearance.
* @param {Canvas} context - Canvas context to draw to.
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
const __DRAWSPRITE = (context,spr,frame,x,y,alpha = 1, xscale = 1, yscale = 1, align_h = 0,align_v = 0,angle = 0) =>
{
	if(context == undefined || spr == "" || xscale == 0 || yscale == 0) 
		return; // No.
	let data = sprite_data[spr];
	if(data == undefined)
	{
		console.error("SPRITE IS NOT DEFINED " + spr);
		return;
	}

	// Get what frame we are on
	if(frame < 0)
	{
		frame %= data.anim_length;
		frame += data.anim_length;
		frame = Math.ceil(frame);
	}
	else
	{
		frame %= data.anim_length;
		frame = Math.floor(frame);
	}

	// Solve for alignment
	let wid = data.width;
	let hig = data.height;
	let vx = x;
	let vy = y;
	if(context == ctx) // Main screen is only one with view offset
	{
		vx = x-Game.active_scene.view_x;
		vy = y-Game.active_scene.view_y;
	}
	let xscale_off = 0;
	if(Math.sign(xscale) < 0) xscale_off = wid * -Math.abs(xscale);
	let yscale_off = 0;
	if(Math.sign(yscale) < 0) yscale_off = hig * -Math.abs(yscale);
	//vx += vx * Math.sin(angle);
	//vy += vy * Math.cos(angle);

	// Render to canvas
	context.globalAlpha = alpha;
	context.rotate((angle * Math.PI) / 180);
	ctx.scale(Math.sign(xscale), Math.sign(yscale));
	context.drawImage(data.image													// image
					, (wid * frame)													// sx
					, 0																// sy
					, wid															// swidth
					, hig 															// sheight
					, Math.floor((vx * Math.sign(xscale)) + (align_h * xscale) + xscale_off)	// dx
					, Math.floor((vy * Math.sign(yscale)) + (align_v * yscale) + yscale_off)	// dy
					, (wid * Math.abs(xscale))										// dwidth
					, (hig * Math.abs(yscale)));									// dheight

	context.setTransform(1, 0, 0, 1, 0, 0);
	context.globalAlpha = 1;
}
