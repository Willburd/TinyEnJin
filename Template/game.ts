import {main_canvas} from "../Engine/render";
import {Game} from "../Engine/engine";

// Required function that creates an instance of your game's class, and starts it up. Your game must define this itself.
window.addEventListener("__SETUP", () => {
    let gm = new TemplateGame();
    gm.__START();
})

// GAME CORE LOGIC
class TemplateGame extends Game {
    name = "Template Game Example";

    override Init()
    {
        // Configure canvas
        main_canvas.width = 256;
        main_canvas.height = 240;
	}

    override Update()
    {
	}
}
