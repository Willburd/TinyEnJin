import { main_canvas } from "../Engine/render";
import { CREATE_IMAGE_ASSET } from "../Engine/sprites";
import { Game } from "../Engine/engine";

// Required function that creates an instance of your game's class, and starts it up. Your game must define this itself.
window.addEventListener("__SETUP", () => {
	console.log("Booting EnJin.");
	const gm = new TemplateGame();
	gm.__START();
});
// GAME CORE LOGIC
class TemplateGame extends Game {
	override name = "Template Game Example";

	override Init() {
		// Configure canvas
		main_canvas.width = 256;
		main_canvas.height = 240;

		console.log("Init has finished.");
	}

	override Update() {}
}

// Load all assets the game needs
window.addEventListener("__ASSET_SETUP", () => {
	CREATE_IMAGE_ASSET("bg_fullblack", 1024, 1024, 0, 0, "SharedAssets/bg_fullblack.png");
});
