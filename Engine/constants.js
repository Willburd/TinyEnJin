const ENTITY_CAP = 60; //2048; (Use lower to catch memory leaks)
const RENDER_WARNING_LIMIT = 256; // Amount of sprites that can be drawn per frame before it starts giving warnings
const ENTITY_LIST_REFRESH_THRESHOLD = 20 // Amount of nulls in the entity processing list that triggers a rebuild
const DRAW_COLLIDERS = false;
const DRAW_STATIC_COLLIDERS = true;

const GAMEMODE_BASIC = (1 << 0);
const GAMEMODE_PAUSE = (1 << 1);
const GAMEMODE_TITLE = (1 << 2);
const GAMEMODE_TRANSITION = (1 << 3);
const GAMEMODE_GAMEOVER = (1 << 4);
const GAMEMODE_ALL = ~(0);

const DEPTH_BACKGROUND = -100000;
const DEPTH_DEFAULT = 0;

const COLLIDERTYPE_POINT = 0;
const COLLIDERTYPE_RECTANGLE = 1;
const COLLIDERTYPE_CIRCLE = 2;
const COLLIDERTYPE_RAYCAST = 3;

const INPUT_ARROWUP = 'arrowup';
const INPUT_ARROWDOWN = 'arrowdown';
const INPUT_ARROWLEFT = 'arrowleft';
const INPUT_ARROWRIGHT = 'arrowright';

const AXIS_X = (1 << 0);
const AXIS_Y = (1 << 1);
const AXIS_BOTH = (AXIS_X|AXIS_Y);

const RAYCAST_ITERATIONS = 16; // Points along a raycast checked. This is used to divide the length of the ray into segments that will be checked, instead of checking all the points of a raycast 200 pixels long!

const BLENDMODE_SOURCEOVER = "source-over"; // This is the default setting and draws new shapes on top of the existing canvas content.
const BLENDMODE_SOURCEIN = "source-in"; //The new shape is drawn only where both the new shape and the destination canvas overlap. Everything else is made transparent.
const BLENDMODE_SOURCEOUT = "source-out"; // The new shape is drawn where it doesn't overlap the existing canvas content.
const BLENDMODE_SOURCEATOP = "source-atop"; // The new shape is only drawn where it overlaps the existing canvas content.
const BLENDMODE_DESTINATIONOVER = "destination-over"; // New shapes are drawn behind the existing canvas content.
const BLENDMODE_DESTINATIONIN = "destination-in"; // The existing canvas content is kept where both the new shape and existing canvas content overlap. Everything else is made transparent.
const BLENDMODE_DESTINATIONOUT = "destination-out"; // The existing content is kept where it doesn't overlap the new shape.
const BLENDMODE_DESTINATIONATOP = "destination-atop"; // The existing canvas is only kept where it overlaps the new shape. The new shape is drawn behind the canvas content.
const BLENDMODE_LIGHTER = "lighter"; // Where both shapes overlap, the color is determined by adding color values.
const BLENDMODE_COPY = "copy"; // Only the new shape is shown.
const BLENDMODE_XOR = "xor"; // Shapes are made transparent where both overlap and drawn normal everywhere else.
const BLENDMODE_MULTIPLY = "multiply"; // The pixels of the top layer are multiplied with the corresponding pixels of the bottom layer. A darker picture is the result.
const BLENDMODE_SCREEN = "screen"; // The pixels are inverted, multiplied, and inverted again. A lighter picture is the result (opposite of multiply)
const BLENDMODE_OVERLAY = "overlay"; // A combination of multiply and screen. Dark parts on the base layer become darker, and light parts become lighter.
const BLENDMODE_DARKEN = "darken"; // Retains the darkest pixels of both layers.
const BLENDMODE_LIGHTEN = "lighten"; // Retains the lightest pixels of both layers.
const BLENDMODE_COLORDODGE = "color-dodge"; // Divides the bottom layer by the inverted top layer.
const BLENDMODE_COLORBURN = "color-burn"; // Divides the inverted bottom layer by the top layer, and then inverts the result.
const BLENDMODE_HARDLIGHT = "hard-light"; // Like overlay, a combination of multiply and screen — but instead with the top layer and bottom layer swapped.
const BLENDMODE_SOFTLIGHT = "soft-light"; // A softer version of hard-light. Pure black or white does not result in pure black or white.
const BLENDMODE_DIFFERENCE = "difference"; // Subtracts the bottom layer from the top layer — or the other way round — to always get a positive value.
const BLENDMODE_EXCLUSION = "exclusion"; // Like difference, but with lower contrast.
const BLENDMODE_HUE = "hue"; // Preserves the luma and chroma of the bottom layer, while adopting the hue of the top layer.
const BLENDMODE_SATURATION = "saturation"; // Preserves the luma and hue of the bottom layer, while adopting the chroma of the top layer.
const BLENDMODE_COLOR = "color"; // Preserves the luma of the bottom layer, while adopting the hue and chroma of the top layer.
const BLENDMODE_LUMINOSITY = "luminosity"; // Preserves the hue and chroma of the bottom layer, while adopting the luma of the top layer.
