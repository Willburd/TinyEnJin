let sprite_data = {};

/// Load all assets
const __LOAD_ASSETS = () =>
{   
	if(__IMGS_TOTAL == 0)
	{
		// Attempt setup, get how many resources this game uses
		init_sprite_library();
		return false;
	}
	// Waiting for setup, return true or false if all assets are loaded
	return __LOAD_PROGRESS() == 1;
}
const __LOAD_PROGRESS = () =>
{
	return __IMGS_LOADED / __IMGS_TOTAL;
}

// Sprite loading handled here
let __IMGS_TOTAL = 0;
let __IMGS_LOADED = 0;
let __IMGS_ERR = 0;
const init_sprite_library = () =>
{
	const all_images = document.getElementsByTagName("img");
	for (let index = 0; index < all_images.length; ++index) {
		const element = all_images[index];
		init_sprite(element);
		__IMGS_TOTAL++;
	}
}

const init_sprite = (img) =>
{
	if(img.complete) 
	{
		__LOAD_IMG_FINALIZE(img);
	}
	else
	{
		img.onload = (img) => {__LOAD_IMG_FINALIZE(img)};
		img.onerror = () => {__IMGS_ERR++;};
		img.onabort = () => {__IMGS_ERR++;};
	}
}

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
					, (vx * Math.sign(xscale)) + (align_h * xscale) + xscale_off	// dx
					, (vy * Math.sign(yscale)) + (align_v * yscale) + yscale_off	// dy
					, (wid * Math.abs(xscale))										// dwidth
					, (hig * Math.abs(yscale)));									// dheight

	context.setTransform(1, 0, 0, 1, 0, 0);
}
