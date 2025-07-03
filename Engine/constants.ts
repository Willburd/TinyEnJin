export const ENTITY_CAP: number = 60; //2048; (Use lower to catch memory leaks)
export const RENDER_WARNING_LIMIT: number = 256; // Amount of sprites that can be drawn per frame before it starts giving warnings
export const ENTITY_LIST_REFRESH_THRESHOLD: number = 20; // Amount of nulls in the entity processing list that triggers a rebuild
export const DRAW_COLLIDERS: boolean = false;
export const DRAW_STATIC_COLLIDERS: boolean = true;

export enum GAMEMODE {
	BASIC = 1 << 0,
	PAUSE = 1 << 1,
	TITLE = 1 << 2,
	TRANSITION = 1 << 3,
	GAMEOVER = 1 << 4,
	ALL = ~0,
}

export const DEPTH_BACKGROUND: number = -100000;
export const DEPTH_DEFAULT: number = 0;

export const COLLIDERTYPE_POINT: number = 0;
export const COLLIDERTYPE_RECTANGLE: number = 1;
export const COLLIDERTYPE_CIRCLE: number = 2;
export const COLLIDERTYPE_RAYCAST: number = 3;

export const INPUT_ARROWUP: string = "arrowup";
export const INPUT_ARROWDOWN: string = "arrowdown";
export const INPUT_ARROWLEFT: string = "arrowleft";
export const INPUT_ARROWRIGHT: string = "arrowright";

export enum AXIS {
	X = 1 << 0,
	Y = 1 << 1,
	BOTH = X | Y,
}

export const RAYCAST_ITERATIONS: number = 16; // Points along a raycast checked. This is used to divide the length of the ray into segments that will be checked, instead of checking all the points of a raycast 200 pixels long!

export enum BLENDMODE {
	SOURCEOVER = "source-over", // This is the default setting and draws new shapes on top of the existing canvas content.
	SOURCEIN = "source-in", //The new shape is drawn only where both the new shape and the destination canvas overlap. Everything else is made transparent.
	SOURCEOUT = "source-out", // The new shape is drawn where it doesn't overlap the existing canvas content.
	SOURCEATOP = "source-atop", // The new shape is only drawn where it overlaps the existing canvas content.
	DESTINATIONOVER = "destination-over", // New shapes are drawn behind the existing canvas content.
	DESTINATIONIN = "destination-in", // The existing canvas content is kept where both the new shape and existing canvas content overlap. Everything else is made transparent.
	DESTINATIONOUT = "destination-out", // The existing content is kept where it doesn't overlap the new shape.
	DESTINATIONATOP = "destination-atop", // The existing canvas is only kept where it overlaps the new shape. The new shape is drawn behind the canvas content.
	LIGHTER = "lighter", // Where both shapes overlap, the color is determined by adding color values.
	COPY = "copy", // Only the new shape is shown.
	XOR = "xor", // Shapes are made transparent where both overlap and drawn normal everywhere else.
	MULTIPLY = "multiply", // The pixels of the top layer are multiplied with the corresponding pixels of the bottom layer. A darker picture is the result.
	SCREEN = "screen", // The pixels are inverted, multiplied, and inverted again. A lighter picture is the result (opposite of multiply)
	OVERLAY = "overlay", // A combination of multiply and screen. Dark parts on the base layer become darker, and light parts become lighter.
	DARKEN = "darken", // Retains the darkest pixels of both layers.
	LIGHTEN = "lighten", // Retains the lightest pixels of both layers.
	COLORDODGE = "color-dodge", // Divides the bottom layer by the inverted top layer.
	COLORBURN = "color-burn", // Divides the inverted bottom layer by the top layer, and then inverts the result.
	HARDLIGHT = "hard-light", // Like overlay, a combination of multiply and screen — but instead with the top layer and bottom layer swapped.
	SOFTLIGHT = "soft-light", // A softer version of hard-light. Pure black or white does not result in pure black or white.
	DIFFERENCE = "difference", // Subtracts the bottom layer from the top layer — or the other way round — to always get a positive value.
	EXCLUSION = "exclusion", // Like difference, but with lower contrast.
	HUE = "hue", // Preserves the luma and chroma of the bottom layer, while adopting the hue of the top layer.
	SATURATION = "saturation", // Preserves the luma and hue of the bottom layer, while adopting the chroma of the top layer.
	COLOR = "color", // Preserves the luma of the bottom layer, while adopting the hue and chroma of the top layer.
	LUMINOSITY = "luminosity", // Preserves the hue and chroma of the bottom layer, while adopting the luma of the top layer.
}
