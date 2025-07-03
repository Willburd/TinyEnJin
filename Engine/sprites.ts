import { ctx } from "./render";
import { Game } from "./engine";
import { Vector2 } from "./vector";

export let sprite_data: Record<string, SpriteData> = {};
export let all_images: Array<ImageMeta> = [];

class ImageMeta {
	img: HTMLImageElement;
	offset: Vector2;

	constructor(img: HTMLImageElement, offset: Vector2) {
		this.img = img;
		this.offset = offset;
	}
}

/**
 * Creates image assets during the initial loading period.
 * @returns {void}
 */
export function CREATE_IMAGE_ASSET(name: string, width: number, height: number, h_offset: number, v_offset: number, path: string): void {
	const img = new Image();
	img.src = path;
	img.id = name;
	img.width = width;
	img.height = height;
	all_images.push(new ImageMeta(img, new Vector2(h_offset, v_offset)));
}

/**
 * Handles loading assets. If no assets have been flagged for loading, call setup functions to start loading.
 * @returns {boolean} If all assets have been loaded.
 */
export function __LOAD_ASSETS(): boolean {
	if (__IMGS_TOTAL == 0) {
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
export function __LOAD_PROGRESS(): number {
	return __IMGS_LOADED / __IMGS_TOTAL;
}

// Sprite loading handled here
export let __IMGS_TOTAL: number = 0;
export let __IMGS_LOADED: number = 0;
export let __IMGS_ERR: number = 0;

/**
 * Constructs the sprite library from all images on the page.
 * @returns {void}
 */
export function __INIT_SPRITE_LIBRARY(): void {
	for (let index = 0; index < all_images.length; ++index) {
		const element = all_images[index] as ImageMeta;
		__INIT_SPRITE(element);
		__IMGS_TOTAL++;
	}
}

/**
 * Handles loading state of html images, passing them to __LOAD_IMG_FINALIZE() when they are ready for processing.
 * @param {Element} img - Html img element
 * @returns {void}
 */
export function __INIT_SPRITE(meta: ImageMeta): void {
	if (meta.img.complete) {
		// Was ready before the script called it.
		__LOAD_IMG_FINALIZE(meta);
	} // Needs time to load still...
	else {
		meta.img.onload = () => {
			__LOAD_IMG_FINALIZE(meta);
		};
		meta.img.onerror = (ev: string | Event) => {
			__IMGS_ERR++;
			console.log("Error loading: " + meta.img.id + " - " + meta.img.src + " - " + ev.toString());
		};
		meta.img.onabort = (ev: string | Event) => {
			__IMGS_ERR++;
			console.log("Aborted loading: " + meta.img.id + " - " + meta.img.src + " - " + ev.toString());
		};
	}
}

/**
 * Converts a html img element into sprite data for use in the game.
 * @param {HTMLImageElement} img - Html img element
 * @returns {void}
 */
function __LOAD_IMG_FINALIZE(meta: ImageMeta): void {
	console.log("Finished loading: " + meta.img.id + " - " + meta.img.src);
	const nm = meta.img.id;
	const wid = meta.img.width;
	const hig = meta.img.height;
	const xoff = meta.offset.x;
	const yoff = meta.offset.y;
	sprite_data[nm] = new SpriteData(meta.img, wid, hig, xoff, yoff, Math.ceil(meta.img.naturalWidth / wid));
	console.log("Made image " + nm + " : " + sprite_data[nm].width + ", " + sprite_data[nm].height);
	meta.img.style.height = "0px";
	meta.img.style.width = "0px";
	__IMGS_LOADED++;
}

export class SpriteData {
	image: HTMLImageElement;
	width: number = 0;
	height: number = 0;
	h_offset: number = 0;
	v_offset: number = 0;
	anim_length: number = 0;

	constructor(img: HTMLImageElement, wid: number, hig: number, h_offset: number, v_offset: number, anm_len: number) {
		this.image = img;
		this.width = wid;
		this.height = hig;
		this.h_offset = h_offset;
		this.v_offset = v_offset;
		this.anim_length = anm_len;
	}
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
 * @returns {void}
 */
export function __DRAWSPRITE(context: CanvasRenderingContext2D, spr: string, frame: number, x: number, y: number, alpha: number = 1, xscale: number = 1, yscale: number = 1, angle: number = 0) {
	if (context == undefined || spr == "" || xscale == 0 || yscale == 0) return; // No.
	let data = sprite_data[spr];
	if (data == undefined) {
		console.error("SPRITE IS NOT DEFINED " + spr);
		return;
	}

	// Get what frame we are on
	if (frame < 0) {
		frame %= data.anim_length;
		frame += data.anim_length;
		frame = Math.ceil(frame);
	} else {
		frame %= data.anim_length;
		frame = Math.floor(frame);
	}

	// Solve for alignment
	const wid = data.width;
	const hig = data.height;
	let vx = x;
	let vy = y;
	if (context == ctx) {
		// Main screen is only one with view offset
		vx = x - Game.active_scene.view_position.x;
		vy = y - Game.active_scene.view_position.y;
	}
	let xscale_off = 0;
	if (Math.sign(xscale) < 0) xscale_off = wid * -Math.abs(xscale);
	let yscale_off = 0;
	if (Math.sign(yscale) < 0) yscale_off = hig * -Math.abs(yscale);
	//vx += vx * Math.sin(angle);
	//vy += vy * Math.cos(angle);

	// Render to canvas
	context.globalAlpha = alpha;
	context.rotate((angle * Math.PI) / 180);
	ctx.scale(Math.sign(xscale), Math.sign(yscale));
	context.drawImage(
		data.image, // image
		wid * frame, // sx
		0, // sy
		wid, // swidth
		hig, // sheight
		Math.floor(vx * Math.sign(xscale) + data.h_offset * xscale + xscale_off), // dx
		Math.floor(vy * Math.sign(yscale) + data.v_offset * yscale + yscale_off), // dy
		wid * Math.abs(xscale), // dwidth
		hig * Math.abs(yscale),
	); // dheight

	context.setTransform(1, 0, 0, 1, 0, 0);
	context.globalAlpha = 1;
}

export function DrawDebugDot(x: number, y: number): void {
	ctx.beginPath();
	ctx.arc(x - Game.active_scene.view_position.x, y - Game.active_scene.view_position.y, 1, 0, 2 * Math.PI);
	ctx.stroke();
}
