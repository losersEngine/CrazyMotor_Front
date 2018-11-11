
var name;
var scene;
var width, height;

var widthBack = 3100;
var heightBack = 1860;

class Item{

	constructor(t = "", p = [0,0], state = 0){
		
		this.type = t;
		this.animation = 0; //Frame de animacion
		this.position = p;
		this.size = [];
		this.state = state;
		this.sprites = []; //sprites de animacion
		
		this.getSprites();
		this.updateState(state);

	}

	updateState(state){

		if(this.type == "laser"){
			switch(state){
				case 0: this.state = 0;
				break;
				case 1: this.state = 1;
				break;
				case 2: this.state = 2;
				break;
			}

		}

		if(this.type == "box"){

			switch(state){
				case 0: this.state = 3;//normal
				break;
				case 1: this.state = 1; 
				break;
			}

		}

		if(this.type == "nitro"){

			switch(state){
				case 0: this.state = 2;
				break;
				case 1: this.state = 1;
				break;
			}

		}

		if(this.type == "trampoline"){

			switch(state){
				case 0: this.state = 2;
				break;
				case 1: this.state = 1;
						this.size[1] = 170;
				break;
			}

		}

		if(this.type == "fall"){

			switch(state){
				case 0: this.state = 1;
				break;
				
			}

		}

		if(this.type != "laser"){
			this.animation = this.animation == this.sprites.length- this.state?0: this.animation+1;
			
		}else{
			this.animation = this.state;
		}

	}

	getSprites(){

		if(this.type == "box"){
			this.sprites = game.animationsBox;
			this.size = [100,80];
		}else if(this.type == "laser"){
			this.sprites = game.animationsLaser;
			this.size = [200,550];
		}else if(this.type == "nitro"){
			this.sprites = game.animationsNitro;
			this.size = [40,50];
		}else if(this.type == "trampoline"){
			this.sprites = game.animationsTramp;
			this.size = [110,110];
		}else if(this.type == "fall"){
			this.sprites = game.animationsFall;
			this.size = [100,100];
		}

	}

	draw(context){

		//console.log("type: " + this.type + ",state: " + this.state + ", animation: " + this.animation + ", typeImage: " + typeof this.sprites[this.animation])
		context.drawImage(this.sprites[this.animation],this.position[0], this.position[1],this.size[0], this.size[1]);
		
	}

}
class Racer {

	constructor(name) {

		this.name = name;
		this.animation = 0;
		this.size = [90,140];
		this.state = 2;
		this.velocity = 0.5;
        this.position = [];
		this.sprites = [];
		this.nitro = 0;

	}

	updateState(state){

		switch(state){
			case 'Avanzando': this.state = 2;
			break;
			case 'Golpeando': this.state = 4;
			break;
			case 'Saltando': this.state = 1
			break;
			case 'CambioLinea': this.state = 1;

		}

		if(this.state != 1)
			this.animation = this.animation >= this.sprites.length - this.state?0: this.animation+1; 
		else
			this.animation = 4; //salto

	}
	
	drawName(context){

		context.font = "bold 24px AGENCY FB";
		context.textAlign="center";
		context.fillStyle = "black"
		context.fillText(this.name, this.position[0] + 50, this.position[1] - 5)

	}

	draw(context) {

		context.drawImage(this.sprites[this.animation],this.position[0], this.position[1],this.size[0], this.size[1]); 
		this.drawName(context);
		
	}

}

class Game {

	constructor(){
	
		this.percentToGoal = 0;
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
		this.animationsTramp = [];
		this.animationsFall = [];
		this.addAnimationsItems();
		////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

		this.playerId = 0;
		this.join = false;
		this.skipTicks = 1000 / this.fps;
        this.nextGameTick = (new Date).getTime();
		var that = this;
		
        this.funciones = {

            join: function(message){ //message = params
				if(that.join == false){
					that.playerId = message.pj.length-1; //GUARDAMOS CUAL ES EL PERSONAJE QUE MANEJAMOS
					that.join = true;
				}

                for (var j = 0; j < message.pj.length; j++) {

					let sprite = j == 0?"sprite1":"sprite2";
					that.addRacer(message.pj[j].id, sprite, message.pj[j].pos,[1,2,3,4,5]);
					
				}

				if(message.pj.length == 1){ //esperamos a jugador 2

					that.drawMessage("ESPERANDO A JUGADOR 2");

				}
				
			},
			countdown: function(message){ //message = params
				
				that.drawMessage(message.count);
				
			},
			updateGoal(message){ //message = params
				
				that.percentToGoal = message.percent;

			},
            update: function(message){
    
                for (let i = 0; i < message.pj.length; i++) { //state es la animacion a mostrar
                    
                    that.updateRacer(message.pj[i].id, message.pj[i].state,message.pj[i].pos);
				}
				this.updateItems(message);
			},
			updateItems: function(message){

				let items = message.items; //array de items (posicion, tipo)

				that.itemsPrueba = [];
				items.forEach(item=>{

					let posX = (that.canvas.width * item.pos[0]) / widthBack ;
					let posY = (that.canvas.height * item.pos[1]) / heightBack ;

					let i = new Item(item.type, [0,0], item.state);
					let pos = [];
					
					i.position[0] = posX - (i.size[0]/2);
					i.position[1] = posY - i.size[1];

					that.itemsPrueba.push(i);
					
				});

			},
            leave: function(message){
                that.removeRacer(message.id);
            },
            start: function(message){

				that.startGameLoop();
				
			},
            finPartida: function(message){// message = params
    
				that.stopGameLoop();
				
                window.setTimeout(function(){
        
                    //game.context.clearRect(0,0,900,540);
                    that.context.font="20pt AGENCY FB";
                   // that.context.fillStyle = "#CCCCCC";
        
                    if(message.winner == null)
                        that.context.fillText("¡Empate!",90,240);
                    else{
						let winner = message.winner == 0? "Jugador1" : "Jugador2"
						that.context.fillText("¡Ha ganado: " + winner + "!",that.canvas.width/2,that.canvas.height/2);
					}
					//window.setTimeout (salir, 2000);
					
                }, 2000);
    
			}
			
        }
	}
	
	drawMessage(text){

		//this.context.clearRect(this.canvas.width/2,this.canvas.height/2,50, 50);
		this.context.font = "20px AGENCY FB";
		//this.context.fillStyle = ;
		this.context.textAlign="center";
		this.context.fillText(text,this.canvas.width/2,this.canvas.height/2)

	}
	addAnimationsItems(){

		let box = ["caja1","caja2","caja3"];
		let fall = ["wall_normal"]
		let laser = ["laser1","laser2","laser3"];
		let nitro = ["nitro1","nitro2"];
		let trampolin = ["saltador","saltador2"];

		let c = 0;

		box.forEach(b=>{

			this.animationsBox.push(new Image());
			this.animationsBox[c].src = "../../resources/SPRITES/caja" + "/" + b + ".png";
			c++;

		});

		c = 0;

		fall.forEach(f=>{

			this.animationsFall.push(new Image());
			this.animationsFall[c].src = "../../resources/ESCENARIOS/" + f + ".png";

		})

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

		c = 0;
		
		trampolin.forEach(t=>{

			this.animationsTramp.push(new Image());
			this.animationsTramp[c].src = "../../resources/SPRITES/trampolin" + "/" + t + ".png";
			c++;
			
		});

	}
 
	calcOffset(){

		var frameGapTime = this.nextGameTick - this.lastFrameRepaintTime;
		this.lastFrameRepaintTime = this.nextGameTick;
		var translateX = this.velocity * (frameGapTime/1000);

		return translateX;

	}

	initialize() {	
	
		this.racers = [];
		this.itemsPrueba = [];
				
		/*this.itemsPrueba =
		{
		   items:[
			   {
				   type: "trampoline",
				   pos:[100,100],
				   state: 1 //posicion del array de sprites a mostrar
			   },
			   {
				type: "fall",
				pos:[100,200],
				state: 1 //posicion del array de sprites a mostrar
			}
		   ]
	   }*/

	   /////////////////////////// CANVAS ///////////////////////////////////////////

		this.canvas = document.getElementById('playground');
		if (!this.canvas.getContext) {
			Console.log('Error: 2d canvas not supported by this browser.');
			return;
		}

        this.context = this.canvas.getContext('2d');
		
		var that = this;
		
		///////////////////////////////////////// DISTANCIA A LA META //////////////////////////////////////////////////////////////

		//posicion inicial del triangulo que marca la distancia a la meta. Se ira actualizando, pero no en todos los frames
		this.triangle = [[this.canvas.width/2-210,this.canvas.height-50],[this.canvas.width/2-200,this.canvas.height-42],[this.canvas.width/2-190,this.canvas.height-50]];

		/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

		///////////////////////// FONDO ////////////////////////////////////////

		this.background = new Image();
		this.background.src = "../../resources/ESCENARIOS/background.png";
		this.background.onload = function(){
			that.context.drawImage(that.background, 0,0, that.canvas.width, that.canvas.height);
		}

		/////////////////////////// PLATAFORMAS ////////////////////////////////////////////////

		this.platform = new Image();
		this.platform.src = "../../resources/ESCENARIOS/wall_grass.png";

		let pos = [0,this.canvas.height - 190]; //jugador1

		/////////////////////////////////////AÑADIMOS JUGADOR DE PRUEBA //////////////////////////////////////////////////////////////////////////////////////

		
		
		/*this.addRacer(0,"sprite1",pos,[1,2,3,4,5]);

		pos = [0,60];
		this.addRacer(1,"sprite2",pos,[1,2,3,4,5]);
		this.racers[1].sprites[this.racers[1].sprites.length-1].onload = function(){ //hasta que no se carga la ultima animacion, no se empieza el gameloop

			that.startGameLoop(); //EL GAMELOOP DEBERIA INICIARSE CUANDO NOS LO INDIQUE BACK
			

		}*/

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

	   //this.funciones.updateItems(this.itemsPrueba);
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
					params:["1"]
				}
		
				game.socket.send(JSON.stringify(object));
				game.scene = "juego"
				game.changeScene();

			});

			$('#hard').click(function() { 
				var object = {
					funcion: "unirSala",
					params:["1.2"]
				}
		
				game.socket.send(JSON.stringify(object));
				game.scene = "juego"
				game.changeScene();

			});

		})

	}

	drawCanvas(){

		document.getElementById("botonesSelector").style.display = "none";
		document.getElementById("title").style.display = "none";
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
		let p = press == true?"true":"false";
		switch (code) {
		case 32:
			console.log("saltooo")
			object = {
				funcion: "jumpPress",
				params:[p] //ONKEYDOWN TRUE, ONKEYUP FALSE
			}
			break;
		case 65:
			console.log("nitroooo")
			object = {
				funcion: "nitroPress",
				params:[p] //ONKEYDOWN TRUE, ONKEYUP FALSE
			}
			break;

		}

		//game.socket.send(JSON.stringify(object));

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
		
		//this.percentToGoal = this.percentToGoal >= 100?0:this.percentToGoal+0.11;
		
		this.context.clearRect(0,0,this.canvas.width, this.canvas.height);
		this.context.save();
		
		this.drawBack();

		this.context.restore();

		////////////////// NOMBRE DEL PERSONAJE MANEJADO //////////////////////

		this.context.font = "30px AGENCY FB";
		this.context.fillText(this.racers[this.playerId].name, 10, 40);

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
		
		this.drawNitroLevel();
		this.drawTriangleToGoal();
		this.drawMedidor();

	}

	drawNitroLevel(){

		this.context.beginPath();
		this.context.lineWidth="4";
		this.context.fillStyle="black";
		this.context.fillRect(this.canvas.width-200,40,150,10);
		//this.racers[this.playerId].nitro es el nivel de nitro
		this.context.fillStyle="orange";
		let p = (150 * this.racers[this.playerId].nitro) / 100;
		this.context.fillRect((this.canvas.width-200) + p,40,150,10);

	}

	drawTriangleToGoal(){

		//nuestro rectangulo mide 300 de ancho
		//ejemplo: percent es a 100 como x es a 300
		let posv1 = [this.canvas.width/2-210,this.canvas.height-50];
		let posv2 = [this.canvas.width/2-200,this.canvas.height-42];
		let posv3 = [this.canvas.width/2-190,this.canvas.height-50];
		
		if(this.percentToGoal < 100){
			let p = 300 * this.percentToGoal / 100;
			this.triangle[0][0] = posv1[0] + p;
			this.triangle[1][0] = posv2[0] + p;
			this.triangle[2][0] = posv3[0] + p;
			
		}else{
			this.triangle = [posv1,posv2,posv3];
		}

	}

	drawMedidor(){

		this.context.beginPath();
		this.context.lineWidth="4";
		this.context.fillStyle="black";

		//barra lateral izquierda
		this.context.fillRect(this.canvas.width/2-205,this.canvas.height-47,5,20);
		//bara lateral derecha
		this.context.fillRect(this.canvas.width/2  + 100,this.canvas.height-47,5,20);
		//barra horizontal de progreso
		this.context.fillRect(this.canvas.width/2-200,this.canvas.height-40,300,5);
		
		this.context.beginPath();
		this.context.fillStyle="red";

		this.context.moveTo(this.triangle[0][0],this.triangle[0][1]);
		this.context.lineTo(this.triangle[1][0],this.triangle[1][1]);
		this.context.lineTo(this.triangle[2][0],this.triangle[2][1]);
		this.context.closePath();
		this.context.fill();
	}

	addRacer(id, sprite, pos, sprites) {

		let n = id == 0?"Jugador 1":"Jugador 2";
		this.racers[id] = new Racer(n);

		for(var i = 0; i < sprites.length; i++){

			this.racers[id].sprites[i] = new Image();
			this.racers[id].sprites[i].src = "../../resources/SPRITES/" + sprite + "/" + sprite + "." + sprites[i] + ".png";

		}
		this.racers[id].position = pos;
		
	}

	updateRacer(id, state, position) {
		if (this.racers[id]) {

			let posX = (this.canvas.width * position[0]) / widthBack ;
			let posY = (this.canvas.height * position[1]) / heightBack ; 

			this.racers[id].position[0] = posX - (this.racers[id].size[0]/2); //x
			this.racers[id].position[1] = posY - (this.racers[id].size[1]); //y

			//console.log("id: " + id + ", position: [" + this.racers[id].position[0] + ", " + this.racers[id].position[1] + "]");
			
			this.racers[id].updateState(state);

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

					var obj={

						funcion: "ping",
						params:[]

					}
					//setInterval(() => this.socket.send(JSON.stringify(obj)), 5000);
					
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

var game;
window.onload = function(){
	
	height  = screen.height - 150;
	var aspect = 5/3;
	width = height * aspect;
	$('#playground').width(width);
	$('#playground').height(height);
	game  = new Game();	
	/*
		game.scene = "juego";
		game.changeScene();
	*/	
	game.connect();

}

function mouseDown(code){
	game.keyManager(code, true);
}

function mouseUp(code){
	game.keyManager(code, false);
}