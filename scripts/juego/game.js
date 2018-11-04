
var name;
var scene;
var width, height;

class Racer {

	constructor() {

		this.animation = 0;
		this.velocity = 0.5;
        this.position = [];
		this.name = null;
		this.sprites = [];
		this.points = 0;

	}

	draw(context) {

		this.animation = this.animation == this.sprites.length-2?0: this.animation+1; //la ultima animacion es de salto
		this.position[0] += this.velocity;
		console.log(typeof this.sprites[this.animation])
		context.drawImage(this.sprites[this.animation],this.position[0], this.position[1],110.4,205.2);
		
	}

}

class Game {

	constructor(){
	
		this.fps = 30;

		this.velocity = 100;
		this.distance = 0;
		this.lastFrameRepaintTime = 0;

		this.socket = null;
		this.nextFrame = null;
		this.interval = null;
		this.direction = 'none';
        this.gridSize = 10;
        
        this.scene = "menu";
		
		this.skipTicks = 1000 / this.fps;
        this.nextGameTick = (new Date).getTime();
        
        var funciones = {
            
            join: function(message){
    
                for (var j = 0; j < message.params.length; j++) {
                    addRacers(message.params[j].id, message.params[j].sprite, message.params[j].name, message.params[j].points, message.params[j].position);
                }
            },
            update: function(message){
    
                for (var i = 0; i < packet.data.length; i++) {
                    
                    updateRacer(message.params[i].id, message.params[i].position);
                }
            },
            leave: function(message){
                removeRacer(message.id);
            },
            jugar: function(message){
                startGameLoop();
            },
            finJuego: function(message){
    
                salir();
    
            },
            sumaPoints: function(message){
                updatepoints(message.id,message.points);
            },
            finPartida: function(message){
    
                stopGameLoop();
                window.setTimeout(function(){
        
                    //game.context.clearRect(0,0,900,540);
                    game.context.font="20pt Verdana";
                    game.context.fillStyle = "#CCCCCC";
        
                    if(packet.ganador == null)
                        game.context.fillText("¡Empate!",90,240);
                    else
                    game.context.fillText("¡Ha ganado: " + packet.ganador + " con \n" + packet.points + " points!",90,240);
                    window.setTimeout (salir, 2000);
                }, 2000);
    
            },
            finEspera: function(message){
                finEspera();
            }
    
        }
    }
 
	calcOffset(time){

		var frameGapTime = time - this.lastFrameRepaintTime;
		this.lastFrameRepaintTime = time;
		var translateX = this.velocity * (frameGapTime/1000);

		return translateX;

	}

	initialize() {	
	
		this.racers = [];

		this.canvas = document.getElementById('playground');
		if (!this.canvas.getContext) {
			Console.log('Error: 2d canvas not supported by this browser.');
			return;
		}
		
		
        this.context = this.canvas.getContext('2d');
		let pos = [0,300];
		
		var that = this;
		

		this.background = new Image();
		this.background.src = "../../resources/ESCENARIOS/background.png";
		this.background.onload = function(){
			that.context.drawImage(that.background, 0,0, that.canvas.width, that.canvas.height);
		}
		/////////////////////////////////////AÑADIMOS JUGADOR DE PRUEBA //////////////////////////////////////////////////////////////////////////////////////

		this.addRacer(0,"sprite1","jugador1",0,pos,[1,2,3,4,5]);
		this.racers[0].sprites[this.racers[0].sprites.length-1].onload = function(){ //hasta que no se carga la ultima animacion, no se empieza el gameloop

			that.startGameLoop(); //EL GAMELOOP DEBERIA INICIARSE CUANDO NOS LO INDIQUE BACK

		}

		//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		
		window.addEventListener('keydown', e => {
			
			var code = e.keyCode;
			if (code > 36 && code < 41) {
				switch (code) {
				case 37:
					if (this.direction != 'east')
						this.setDirection('west');
					break;
				case 38:
					if (this.direction != 'south')
						this.setDirection('north');
					break;
				case 39:
					if (this.direction != 'west')
						this.setDirection('east');
					break;
				case 40:
					if (this.direction != 'north')
						this.setDirection('south');
					break;
				}
			}
		}, false);
		
        //this.connect();
       // this.changeScene();
    }
    
    drawBack(time){
		
		this.distance -= this.calcOffset(time);

		if(this.distance < -this.canvas.width){
			this.distance = 0;
		}

		this.context.clearRect(0,0,this.canvas.width, this.canvas.height);
		this.context.save();
		this.context.translate(this.distance,0);
		this.context.drawImage(this.background, 0, 0, this.canvas.width, this.canvas.height);
		this.context.drawImage(this.background, this.canvas.width-1, 0, this.canvas.width, this.canvas.height);

		this.context.restore();
	}

	startGameLoop() {
	
		this.nextFrame = () => {
			requestAnimationFrame(() => this.run());
		}
		
		this.nextFrame();		
	}

	stopGameLoop() {
		this.nextFrame = null;
		if (this.interval != null) {
			clearInterval(this.interval);
		}
	}

	draw() {
		
		//this.context.clearRect(0, 0, 900, 540);
		var space = 20;
		this.drawBack(this.nextGameTick);

		for (var id in this.racers) {
			this.drawPoints(space, id);			
			this.racers[id].draw(this.context);
			space += 40;
		}
	}

	addRacer(id, sprite,name,ptos, pos, sprites) {
		this.racers[id] = new Racer();

		for(var i = 0; i < sprites.length; i++){

			this.racers[id].sprites[i] = new Image();
			this.racers[id].sprites[i].src = "../../resources/SPRITES/" + sprite + "/" + sprite + "." + sprites[i] + ".png";

		}
        this.racers[id].name = name;
        this.racers[id].position = pos;
		this.racers[id].points = ptos;
	}

	updateRacer(id, position) {
		if (this.racers[id]) {
			this.racers[id].position = position;
		}
	}

	removeRacer(id) {
		this.racers[id] = null;
		// Force GC.
		delete this.racers[id];
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

	updatepoints(id,ptos){ //set de los points de cada serpiente

		this.racers[id].points = ptos;

	}

	drawPoints(space, id){ //mostramos por pantalla el nombre del jugador y sus points

		this.context.font = "20px Tw Cen MT";
		this.context.fillStyle = this.racers[id].color;
		this.context.textAlign="left";
		this.context.fillText(this.racers[id].nombre + ": " + this.racers[id].points,19,space); //space es la posicion en y de las letras

	}

	connect() {

            this.socket = new WebSocket('ws://'+ window.location.host +'/snake');

            this.socket.onopen = () => {

                    // Socket open.. start the game loop.
                    Console.log('Info: WebSocket connection opened.');
                    Console.log('Info: Press an arrow key to begin.');
					//solicitamos el nombre
                    pedirNombre();
                    
                    var ping = {
                        funcion: "ping",
                        params:[""]
                    }

                    setInterval(() => this.socket.send(JSON.stringify(ping)), 5000);
            }

            this.socket.onclose = () => {
                    Console.log('Info: WebSocket closed.');
                    this.stopGameLoop();
            }

            this.socket.onmessage = (message) => {

                    var packet = JSON.parse(message.data);
                    this.funciones[packet.funcion](packet);
                    
            }
                    
	}
}

function postPartida(d){ //post a APIRest para guardar la partida creada

	document.getElementById("selector").style.display = 'none';
	var ob = {
		
		name: salaP, //nombre de la partida
		dif: d, //dificultad de la partida
		creador: name //somos el creador de la partida

	}
	$.ajax({

		method: "POST",
		url: "http://" + window.location.host + "/newGame",
		data: JSON.stringify(ob),
		processData: false,
		headers: {

			"Content-type":"application/json"

		}
	}).done(function(data){

		console.log("Creada partida: " + salaP);
		partidas();
		
	});

}

$(document).ready(function(){
    $('#send-btn').click(function() { //boton de enviar del chat
        var object = {
            funcion: "Chat",
            params:[name, $('#message').val()]
        }

		game.socket.send(JSON.stringify(object));

        $('#message').val('');
    });

	function partidas(){ //get APIRest de las partidas creadas hasta el momento

		$.ajax({

			method:"GET",
			url:"http://" + window.location.host + "/partidas",

		}).done(function(data){
			
			console.log(JSON.parse(data));
			borrarDiv('#partidas');

			var partidas = JSON.parse(data);
			for(var i = 0; i < partidas.length; i++){ //las mostramos

				crearDiv(partidas[i]); 

			}
		
		});
	}

});

var game;
window.onload = function(){
	
	height  = screen.height - 150;
	var aspect = 5/3;
	width = height * aspect;
	$('#playground').width(width);
	$('#playground').height(height);

	game  = new Game();	
	game.initialize();

}