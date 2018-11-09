
var name;
var scene;
var width, height;

class Item{

	constructor(t = "", p = [0,0], state = 0){
		
		this.type = t;
		this.animation = state; //Frame de animacion
		this.position = p;
		this.sprites = []; //sprites de animacion
		
		this.getSprites();

	}

	getSprites(){

		if(this.type == "caja"){
			this.sprites = game.animationsBox;
			this.size = [100,80];
		}else if(this.type == "laser"){
			this.sprites = game.animationsLaser;
			this.size = [200,500];
		}else if(this.type == "nitro"){
			this.sprites = game.animationsNitro;
			this.size = [];
		}

	}

	draw(context){

		this.animation = this.animation == this.sprites.length-1?0: this.animation+1;
		context.drawImage(this.sprites[this.animation],this.position[0], this.position[1],this.size[0], this.size[1]);
		
	}

}
class Racer {

	constructor() {

		this.animation = 0;
		this.size = [90,140];
		this.velocity = 0.5;
        this.position = [];
		this.sprites = [];

	}

	draw(context) {

		this.animation = this.animation == this.sprites.length-2?0: this.animation+1; //la ultima animacion es de salto
		this.position[0] += this.velocity;

		context.drawImage(this.sprites[this.animation],this.position[0], this.position[1],this.size[0], this.size[1]); 

		
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
        
        this.scene = "selector";
		this.lastKeyPressed = 0;
		//////////////////////////////////////ANIMACIONES DE OBJETOS//////////////////////////////////////////////////////////////////////
		this.animationsBox = [];
		this.animationsLaser = [];
		this.animationsNitro = [];
		this.addAnimationsItems();
		////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////7

		this.skipTicks = 1000 / this.fps;
        this.nextGameTick = (new Date).getTime();
        
        this.funciones = {

            join: function(message){ //message = params
    
                for (var j = 0; j < message.pj.length; j++) {

					let sprite = j == 0?"sprite1":"sprite2";
					addRacers(message.pj[j].id, sprite, message.pj[j].pos,[1,2,3,4,5]);
					
				}

				if(messaje.pj.length == 1){ //esperamos a jugador 2

					game.drawMessage("ESPERANDO A JUGADOR 2");

				}
				
			},
			countdown: function(message){ //message = params
				
				game.drawMessage(message.count);
				
			},
            update: function(message){
    
                for (var i = 0; i < message.pj.length; i++) { //state es la animacion a mostrar
                    
                    updateRacer(message.pj[i].id, message.pj[i].state,message.pj[i].pos);
				}
				this.updateItems(message);
			},
			updateItems: function(message){

				let items = message.items; //array de items (posicion, tipo)

				game.itemsPrueba = [];
				items.forEach(item=>{

					let i = new Item(item.type, item.pos, item.state);
					game.itemsPrueba.push(i);
					
				});

			},
            leave: function(message){
                removeRacer(message.id);
            },
            start: function(message){

				game.startGameLoop();
				
			},
            finPartida: function(message){// message = params
    
				stopGameLoop();
				
                window.setTimeout(function(){
        
                    //game.context.clearRect(0,0,900,540);
                    game.context.font="20pt Verdana";
                    game.context.fillStyle = "#CCCCCC";
        
                    if(message.winner == null)
                        game.context.fillText("¡Empate!",90,240);
                    else{
						let winner = message.winner == 0? "Jugador1" : "Jugador2"
						game.context.fillText("¡Ha ganado: " + winner + "!",90,240);
					}
					window.setTimeout (salir, 2000);
					
                }, 2000);
    
			}
			
        }
	}
	
	drawMessage(text){

		this.context.font = "20px Tw Cen MT";
		//this.context.fillStyle = ;
		this.context.textAlign="center";
		this.context.fillText(text,19,space)
	}
	addAnimationsItems(){

		let box = ["caja1"];
		let laser = ["laser1","laser2","laser3","laser4","laser5"];
		let nitro = ["nitro1","nitro2"];

		let c = 0;

		box.forEach(b=>{

			this.animationsBox.push(new Image());
			this.animationsBox[c].src = "../../resources/SPRITES/caja" + "/" + b + ".png";
			c++;

		});

		c = 0;

		laser.forEach(l=>{

			this.animationsLaser.push(new Image());
			this.animationsLaser[c].src = "../../resources/SPRITES/laser"  + "/" + l + ".png";
			c++;

		});

		c = 0;

		nitro.forEach(n=>{

			this.animationsNitro.push(new Image());
			this.animationsNitro[c].src = "../../resources/SPRITES/nitro" + "/" + n + ".png";
			c++;
			
		});

	}
 
	calcOffset(){

		var frameGapTime = this.nextGameTick - this.lastFrameRepaintTime;
		this.lastFrameRepaintTime = this.nextGameTick;
		var translateX = this.velocity * (frameGapTime/1000);

		return translateX;

	}

	updateItems(message){
		
		let items = message.items; //array de items (posicion, tipo)

		this.itemsPrueba = [];
		items.forEach(item=>{
			let i = new Item(item.type, item.pos);
			this.itemsPrueba.push(i);
			i.draw(this.context);
		});

	}
	initialize() {	
	
		this.racers = [];

		this.canvas = document.getElementById('playground');
		if (!this.canvas.getContext) {
			Console.log('Error: 2d canvas not supported by this browser.');
			return;
		}
		
		this.itemsPrueba =
		{
		   items:[
			   {
				   type: "laser",
				   pos:[100,0],
				   state: 0 //posicion del array de sprites a mostrar
			   }
		   ]
	   }
        this.context = this.canvas.getContext('2d');
		
		
		var that = this;
		

		this.background = new Image();
		this.background.src = "../../resources/ESCENARIOS/background.png";
		this.background.onload = function(){
			that.context.drawImage(that.background, 0,0, that.canvas.width, that.canvas.height);
		}

		this.platform = new Image();
		this.platform.src = "../../resources/ESCENARIOS/wall_grass.png";

		let pos = [0,this.canvas.height - 190]; //jugador1

		/////////////////////////////////////AÑADIMOS JUGADOR DE PRUEBA //////////////////////////////////////////////////////////////////////////////////////

		this.addRacer(0,"sprite1",pos,[1,2,3,4,5]);

		pos = [0,60];
		this.addRacer(1,"sprite2",pos,[1,2,3,4,5]);
		this.racers[1].sprites[this.racers[1].sprites.length-1].onload = function(){ //hasta que no se carga la ultima animacion, no se empieza el gameloop

			that.startGameLoop(); //EL GAMELOOP DEBERIA INICIARSE CUANDO NOS LO INDIQUE BACK

		}

		//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

		
		
		window.addEventListener('keydown', e => {
			
			var code = e.keyCode;
			game.lastKeyPressed = code;
			game.keyManager(code, true);
			
		}, false);

		window.addEventListener('keyup', e => {
			
			var code = game.lastKeyPressed;
			game.keyManager(code, false);
			
		}, false);

	   this.updateItems(this.itemsPrueba);
    }
	
	drawSelector(){

		let title = document.createElement("h1");
		title.id = "title";
		title.innerHTML = "SELECCIONA LA DIFICULTAD";

		document.getElementById("render").appendChild(title);

		let div = document.createElement("div");
		div.id = "botonesSelector";

		let EasyButton = document.createElement("button");
		EasyButton.textContent = "FÁCIL";
		EasyButton.id = "easy";
		div.appendChild(EasyButton)

		let HardButton = document.createElement("button");
		HardButton.textContent = "DIFÍCIL";
		HardButton.id = "hard";
		div.appendChild(HardButton);

		document.getElementById("render").appendChild(div);

		this.difficultSelector();

	}

	difficultSelector(){

		$(document).ready(function(){

			$('#easy').click(function() {
				var object = {
					funcion: "unirSala",
					params:[1]
				}
		
				game.socket.send(JSON.stringify(object));
				game.scene = "juego"
				game.changeScene();

			});

			$('#hard').click(function() { 
				var object = {
					funcion: "unirSala",
					params:[1.2]
				}
		
				game.socket.send(JSON.stringify(object));
				game.scene = "juego"
				game.changeScene();

			});

		})

	}

	drawCanvas(){

		//document.getElementById("botonesSelector").style.display = "none";
		//document.getElementById("title").style.display = "none";
		document.getElementById("playground").style.display = "block";

		this.initialize();

	}

	changeScene(){

		switch(this.scene){
			case 'selector': this.drawSelector();
			break;
			case 'juego': this.drawCanvas();
			break;
		}
	}

	keyManager(code, press){

		var object;
		switch (code) {
		case 32:
			object = {
				funcion: "jumpPress",
				params:[press] //ONKEYDOWN TRUE, ONKEYUP FALSE
			}
			break;
		case 69:
			object = {
				funcion: "nitroPress",
				params:[press] //ONKEYDOWN TRUE, ONKEYUP FALSE
			}
			break;

		}

		game.socket.send(JSON.stringify(object));

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
		
		
		this.context.clearRect(0,0,this.canvas.width, this.canvas.height);
		this.context.save();
		
		this.drawBack();

		this.context.restore();


		///////////////// PLATAFORMAS DE ABAJO //////////////////////////////////

		let posPlat = [0,this.canvas.height-70];
		for(var i = 0; i < 9; i++){

				this.context.drawImage(this.platform, posPlat[0] + (i*100),posPlat[1], 100, 100);

		}

		/////////////////////////// PLATAFORMAS DE ARRIBA /////////////////////////////////////

		posPlat = [0,180]; //140 ES LA ALTURA DEL PERSONAJE. DEJAMOS UN ESPACIO
		
		for(var j = 0; j < 9; j++){

			this.context.drawImage(this.platform, posPlat[0] + (j*100),posPlat[1], 100, 100);
		
		}

		///////////////////////////////////////////////////////

		for (var id in this.racers) {
			this.racers[id].draw(this.context);
		}

		this.itemsPrueba.forEach(i=>{
			i.draw(this.context);
		})
		
	}

	addRacer(id, sprite, pos, sprites) {
		this.racers[id] = new Racer();

		for(var i = 0; i < sprites.length; i++){

			this.racers[id].sprites[i] = new Image();
			this.racers[id].sprites[i].src = "../../resources/SPRITES/" + sprite + "/" + sprite + "." + sprites[i] + ".png";

		}
        this.racers[id].position = pos;
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

	connect() {

			this.socket = new WebSocket('ws://'+ 'crazy.localtunnel.me/race');

            this.socket.onopen = () => {

                    // Socket open.. start the game loop.
                    console.log('Info: WebSocket connection opened.');
                    console.log('Info: Press an arrow key to begin.');
                    
                    var ping = "ping"
					setInterval(() => this.socket.send(JSON.stringify(ping)), 5000);
					
					game.changeScene();
            }

            this.socket.onclose = () => {
                    console.log('Info: WebSocket closed.');
                    this.stopGameLoop();
            }

            this.socket.onmessage = (message) => {

                    var packet = JSON.parse(message.data);
                    game.funciones[packet.function](packet.params);
                    
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
	game.scene = "juego"
	game.changeScene();
	//game.connect();

}