const __SETUP = () => {
    let gm = new TemplateGame();
    gm.__START();
}

// GAME CORE LOGIC
class TemplateGame extends Game {
    name = "Template Game Example";

    Init()
    {
        // Configure canvas
        main_canvas.width = 256;
        main_canvas.height = 240;

        return 1;
	};

    Update()
    {
		return 1;
	};
}
