
var name;
var scene;
var width, height;

function pedirNombre() //solicitar nombre de usuario
{

    do{
    
        name=prompt("Inserta tu nombre","Nombre"); //Nombre es el valor por defecto que tiene la variable name
        
	}while(name == "Nombre" || name == "null"); //mientras no escriba nada o lo deje en blanco se le sigue solicitando
												//pues el nombre es imprescindible para jugar


	var newSnake = {
						
		funcion: "crearSerpiente", //metodo que se llama desde el handleText
		params: [name]
	
	}
	game.socket.send(JSON.stringify(newSnake)); //envio de mensaje al socket


}

let enPartida = false; //indica si el jugador esta en partida (true) o en el lobby (false)
let salaP = null; //nombre de la sala donde se encuentra el usuario

class Racer {

	constructor() {
        this.position = [];
		this.name = null;
		this.sprite = null;
		this.points = 0;

	}

	draw(context) {
		for (var pos of this.position) {
			context.fillStyle = this.color;
			context.fillRect(pos.x, pos.y,
				game.gridSize, game.gridSize);
		}
	}
}

function salir(){ //metodo para salir de una sala (este o no jugando)

	
	if(game.nextFrame != null) //si no se ha parado el juego, se para
		game.stopGameLoop();
	else //si el juego esta parado (esta en la sala esperando a entrar a jugar) se limpia el canvas
		//game.context.clearRect(0, 0, 900, 540);

	var o = {

		funcion: "salirSala", //funcion en Java
		params: []

	}
	game.socket.send(JSON.stringify(o));
	
	borrarDiv('#salaActual'); //borramos el div que contiene los nombres de los jugadores en la sala
	document.getElementById("partidas-container").style.display = 'inline-block';
	document.getElementById("serpiente").style.display = "block";
	document.getElementById("ranking").style.display = "inline-block";
	salaP = null; //lo ponemos a null porque al salir de la sala, ya no se encuentra en esa partida
	partidas(); //hacemos get de las partidas que hay creadas (APIRest)

}

class Food { //clase para la comida 

	constructor () {
		this.x =-1; //posicion en x
		this.y=-1; //posicion en y
		this.color= null; //color
	}
	
	draw (context){
		
		context.fillStyle = this.color;
		context.fillRect (this.x,this.y,game.gridSize,game.gridSize);
	}
}

class Game {

	constructor(){
	
		this.fps = 30;
		this.velocity = 100;
		this.distance = 0;
		var lastFrameRepaintTime = 0;
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

	
	resizeCanvas(){
		height  = screen.height - 150;
		var aspect = 5/3;
		width = height * aspect;
		$('#playground').width(width);
		$('#playground').height(height);
	}
	initialize() {	
	
		this.racers = [];
		//this.food = new Food();
		this.resizeCanvas();
		this.canvas = document.getElementById('playground');
		if (!this.canvas.getContext) {
			//Console.log('Error: 2d canvas not supported by this browser.');
			return;
		}
		
		
        this.context = this.canvas.getContext('2d');
		let pos = [0,0];
		
		var that = this;
		

		this.background = new Image();
		this.background.src = "../../resources/ESCENARIOS/background.png";
		this.background.onload = function(){
			that.context.drawImage(that.background, 0,0, that.canvas.width, that.canvas.height);
		}

		this.addRacer(0,"sprite1","jugador1",0,pos);
		this.racers[0].sprite.onload = function(){
			that.context.drawImage(that.racers[0].sprite, 100, 100, 110.4,205.2);
		}

		
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
		
		this.start();
        //this.connect();
       // this.changeScene();
    }
    
    drawBack(time){
		
		this.distance += this.calcOffset(time);
		if(this.distance > this.background.width){
			this.distance = 0;
		}

		this.context.clearRect(0,0,this.canvas.width, this.canvas.height);
		this.context.save();
		this.context.translate(this.distance,0);
		this.context.drawImage(this.background, 0, 0);
		this.context.drawImage(this.background, -this.background.width+1, 0);

		var that = this;
		var nextFrame = () => {

			requestAnimationFrame(() => that.drawback());
			
		}
		
		nextFrame();

		this.context.restore();
	}

	start(){
		this.lastFrameRepaintTime = window.performance.now();
		requestAnimationFrame(this.drawBack());
	}   
    drawMenu(){
        
        console.log("usamos el contexto")
        //this.context.clearRect(0, 0, 900, 540);
        //var d = document.getElementById("salaActual");
        //borrarDiv('#salaActual');
        this.context.font = "20px Tw Cen MT";
        this.context.fillStyle = "white";
        this.context.textAlign = "center";
        //salaP = sala;
        //this.context.fillText("Crazy Motor" , 300, 50);
        
    }

    drawCredits(){

    }

    drawDifficultSelector(){

        //this.context.clearRect(0, 0, 900, 540);
        let btn = document.getElementById("botonesMenu");
        document.getElementById("render").removeChild(btn);

    }

    drawFinalScene(){


    }

    changeScene(){

        switch(this.scene){

            case "menu": this.drawMenu();
            break;
            case "credits": this.drawCredits();
            break;
            case "difficultSelector": this.drawDifficultSelector();
            break;
            case "finalScene": this.drawFinalScene();
            break;

        }
        
    }

	setDirection(direction) {
		this.direction = direction;
                var dir = {
                    
                    funcion:"direccion",
                    params:[this.direction]
                    
                }
		this.socket.send(JSON.stringify(dir));

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
		for (var id in this.racers) {
			this.drawPoints(space, id);			
			this.racers[id].draw(this.context);
			space += 40;
		}
		this.food.draw(this.context);
	}

	addRacer(id, sprite,name,ptos, pos) {
		this.racers[id] = new Racer();
		this.racers[id].sprite = new Image();
		this.racers[id].sprite.src="../../resources/SPRITES/" + sprite + "/" + sprite + ".1.png";
        this.racers[id].name = name;
        this.racers[id].position = pos;
		this.racers[id].points = ptos;
	}

	drawImage(){

		this.context.drawImage(this.racers[0].sprite, 100, 100, 80,38);
		

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
			//this.context.clearRect(0, 0, 900, 540);
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
	sala(jugadores,sala,creador){ //sala de espera para entrar a partida (se llama cada vez que entra un jugador en la sala)
		
		////OCULTAMOS LOS ELEMENTOS DEL LOBBY
		//document.getElementById("serpiente").style.display = "none";
		//document.getElementById("ranking").style.display = "none";
		////CREAMOS LOS ELEMENTOS DE LA SALA
		//game.context.clearRect(0, 0, 900, 540);
		var d = document.getElementById("salaActual");
		borrarDiv('#salaActual');
		this.context.font = "20px Tw Cen MT";
		this.context.fillStyle = "white";
		this.context.textAlign = "center";
		salaP = sala;
		this.context.fillText("Sala: " + sala, 300, 50);
		var alto = 50;
		var b1 = document.createElement("button");
		b1.id = "salir";
		b1.textContent = "Salir";

		b1.addEventListener("click", salir); //boton de salir de la sala
		
		d.appendChild(b1);
		if(jugadores.length >= 2 && name === creador){ //si hay 2 o mas jugadores, y el usuario es el creador de la sala, le aparece el boton de comenzar partida

			var b2 = document.createElement("button");
			b2.textContent = "Comenzar juego";
			b2.id = "comenzar";
			b2.addEventListener("click",function(){ //comienza partida

				var ob = {

					funcion: "comenzarPartida", //metodo invocado en Java
					params: [salaP] //le pasamos el nombre de la sala para avisar a todos los jugadores que hay en ella

				}

				game.socket.send(JSON.stringify(ob));

			})
			d.appendChild(b2);

		}

		//MOSTRAMOS LOS JUGADORES QUE HAY EN LA SALA
		var inc = 0;
		for(var i = 0; i < jugadores.length; i++){

			inc += 50;
			this.context.font = "20px Tw Cen MT";
			this.context.fillText(jugadores[i], 300, alto + inc);

		}
	
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

function finEspera(){ //eliminamos el boton de cancelar y el mensaje

	document.getElementById("cancelar").style.display = 'none';

}
function espera(){ //el usuario espera por si sale un jugador

	borrarDiv('#cancelar');
	var n = document.getElementById("cancelar");
	n.style.display = 'inline-block';
	n.innerHTML = "Intentando unirse \n a la sala...";
	var boton = document.createElement("button");
	boton.textContent = "Cancelar";
	boton.id = "cancelarEspera";
	boton.addEventListener("click", function(){ //si el usuario decide cancelar, se lo decimos al servidor

		finEspera();
		var ob = {

			funcion: "cancelarEspera",
			params: []

		}

		game.socket.send(JSON.stringify(ob));
		
		
	});

	n.appendChild(boton);

}
function addListaJugadores(jugadores){ //actualizamos la lista de jugadores online (se une un usuario)

	$('#lista').empty();
	document.getElementById("lista").textContent = "Jugadores Online";
	for(var i = 0; i < jugadores.length; i++){
		var j = document.createElement("div");
		j.id = jugadores[i];
		j.textContent = jugadores[i];
		document.getElementById("lista").appendChild(j);
	}

}

function removeListaJugadores(jugador){ //actualizamos la lista de jugadores online (se desconecta un usuario)

	var n = document.getElementById(jugador);
	document.getElementById("lista").removeChild(n);

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

function buscar(dif){ //Matchmaking
	
	document.getElementById("selector").style.display = 'none';
	var o = {
		
		funcion: "matchMaking",
		params:[dif] //dificultad seleccionada por el usuario

	}

	game.socket.send(JSON.stringify(o));

}
function selector(funcion){ //selector de dificultad

	document.getElementById("partidas-container").style.display = "none";
	var dificultad; //facil:1,medio:2,dificil:4
	var sel = document.getElementById("selector");
	borrarDiv('#selector');
	sel.style.display = 'inline-flex';
	var p1 = document.createElement('p');
	p1.innerHTML = "SELECCIONE UNA DIFICULTAD";
	sel.appendChild(p1);
	var p2 = document.createElement('p');
	var facil = document.createElement('button');
	facil.textContent = "FÁCIL";
	facil.id = "f";
	facil.addEventListener("click",function(){

		dificultad = 1
		if(funcion=="post")
			postPartida(dificultad);
		else
			buscar(dificultad);

		document.getElementById("partidas-container").style.display = "inline-block";
	});
	p2.appendChild(facil);
	sel.appendChild(p2);
	
	var p3 = document.createElement('p');
	var medio = document.createElement('button');
	medio.textContent = "NORMAL";
	medio.id = "m";
	medio.addEventListener("click",function(){

		dificultad = 2
		if(funcion=="post")
			postPartida(dificultad);
		else
			buscar(dificultad);
		document.getElementById("partidas-container").style.display = "inline-block";
	});
	p3.appendChild(medio);
	sel.appendChild(p3);
	var p4 = document.createElement('p');
	var dificil = document.createElement('button');
	dificil.textContent = "DIFÍCIL";
	dificil.id = "d";
	dificil.addEventListener("click",function(){

		dificultad = 4
		if(funcion=="post")
			postPartida(dificultad);
		else
			buscar(dificultad);
		document.getElementById("partidas-container").style.display = "inline-block";
	});
	p4.appendChild(dificil);
	sel.appendChild(p4);

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
    $('#crear-btn').click(function(nombrePartida) { //boton de crear partida
		var p;
		
		do{

			p =prompt("Inserta el nombre de la sala","Nombre");

		}while(p =="Nombre" || p == ''); //se le pide un nombre mientras no introduzca algo

		if(p !== null){ //si el usuario cancela, p es null
			salaP = p;
			selector("post");
		}
		
    });
	$('#actualizar-btn').click(function(){ //boton de actualizar
		
		partidas()
	});

	$('#buscar-btn').click(function(){ //boton de buscar partida
		
        game.scene = "difficultSelector"
        game.changeScene();
		
	});

	$('#ranking').click(function(){ //boton de ranking

		document.getElementById("serpiente").style.display = "none";
		document.getElementById("ranking").style.display = "none";

		$.ajax({ //get de los 10 mejores points
			
			method:"GET",
			url:"http://" + window.location.host + "/muropoints",
	
		}).done(function(data){
			
			console.log(JSON.parse(data));
			//game.context.clearRect(0, 0, 900, 540);
                        document.getElementById("muro").style.display="inline-block";
                        document.getElementById("muro").innerHTML='Ranking';
			var points = JSON.parse(data);
			for(var i = 0; i < points.length; i++){
	
				var array = points[i];
				var div = document.createElement("div");
				div.textContent = array[0] + " : " + array[1]; //pos 0 nombre, pos 1 points
				document.getElementById("muro").appendChild(div);
	
			}

			var sal = document.createElement('button');
			sal.textContent = "Salir";
			sal.id = "salirRanking";
			sal.addEventListener("click",function(){

				document.getElementById("muro").style.display="none";
				document.getElementById("muro").innerHTML='';
				document.getElementById("botonesRanking").removeChild(sal);
				//game.context.clearRect(0,0,900,540);
				document.getElementById("partidas-container").style.display = 'inline-block';
				document.getElementById("serpiente").style.display = "block";
				document.getElementById("ranking").style.display = "inline-block";

			});

			document.getElementById("botonesRanking").appendChild(sal);

		
		});

	});
    
})

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

function borrarDiv(id){ //borramos un div introducido por parametro
    
    $(id).empty();
    
}

function crearDiv(info){ //creamos los divs de las partidas

	var newDiv = document.createElement("div"); 
	var d = info[2]==1?"fácil":info[2]==2?"normal":"dificil";
	newDiv.id = info[0];					//pos 0 nombreSala
	var newContent = document.createTextNode(info[0] + "     " + info[1] + "/4        " + d); //pos 1 numero de jugadores conectados a la sala, pos 2 dificultad
	newDiv.appendChild(newContent); //añade texto al div creado. 
	var boton = document.createElement("button");
	boton.type = "button";
	boton.textContent = "unirse";
	boton.style.alignSelf = "right";
	boton.id = "unirse-btn"
	boton.addEventListener("click", function(){	 //se une a la sala (o lo intenta)
		var part = {
            funcion: "unirGame",
            params:[info[0]]
        }

        game.socket.send(JSON.stringify(part));
	},false);
	salaP = info[0];
	newDiv.appendChild(boton);

	$('#partidas').append(newDiv);

}

var game = new Game();
window.onload = function(){
	
	height  = screen.height - 150;
	var aspect = 5/3;
	width = height * aspect;
	var context = document.getElementById('playground').getContext('2d');
	$('#playground').width(width);
	$('#playground').height(height);

	/*var img = new Image();
	img.src = "../../resources/SPRITES/sprite1/sprite1.1.png";
	img.onload= function(){
		context.drawImage(img, 0,0, 110.4,205.2);
	}*/

	
	
	game.initialize();

}