
var name;
var scene;
var width, height;

var widthBack = 1800;
var heightBack = 1080;
var totalLoaded = 20;
function onClick(code){

	game.keyManager(code, true);
	window.setTimeout (function(){

		game.keyManager(code, false);

	}, 50);

}

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
						this.size[1] = 28.30;
				break;
			}

		}

		if(this.type == "fall"){

			switch(state){
				case 0: this.state = 1;
				break;
				
			}

		}

		if(this.type == "finishLine"){

			switch(state){
				case 0: this.state = 1;
				break;
				
			}

		}


		if(this.type != "laser"){

			this.animation = this.animation >= this.sprites.length- this.state?0: this.animation+1;
			
		}else{
			this.animation = this.state;
		}

	}

	getSprites(){

		if(this.type == "box"){
			this.sprites = game.animationsBox;
			this.size = [40,40];
		}else if(this.type == "laser"){
			this.sprites = game.animationsLaser;
			this.size = [60,600]; 
		}else if(this.type == "nitro"){
			this.sprites = game.animationsNitro;
			this.size = [15,35.25];
		}else if(this.type == "trampoline"){
			this.sprites = game.animationsTramp;
			this.size = [100,9.69];
		}else if(this.type == "fall"){
			this.sprites = game.animationsFall;
			this.size = [100,100];
		}else if(this.type == "finishLine"){
			this.sprites = game.animationsGoal;
			this.size = [100,100];
		}

	}

	draw(context){

		context.drawImage(this.sprites[this.animation],this.position[0], this.position[1],this.size[0], this.size[1]);
		
	}

}
class Racer {

	constructor(name) {

		this.name = name;
		this.animation = 0;
		this.size = [29.7,90.45];
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
			case 'Golpeado': this.state = 5;
			break;
			case 'Saltando': this.state = 1
			break;
			case 'CambioLinea': this.state = 1;

		}

		if(this.state != 1){

			if(this.state != 5)
				this.animation = this.animation >= this.sprites.length - this.state?2: this.animation+1; 
			else{
				this.animation = this.animation >= 2?0: this.animation+1; 
			}
		}else
			this.animation = 4; //salto

	}
	
	drawName(context){

		let color = this.name == game.racers[game.playerId].name?"orange":"black"; //resaltamos el nombre del jugador que manejamos
		context.fillStyle = color;
		context.font = "bold 24px AGENCY FB";

		context.fillText(this.name, this.position[0] + (this.size[0]/2), this.position[1] - 5)

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
        
        this.scene = "espera";
		this.lastKeyPressed = 0;
		this.goalMarq;
		//////////////////////////////////////ANIMACIONES DE OBJETOS//////////////////////////////////////////////////////////////////////
		this.animationsBox = [];
		this.animationsLaser = [];
		this.animationsNitro = [];
		this.animationsTramp = [];
		this.animationsFall = [];
		this.animationsGoal = [];
		
		this.imagesLoaded = 0;

		////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

		this.playerId = 0;
		this.join = false;
		this.skipTicks = 1000 / this.fps;
        this.nextGameTick = (new Date).getTime();
		var that = this;

		//////////////////////////////// SPRITES JUGADORES /////////////////////////////////////////////////
		this.spritesJ1 = [];
		this.spritesJ2 = [];

		//////////////////////////////// FUNCIONES //////////////////////////////////////////
		
        this.funciones = {

			join: function(message){ //message = params
				
				if(that.join == false){

					that.playerId = message.pj[(message.pj.length)-1].id; //GUARDAMOS CUAL ES EL PERSONAJE QUE MANEJAMOS
					that.join = true;

				}

                for (var j = 0; j < message.pj.length; j++) {

					if(j == 0){

						that.addRacer(message.pj[j].id, message.pj[j].pos,that.spritesJ1, "Jugador1");

					}else{

						that.addRacer(message.pj[j].id, message.pj[j].pos,that.spritesJ2, "Jugador2");

					}
					
					
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
                    
                    that.updateRacer(message.pj[i].id, message.pj[i].state,message.pj[i].pos, message.pj[i].nitroLvl);
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
					
					i.position[0] = posX - (i.size[0]/2);
					i.position[1] = posY - i.size[1];

					that.itemsPrueba.push(i);
					
				});

			},
            leave: function(message){
                that.removeRacer(message.id);
            },
            start: function(message){

				that.main_theme.play();
				that.startGameLoop();
				
			},
            finPartida: function(message){// message = params
	
				that.main_theme.pause();
				that.stopGameLoop();
				that.winner = message.winner;
                window.setTimeout(function(){
		
					that.scene = "pantallaPuntuacion";
					that.changeScene();
					
                }, 500);
    
			}
			
		}
		
		this.changeScene();
	}
	
	drawPantallaPuntuacion(){

		this.final_theme.play();
		game.context.clearRect(0,0,this.canvas.width, this.canvas.height);
		this.context.drawImage(this.background, 0,0, this.canvas.width, this.canvas.height);
		this.context.font="30pt AGENCY FB";

		if(this.winner == null)
		this.context.fillText("¡Empate!",90,240);
		else{

			let winner = this.racers[this.winner].name;
			this.context.fillText("¡Ha ganado: " + winner + "!",this.canvas.width/2,this.canvas.height/2);

		}

	}
	drawMessage(text){

		this.context.drawImage(this.background, 0,0, this.canvas.width, this.canvas.height);
		this.context.font = "bold 30px AGENCY FB";
		this.context.textAlign="center";
		this.context.fillText(text,this.canvas.width/2,this.canvas.height/2)

	}
	addAnimationsItems(){

		let box = ["caja1","caja2","caja3"];
		let fall = ["wall_metal_pipe"]
		let laser = ["laser1","laser2","laser3"];
		let nitro = ["nitro1","nitro2"];
		let trampolin = ["saltador","saltador2"];
		let goal = ["banderameta"];
		let c = 0;

		goal.forEach(g =>{
			this.animationsGoal.push(new Image());
			this.animationsGoal[c].src = "../resources/SPRITES/banderameta" + "/" + g + ".png";
			this.animationsGoal[c].onload = function(){
				game.imagesLoaded++;
				if(game.imagesLoaded == totalLoaded) game.connect();
			}

			c++;
		});

		c = 0;

		box.forEach(b=>{

			this.animationsBox.push(new Image());
			this.animationsBox[c].src = "../resources/SPRITES/caja" + "/" + b + ".png";
			this.animationsBox[c].onload = function(){
				game.imagesLoaded++;
				if(game.imagesLoaded == totalLoaded) game.connect();
			}

			c++;

		});

		

		c = 0;

		fall.forEach(f=>{

			this.animationsFall.push(new Image());
			this.animationsFall[c].src = "../resources/ESCENARIOS/" + f + ".png";

			this.animationsFall[c].onload = function(){
				game.imagesLoaded++;
				if(game.imagesLoaded == totalLoaded) game.connect();
			}

			c++;
		})

		c = 0;

		laser.forEach(l=>{

			this.animationsLaser.push(new Image());
			this.animationsLaser[c].src = "../resources/SPRITES/laser"  + "/" + l + ".png";

			this.animationsLaser[c].onload = function(){
				game.imagesLoaded++;
				if(game.imagesLoaded == totalLoaded) game.connect();
			}
			c++;

		});

		c = 0;

		nitro.forEach(n=>{

			this.animationsNitro.push(new Image());
			this.animationsNitro[c].src = "../resources/SPRITES/nitro" + "/" + n + ".png";
			this.animationsNitro[c].onload = function(){
				game.imagesLoaded++;
				if(game.imagesLoaded == totalLoaded) game.connect();
			}
			c++;
			
		});

		c = 0;
		
		trampolin.forEach(t=>{

			this.animationsTramp.push(new Image());
			this.animationsTramp[c].src = "../resources/SPRITES/trampolin" + "/" + t + ".png";
			this.animationsTramp[c].onload = function(){
				game.imagesLoaded++;
				if(game.imagesLoaded == totalLoaded) game.connect();
			}
			c++;
			
		});

	}
 
	calcOffset(){

		var frameGapTime = this.nextGameTick - this.lastFrameRepaintTime;
		this.lastFrameRepaintTime = this.nextGameTick;
		var translateX = this.velocity * (frameGapTime/1000);

		return translateX;

	}

	loadAudio(){

		var that = this;

		this.main_theme = new Audio();
		this.main_theme.src = '../resources/Audio/Original Music/musica_pantallaDificil.mp3';

		this.main_theme.onload = function(){

			that.imagesLoaded++;
			if(that.imagesLoaded == totalLoaded) that.connect();

		}

		this.final_theme = new Audio();
		this.final_theme.src = '../resources/Audio/Original Music/musica_pantallaFinal.mp3';

		this.final_theme.onload = function(){
			that.imagesLoaded++;
			if(that.imagesLoaded == totalLoaded) that.connect();
		}
	}
	loadImages(){

		this.addAnimationsItems();
		
		this.goalMarq = new Image();
		this.goalMarq.src = "../resources/SPRITES/Banderaf1/banderaF1.png";

		this.goalMarq.onload = function(){
			
			game.imagesLoaded++;
			if(game.imagesLoaded == totalLoaded) game.connect();
		}
		this.background = new Image();
		this.background.src = "../resources/ESCENARIOS/background.png";

		this.background.onload = function(){
			game.imagesLoaded++;
			if(game.imagesLoaded == totalLoaded) game.connect();
		}

		this.platforms = [];
		let p1 = new Image();
		p1.src = "../resources/ESCENARIOS/wall_grass.png"; //plataforma de abajo

		this.platforms.push(p1);

		this.platforms[0].onload = function(){
			game.imagesLoaded++;
			if(game.imagesLoaded == totalLoaded) game.connect();
			
		}
		let p2 = new Image();
		p2.src = "../resources/ESCENARIOS/wall_metal.png"; //plataforma de arriba

		this.platforms.push(p2);

		this.platforms[1].onload = function(){
			game.imagesLoaded++;
			if(game.imagesLoaded == totalLoaded) game.connect();
			
		}

		////////////////// SPRITES DE PERSONAJES //////////////////////////////////
		var sprites = [6,7,1,2,3,4,5];
		for(var i = 0; i < sprites.length; i++){

			let s = new Image();
			s.src = "../resources/SPRITES/sprite1/sprite1." + sprites[i] + ".png";

			this.spritesJ1.push(s);

			var that = this;
			this.spritesJ1[i].onload = function(){

				if(that.spritesJ1.length == sprites.length) that.imagesLoaded++;
				if(that.imagesLoaded == totalLoaded) that.connect();

			}
		}

		for(var i = 0; i < sprites.length; i++){

			let s = new Image();
			s.src = "../resources/SPRITES/sprite2/sprite2." + sprites[i] + ".png";

			this.spritesJ2.push(s);

			var that = this;
			this.spritesJ2[i].onload = function(){
				
				if(that.spritesJ2.length == sprites.length) that.imagesLoaded++;
				if(that.imagesLoaded == totalLoaded) that.connect();

			}
		}

	}

	initialize() {	
	
		this.racers = [];
		this.itemsPrueba = [];

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
		this.triangle = [[this.canvas.width/2-210,this.canvas.height-40],[this.canvas.width/2-200,this.canvas.height-33],[this.canvas.width/2-190,this.canvas.height-40]];

		/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

		this.context.drawImage(that.goalMarq, that.canvas.width/2  + 100,that.canvas.height-32,10,100);
		
		///////////////////////// FONDO ////////////////////////////////////////

		this.context.drawImage(that.background, 0,0, that.canvas.width, that.canvas.height);

		
		window.addEventListener('keydown', e => {
			
			var code = e.which || e.charCode || e.keyCode ;
			console.log("letra: " + code)
			game.lastKeyPressed = code;
			game.keyManager(code, true);
			
		}, false);

		window.addEventListener('keyup', e => {
			
			var code = game.lastKeyPressed;
			game.keyManager(code, false);
			
		}, false);

    }
	
	drawSelector(){

		document.getElementById('botonesSelector').classList.remove('hide');
		document.getElementsByClassName('boton')[0].classList.remove('hide');
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

		let nodes = document.getElementsByClassName("actionMobile");
		for(var i = 0; i < nodes.length; i++){
			nodes[i].classList.remove("hide");
		}

		document.getElementById("botonesSelector").style.display = "none";
		document.getElementById("playground").style.display = "block";

		this.initialize();

	}

	changeScene(){

		switch(this.scene){
			case 'espera': this.drawEspera();
			break;
			case 'selector': this.drawSelector();
			break;
			case 'juego': this.drawCanvas();
			break;
			case 'pantallaPuntuacion': this.drawPantallaPuntuacion();
			break;
		}
	}

	keyManager(code, press){

		var object;
		switch (code) {
		case 32:
			//console.log("saltooo")
			object = {
				funcion: "jumpPress",
				params:[press] //ONKEYDOWN TRUE, ONKEYUP FALSE
			}
			break;
		case 97:
			//console.log("nitroooo")
			object = {
				funcion: "nitroPress",
				params:[press] //ONKEYDOWN TRUE, ONKEYUP FALSE
			}
			break;
		case 65:
			//console.log("nitroooo")
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
		
		//this.percentToGoal = this.percentToGoal >= 100?0:this.percentToGoal+0.11;
		//console.log("[" + this.canvas.width + ", " + this.canvas.height + "]")
		this.context.clearRect(0,0,this.canvas.width, this.canvas.height);
		this.context.save();
		
		this.drawBack();

		this.context.restore();

		///////////////// PLATAFORMAS DE ABAJO //////////////////////////////////

		let posPlat = [0,this.canvas.height-70];
		
		for(var i = 0; i < 9; i++){

				this.context.drawImage(this.platforms[0], posPlat[0] + (i*100),posPlat[1], 100, 100);

		}

		/////////////////////////// PLATAFORMAS DE ARRIBA /////////////////////////////////////

		posPlat = [0,180]; //140 ES LA ALTURA DEL PERSONAJE. DEJAMOS UN ESPACIO
		
		for(var j = 0; j < 9; j++){

			this.context.drawImage(this.platforms[1], posPlat[0] + (j*100),posPlat[1], 100, 100);
		
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
		this.context.fillStyle="orange";
		let p = (150 * this.racers[this.playerId].nitro) / 100;
		this.context.fillRect(this.canvas.width-200,40,p,10);
		this.context.drawImage(this.animationsNitro[0], this.canvas.width - 40, 30,10,20);

	}

	drawTriangleToGoal(){

		//nuestro rectangulo mide 300 de ancho
		//ejemplo: percent es a 100 como x es a 300
		let posv1 = [this.canvas.width/2-210,this.canvas.height-40];
		let posv2 = [this.canvas.width/2-200,this.canvas.height-33];
		let posv3 = [this.canvas.width/2-190,this.canvas.height-40];

		if(this.percentToGoal < 100){
			let p = 300 * this.percentToGoal / 100;
			this.triangle[0][0] = posv1[0] + p;
			this.triangle[1][0] = posv2[0] + p;
			this.triangle[2][0] = posv3[0] + p;
			
		}

	}

	drawMedidor(){

		this.context.beginPath();
		this.context.lineWidth="4";
		this.context.fillStyle="black";

		//barra lateral izquierda
		this.context.fillRect(this.canvas.width/2-205,this.canvas.height-32,5,20);
		//bara lateral derecha
		this.context.fillRect(this.canvas.width/2  + 100,this.canvas.height-32,5,20);
		this.context.drawImage(this.goalMarq, this.canvas.width/2  + 100,this.canvas.height-50,40,30);

		//barra horizontal de progreso
		this.context.fillRect(this.canvas.width/2-200,this.canvas.height-25,300,5);
		
		this.context.beginPath();
		this.context.fillStyle="red";

		this.context.moveTo(this.triangle[0][0],this.triangle[0][1]);
		this.context.lineTo(this.triangle[1][0],this.triangle[1][1]);
		this.context.lineTo(this.triangle[2][0],this.triangle[2][1]);
		this.context.closePath();
		this.context.fill();
		
	}

	addRacer(id, pos, sprites,n) {

		this.racers[id] = new Racer(n);
		console.log('sprites predefinidos: ' + sprites);
		this.racers[id].sprites = sprites;
		console.log('sprites: ' + this.racers[id].sprites);
		this.racers[id].position = pos;
		
	}

	updateRacer(id, state, position, nitro) {

		if (this.racers[id]) {

			let posX = (this.canvas.width * position[0]) / widthBack ;
			let posY = (this.canvas.height * position[1]) / heightBack ; 

			this.racers[id].position[0] = posX - (this.racers[id].size[0]/2); //x
			this.racers[id].position[1] = posY - (this.racers[id].size[1]); //y
			this.racers[id].nitro = nitro;
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

	finEspera(){

		clearInterval(this.espera.draw);
		document.getElementById("espera").style.display = "none";
		this.scene = 'selector';
		this.changeScene();
		resize()

	}
	connect() {

		
			this.socket = new WebSocket('wss://'+ '35.242.128.189:7070/race'); //'wss://'+ 'crazy.localtunnel.me/race'   35.242.151.162:7070/race

			var that = this;
            this.socket.onopen = () => {

					that.finEspera();
                    // Socket open.. start the game loop.
                    console.log('Info: WebSocket connection opened.');
                    console.log('Info: Press an arrow key to begin.');

					var obj={

						funcion: "ping",
						params:[]

					}

					setInterval(() => this.socket.send(JSON.stringify(obj)), 5000);
										
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

	drawEspera(){

		this.espera = new Espera();
	
	}

}

class Espera {

	constructor(){

		this.canvas = document.getElementById('espera');
		this.context = this.canvas.getContext('2d');
		this.logo = new Image();
		this.logo.src = '../resources/INTERFACES/menu_loading.png';
		this.actualAnimation = 0;

		var that = this;

		this.logo.onload = function(){

			that.context.drawImage(that.logo, that.canvas.width/2 - 300, 100, 635.33, 99.33);

		}

		this.loading = ['loading_1','loading_2','loading_3'];
		this.animationsLoading = [];

		this.loading.forEach(logo=>{
			let l = new Image();
			l.src = '../resources/INTERFACES/' + logo + '.png';

			this.animationsLoading.push(l);

		});

		that = this;

		this.animationsLoading[2].onload = function(){

			that.draw = setInterval(function(){
				that.load();
			},500);

		}

	}

	load(){

		this.context.clearRect(0,0,this.canvas.width, this.canvas.height);
		this.context.drawImage(this.logo, this.canvas.width/2 - 300, 100, 635.33, 99.33);
		this.context.drawImage(this.animationsLoading[this.actualAnimation], 0, this.canvas.height/2 - 90, 910,540);
		this.actualAnimation = this.actualAnimation >= this.animationsLoading.length-1?0 : this.actualAnimation+1;
		
	}
}

var game;
window.onload = function(){
	
	game  = new Game();	
	resize();
	game.loadImages();
	game.loadAudio();

	/*
		game.scene = "juego";
		game.changeScene();
	*/
	
	/*while(imagesLoaded < 9){

	}*/
	//game.connect();

}

window.onresize = function(){
	resize();
}

function exit(){
	game.final_theme.pause();
	game.main_theme.pause();
	window.location = '../index.html';
}
function resize(){

	let canvas = game.scene === 'espera'?'#espera':'#playground';
	if(game.scene === 'espera'){ //pantalla completa
		height  = document.documentElement.clientHeight;
		width = document.documentElement.clientWidth;
	}else{ //dejamos un poco de margen
		let widthClient = document.documentElement.clientWidth;
		let x = widthClient >= 1024?0:65;
		height  = document.documentElement.clientHeight - x;
		let aspect = x == 0?1:3/5;
		width = (document.documentElement.clientWidth * aspect);

		if(aspect==1){

			width = width/1.2;
			height = height/1.2;
			document.getElementById('playground').style.transform = 'translate(10%,0%)';

		}
			
	}

	$(canvas).width(width);
	$(canvas).height(height);
	console.log("ancho: " + width)
	console.log("alto: " + height)
	

}

