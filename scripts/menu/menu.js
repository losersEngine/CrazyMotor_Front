
window.onload = function(){

    resize();
    
    new Menu();

}

window.onresize = function(){
    resize();
}

function resize(){

    height  = document.documentElement.clientHeight - 10;
	var aspect = 5/3;
    var width = document.documentElement.clientWidth;
    
    console.log("ancho: " + width)
    console.log("alto: " + height)
    
	$('#playground').width(width);
    $('#playground').height(height);

}

class Menu{

    
    constructor(){

        this.fps = 30;
        this.skipTicks = 1000 / this.fps;
        this.nextGameTick = (new Date).getTime();

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
        
        
        this.background = new Image();
        this.background.src = "../resources/ESCENARIOS/Background1.png";

        this.logo = new Image();
        this.logo.src = "resources/INTERFACES/menu_logo.png";

        var that = this;

        this.logo.onload = function(){

            that.context.drawImage(that.background, 0,0, that.canvas.width, that.canvas.height);
            that.startGameLoop();

        }
        
    }

    startGameLoop() {
    
        var that = this;
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
		} else{
			//this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
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

