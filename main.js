
class ParticleSystem extends PIXI.Container {
    constructor(options = {}) {
        super();
        this.start = 0; 
        this.duration = options.duration || 6000; // How long the effect lasts in milliseconds.

       
        this.coinInterval = options.coinInterval || 300; // Time between each coin appears.
        this.totalCoins = options.totalCoins || 300; // Total number of coins to show.
        this.coinsAdded = 0; // Keeping the track of how many coins have been added.
        this.coinSprites = []; // arrray that stores  all the coin sprites for animation.

        // Creates a congratulations message 
        const messageText = options.messageText || 'Congratulations! You won!, Try new games';
        const messageFontSize = options.messageFontSize || 24;
        const messageColor = options.messageColor || 0xFFFFFF;
        let message = new PIXI.Text(messageText, { fontFamily: 'Arial', fontSize: messageFontSize, fill: messageColor, align: 'center' });
        message.anchor.set(0.5); // Centers the text.
        message.position.set(400, 50); // Positions the text on the screen.
        this.addChild(message); // Adds the message to this container.

        // Placeholder for any texture preloading logic.
        this.preloadCoins();
    }

    // Method placeholder for preloading coin textures.
    preloadCoins() {
        // Logic for preloading coin textures would go here.
    }

    // Called every frame to update the effect.
    animTick(nt, lt, gt) {
        // Checks if it's time to add a new coin and if we haven't reached the total number of coins yet.
        if (this.coinsAdded < this.totalCoins && lt >= this.coinsAdded * this.coinInterval) {
            // Creates a new coin sprite and configures its properties.
            let sprite = game.sprite("CoinsGold" + ("000" + (this.coinsAdded % 9)).substr(-3));
            sprite.anchor.set(0.5); // Sets the anchor to the center.
            sprite.x = Math.random() * 800; // Random horizontal start position.
            sprite.y = -150; // Starts above the visible screen area.
            this.addChild(sprite); // Adds the sprite to the container.
            this.coinSprites.push(sprite); // Keeps track of the sprite.
            this.coinsAdded++; // Increments the counter for added coins.
        }

        // Updates position, scale, alpha, and rotation for each coin sprite.
        this.coinSprites.forEach(sprite => {
            sprite.x += Math.random() * 2 - 1; // Adds random horizontal movement.
            sprite.y += 3; // Moves the sprite down each frame.

            // Resets the sprite's position if it moves off the screen
            if (sprite.y > 700 || sprite.x < -50 || sprite.x > 850) {
                sprite.x = Math.random() * 800;
                sprite.y = -150;
            }

            // Animates scale, alpha, and rotation based on normalized  time.
            let normalizedTime = (gt % this.duration) / this.duration;
            sprite.scale.x = sprite.scale.y = Math.sin(normalizedTime * Math.PI * 2) * 0.5 + 0.5;
            sprite.alpha = Math.sin(normalizedTime * Math.PI * 2) * 0.5 + 0.5;
            sprite.rotation += Math.PI / 190 * 2; // Adds a slight rotation 
        });
    }
}




// ----- End of the assigment ----- //

class Game {
	constructor(props) {
		this.totalDuration = 0;
		this.effects = [];
		this.renderer = new PIXI.WebGLRenderer(800,450);
		document.body.appendChild(this.renderer.view);
		this.stage = new PIXI.Container();
		this.loadAssets(props&&props.onload);
	}
	loadAssets(cb) {
		let textureNames = [];
		// Load coin assets
		for (let i=0; i<=8; i++) {
			let num  = ("000"+i).substr(-3);
			let name = "CoinsGold"+num;
			let url  = "gfx/CoinsGold/"+num+".png";
			textureNames.push(name);
			PIXI.loader.add(name,url);
		}
		PIXI.loader.load(function(loader,res){
			// Access assets by name, not url
			let keys = Object.keys(res);
			for (let i=0; i<keys.length; i++) {
				var texture = res[keys[i]].texture;
				if ( ! texture) continue;
				PIXI.utils.TextureCache[keys[i]] = texture;
			}
			// Assets are loaded and ready!
			this.start();
			cb && cb();
		}.bind(this));
	}
	start() {	
		this.isRunning = true;
		this.t0 = Date.now();
		update.bind(this)();
		function update(){
			if ( ! this.isRunning) return;
			this.tick();
			this.render();
			requestAnimationFrame(update.bind(this));
		}
	}
	addEffect(eff) {
		this.totalDuration = Math.max(this.totalDuration,(eff.duration+eff.start)||0);
		this.effects.push(eff);
		this.stage.addChild(eff);
	}
	render() {
		this.renderer.render(this.stage);
	}
	tick() {
		let gt = Date.now();
		let lt = (gt-this.t0) % this.totalDuration;
		for (let i=0; i<this.effects.length; i++) {
			let eff = this.effects[i];
			if (lt>eff.start+eff.duration || lt<eff.start) continue;
			let elt = lt - eff.start;
			let ent = elt / eff.duration;
			eff.animTick(ent,elt,gt);
		}
	}
	sprite(name) {
		return new PIXI.Sprite(PIXI.utils.TextureCache[name]);
	}
	setTexture(sp,name) {
		sp.texture = PIXI.utils.TextureCache[name];
		if ( ! sp.texture) console.warn("Texture '"+name+"' don't exist!")
	}
}

window.onload = function(){
	window.game = new Game({onload:function(){
		game.addEffect(new ParticleSystem());
	}});
}
