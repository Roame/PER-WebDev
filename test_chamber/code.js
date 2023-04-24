const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

const ballRadius = 10;
let ballX = canvas.width/2;
let ballY = canvas.height-30;
let ball_dx = 2;
let ball_dy = -2;

let paddleWidth = 75;
let paddleHeight = 10;
let paddleX = canvas.width/2;
let paddleY = canvas.height-paddleHeight/2;
let paddle_dx = 4;

let rightPressed = false;
let leftPressed = false;

let losses = 0;
let maxBounces = 0;
let bounces = 0;

let pState = -1;
let state = 0;
const interval = setInterval(draw, 10);

function keyDownHandler(e){
	if(state == 0){
		if(e.key == "p" ){
			state = 1;
		}
	} else if(state == 1){
		if(e.key=="q"){
			state = 0;
		} else if(e.key === "Right" || e.key === "ArrowRight"){
			rightPressed = true;
		} else if(e.key === "Left" || e.key === "ArrowLeft"){
			leftPressed = true;
		}
	}
}

function keyUpHandler(e){
	if(e.key === "Right" || e.key === "ArrowRight"){
		rightPressed = false;
	} else if(e.key === "Left" || e.key === "ArrowLeft"){
		leftPressed = false;
	}
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function drawBall(){
	ctx.beginPath();
	ctx.arc(ballX,ballY,ballRadius,0,2*Math.PI,false);
	ctx.fillStyle = "#000000";
	ctx.fill();
	ctx.closePath();
}

function drawPaddle(){
	ctx.beginPath();
	ctx.rect(paddleX-paddleWidth/2, paddleY-paddleHeight/2, paddleWidth, paddleHeight);
	ctx.fillStyle = "#0095DD";
	ctx.fill();
	ctx.closePath();
}

function drawText(){
	ctx.textAlign="left";
	ctx.font = "24px serif";
	ctx.fillText("Losses: " + (losses), 10, 24);
	ctx.fillText("Max Bounces: " + maxBounces, 10, 48);
	ctx.font = "16px serif";
	ctx.fillText("Press \"q\" to quit", 10, 68);
}

function reset(){
	ballX = canvas.width/2;
	ballY = canvas.height/2;
	ball_dx = 2;
	ball_dy = -2;
	paddleX = canvas.width/2;
	paddleY = canvas.height-paddleHeight/2;
	bounces = 0;
}

function gameLoop(){
	ctx.clearRect(0,0,canvas.width, canvas.height);
	ctx.beginPath();
	ctx.rect(0,0,canvas.width, canvas.height);
	ctx.fillStyle = "#FFFFFF";
	ctx.fill()
	ctx.closePath();

	ballX += ball_dx;
	ballY += ball_dy;
	let w = canvas.width;
	let h = canvas.height;

	if(ballX <= ballRadius || ballX >= w-ballRadius){
		ball_dx *= -1;
	}

	if(ballY <= ballRadius){
		ball_dy *= -1;
	} else if (ballY+ballRadius >= h-paddleHeight && ballX >= paddleX-paddleWidth/2 && ballX <= paddleX+paddleWidth/2){
		bounces += 1;
		ball_dx *= 1.25;
		ball_dy *= -1.25;
	} else if(ballY >= h-ballRadius){
		losses += 1;
		maxBounces = Math.max(maxBounces, bounces)
		reset();
	}
	drawBall(ballX,ballY);
	drawText();

	if(rightPressed){
		paddleX = Math.min(canvas.width-paddleWidth/2, paddleX+paddle_dx);
	} else if(leftPressed){
		paddleX = Math.max(paddleWidth/2, paddleX-paddle_dx);
	}
	drawPaddle()
}

function drawTitleScreen(){
	ctx.beginPath();
	ctx.rect(0,0,canvas.width, canvas.height);
	ctx.fillStyle = "#FFFFFF";
	ctx.fill()
	ctx.closePath();

	ctx.font = "32px serif";
	ctx.fillStyle = "#000000";
	ctx.textAlign = "center";
	ctx.fillText("Ball Game!", canvas.width/2, canvas.height/2)
	ctx.font = "16px serif";
	ctx.fillText("Press \"p\" to play", canvas.width/2, canvas.height/2+24)
}

function draw(){
	if(state == 0 && pState != 0){
		ctx.clearRect(0,0,canvas.width, canvas.height);
		drawTitleScreen();

	} else if(state == 1){
		gameLoop();
	}
	pState = state
}