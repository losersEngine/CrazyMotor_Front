
window.onload = function(){

    //new Menu();

}

window.onresize = function(){
    resize();
}

function resize(){

    var height  = document.documentElement.clientHeight + 80;
    var width = document.documentElement.clientWidth + 42;
    
    console.log("ancho: " + width)
    console.log("alto: " + height)
    
	$('#playground').width(width);
    $('#playground').height(height);

    //document.getElementById('body').style.backgroundSize = width + 'px' + ' ' + height + 'px';

}

class Menu{

    
    constructor(){

        this.fps = 30;
        this.skipTicks = 1000 / this.fps;
        this.nextGameTick = (new Date).getTime();

        this.totalAssets = 3;
        this.assetsLoaded = 0;

        this.nextFrame = null;

        this.distance = 0;
        this.velocity = 100;
        this.lastFrameRepaintTime = 0;

        this.canvas = document.getElementById('playground');
		if (!this.canvas.getContext) {
			Console.log('Error: 2d canvas not supported by this browser.');
			return;
		}

        this.context = this.canvas.getContext('2d');

        this.loadAssets();

    }

    loadAssets(){

        var that = this;

        this.music = new Audio();
        this.music.src = 'resources/Audio/Final Music/main_menu.mp3';
        this.music.loop = true;
        this.music.autoplay = true;

        this.music.oncanplaythrough = function(){
            that.assetsLoaded++;
            //that.music.play();
            console.log('assets musica: ' + that.assetsLoaded)
            if(that.assetsLoaded == that.totalAssets)
                that.startGameLoop();

        }

        this.background = new Image();
        this.background.src = "resources/ESCENARIOS/Background1.png";

        this.background.onload = function(){

            that.assetsLoaded++;
            console.log('assets background: ' + that.assetsLoaded)
            if(that.assetsLoaded == that.totalAssets)
                that.startGameLoop();

        }

        this.logo = new Image();
        this.logo.src = "resources/INTERFACES/menu_logo.png";

        this.logo.onload = function(){

            that.assetsLoaded++;
            console.log('assets logo: ' + that.assetsLoaded)

            if(that.assetsLoaded == that.totalAssets)
                that.startGameLoop();

        }

    }

    startGameLoop() {
    
        var that = this;
        document.getElementById('body').style.backgroundImage = 'none';
        document.getElementsByClassName('flex-container')[0].style.display = 'flex';

		this.nextFrame = () => {
			requestAnimationFrame(() => that.run());
		}
		
		this.nextFrame();		
    }

    run() {
	
		while ((new Date).getTime() > this.nextGameTick) {
			this.nextGameTick += this.skipTicks;
		}
		this.draw();
		if (this.nextFrame != null) {
			this.nextFrame();
		}
    }
    
    draw(){
        
        this.context.clearRect(0,0,this.canvas.width, this.canvas.height);
        this.context.save();
        
        this.drawBack();
    
        this.context.restore();

        this.context.drawImage(this.logo, 0,0, this.canvas.width, this.canvas.height);
            
    }
    
    drawBack(){
    
        this.distance -= this.calcOffset();
    
        if(this.distance < -this.canvas.width){
            
            this.distance = 0;
        }
    
        this.context.translate(this.distance,0);
        this.context.drawImage(this.background, 0, 0, this.canvas.width, this.canvas.height);
        this.context.drawImage(this.background, this.canvas.width-1, 0, this.canvas.width, this.canvas.height);
    
    }
    
    calcOffset(){
    
        var frameGapTime = this.nextGameTick - this.lastFrameRepaintTime;
        this.lastFrameRepaintTime = this.nextGameTick;
        var translateX = this.velocity * (frameGapTime/1000);
    
        return translateX;
    
    }

}

