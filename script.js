// Get the canvas element and its 2D context
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

// Set initial canvas dimensions and other game variables
canvas.width = window.innerWidth;
canvas.height = window.innerHeight-110;

var paused = false;
var lostlife = false;
var gameover = false;
var wongame = false;
var pressedStart = false;
var pressedRestart = false;
var muted = false;
var intvl;

var textColor = "blue";

// Ball properties
var ballRadius = 10;
var x = randomBallPosition(ballRadius, canvas.width-ballRadius)
var y = canvas.height-40;

var randomDirection = [2, -2]

var dx = randomBallDirection(randomDirection);
var dy = -2;

var bcolor =  "brown";

// Paddle properties
var paddleHeight = 12;
var paddleWidth = 100;
var paddleX = (canvas.width-paddleWidth) / 2;

var rightPressed = false;
var leftPressed = false

// Bricks properties
var brickRowCount = 8;
var brickColumnCount = 10;
// ... (other brick-related variables)

var totalBricks = brickRowCount * brickColumnCount;
var brickWidth = 75;
var brickHeight = 20;
var brickPadding = 10;
var brickOffsetTop = 50;
var allBricksWidth =  brickColumnCount * brickWidth;
var allBricksPadding = brickColumnCount * brickPadding;
var brickOffsetLeft = canvas.width/2 - allBricksWidth/2 - allBricksPadding/2;

// Create an array to store brick information
var bricks = [];
for(var c=0; c<brickColumnCount; c++) {
    bricks[c] = [];
    for(var r=0; r<brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
}

// Score and lives
var score = 0;
var lives = 3;

// randomize ball position
function randomBallPosition(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

// randomize ball direction
function randomBallDirection(items) {
    return items[Math.floor(Math.random()*items.length)];
}

// draw Start button
function drawStartBtn(){
    ctx.beginPath();
    // inside
    ctx.fillStyle = "white";
    ctx.fillRect(canvas.width/2-(200/2), canvas.height/2, 200, 75);
    //shadow
    ctx.strokeStyle = "rgb(208, 51, 8)";//red
    ctx.strokeRect(canvas.width / 2 - (200 / 2), canvas.height / 2, 200, 75);
    ctx.shadowColor = "rgb(45, 3, 96)";//purple

    // Start
    ctx.fillStyle = "rgb(3, 88, 78)";//green
    ctx.font = "35px 'Times New Roman', Times, serif"; // Change font style and size
    ctx.textAlign = "center";
    ctx.fillText("START", canvas.width / 2, canvas.height / 2 + (75 / 2) + 10);
}

// draw Restart button
function drawRestartBtn(){
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.fillRect(canvas.width/2-(200/2), canvas.height/2, 200, 75);
    //SHADOW
    ctx.strokeStyle = "rgb(208, 51, 8)";//red
    ctx.strokeRect(canvas.width / 2 - (200 / 2), canvas.height / 2, 200, 75);
    ctx.shadowColor = "rgb(45, 3, 96)";//purple
    ctx.strokeStyle = "rgb(208, 51, 8)";
    ctx.strokeRect(canvas.width/2-(200/2), canvas.height/2, 200, 75);
    ctx.fillStyle = "rgb(3, 88, 78)";
    ctx.font = "30px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("RESTART", canvas.width/2, canvas.height/2 + (75/2) + 10);
}

// draw ball
function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI*2);
    ctx.fillStyle = bcolor;
    ctx.fill();
    ctx.closePath();
}

// draw paddle
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height-paddleHeight-10, paddleWidth, paddleHeight);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.closePath();
}

// draw bricks
function drawBricks() {
    for(var c=0; c<brickColumnCount; c++) {
        for(var r=0; r<brickRowCount; r++) {
            if(bricks[c][r].status == 1) {
                var brickX = (c*(brickWidth+brickPadding))+brickOffsetLeft;
                var brickY = (r*(brickHeight+brickPadding))+brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;

                //assigning colors for bricks
                var color = getColorForRow(r);
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = color;
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}
// Function to assign color based on row
function getColorForRow(row) {
    var colors = ["#2ECC71", "#27AE60", "#145A32"]; // Green, Dark Green, Forest Green
    return colors[row % colors.length];
}

// main function to draw everything and run the game
function draw(){
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw game elements
    drawBall();
    drawPaddle();
    drawBricks();
    collisionDetection();
    drawScore();
    drawLives();
    drawShortcuts();

    // Draw Start button and volume icon if the game is not started yet
    if (!pressedStart){
        drawStartBtn();
        drawVolume();
    }

    // bound ball when hit left or right of canvas  
    // Handle ball movement and collisions
    if(x + dx > canvas.width-ballRadius || x + dx < ballRadius) {
        dx = -dx;
        playBoundsHit();
    }
    // bound ball when hit top of canvas
    if(y + dy < ballRadius) {
        dy = -dy;
        playBoundsHit();
    }
    // stop game if ball hits bottom
    else if (y + dy > canvas.height-ballRadius-(paddleHeight/2)-10) {
        // if ball hits paddle
        if (x > paddleX && x < paddleX + paddleWidth){

            playPaddleHit();

            dy = -dy;

            // make the ball faster
            dx += 0.2;
            dy -= 0.2;

        }
        else {
            lives--;
            playLostLife();
            // draw Game Over screen if all lives are lost
            if (!lives){
                playGameOver();
                gameover = true;
                pressedStart = false;
                showGameOver();
            }
            // if lost a life, show Lost Life screen
            else {
                paused = true;
                lostlife = true;
                var num = 3;
                intvl = setInterval(function int(){
                    counter(num--);
                    return int
                }(),1000);
                x = randomBallPosition(ballRadius, canvas.width-ballRadius)
                y = canvas.height-30;
                dx = randomBallDirection(randomDirection);
                dy = -2;
                paddleX = (canvas.width-paddleWidth)/2;
            }
            
        }
    }

    x += dx;
    y += dy;

    // move paddle right
    if(rightPressed) {
        paddleX += 7;
        // prevent paddle from going outside canvas
        if (paddleX + paddleWidth > canvas.width){
            paddleX = canvas.width - paddleWidth;
        }
    }
    // move paddle left
    else if(leftPressed) {
        paddleX -= 7;
        // prevent paddle from going outside canvas
        if (paddleX < 0){
            paddleX = 0;
        }
    }

    if (gameover){
        return;
    }

    if (wongame){
        return;
    }

    // Continue the animation loop
    if(!paused) {
        if (pressedStart){
            requestAnimationFrame(draw);
        }
    }
    else {
         // Draw pause screen if the game is paused
        if (!lostlife){
            if (pressedStart){
                drawVolume();
                drawPause();
            }
        }
    }
    
}

// countdown when lose life
function counter(num) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    showLostLive();
    ctx.font="50px Comic Sans MS";
    ctx.fillStyle = "purple";
    ctx.textAlign = "center";
    ctx.fillText("Continuing in: "+num, canvas.width/2, canvas.height/2+80);
    if(num == 0){
        clearInterval(intvl);
        paused = false;
        lostlife = false;
        draw();
    }
}

// show Lost Life text
function showLostLive(){
    ctx.beginPath();
    ctx.font = "30px Georgia";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText("Uh-oh! Lost a life.", canvas.width/2, canvas.height/2-40);
    ctx.fillText("Lives Remaining: " + lives, canvas.width/2, canvas.height/2);
}

// show Game Over text
function showGameOver(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.font = "35px Georgia";
    ctx.fillStyle = "purple";
    ctx.textAlign = "center";
    ctx.fillText("----GAME ENDED----", canvas.width/2, canvas.height/2-60);
    ctx.fillText("Final Score: " + score, canvas.width/2, canvas.height/2-20);
    drawRestartBtn();
    
}

// show Winning text
function showWinning(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.font = "40px Georgia";
    ctx.fillStyle = "Blue";
    ctx.textAlign = "center";
    ctx.fillText("🎉 CONGRATULATIONS, ALL BRICKS CLEARED 🎉", canvas.width/2, canvas.height/2 - 60);
    ctx.fillText("Total Score: " + score, canvas.width/2, canvas.height/2-20);
    drawRestartBtn();
    playWinGame();
}

// draw Game Paused text on pause
function drawPause(){
    ctx.beginPath();
    ctx.font = "40px sans-serif";
    ctx.fillStyle = "rgb(128, 0, 0)";
    ctx.textAlign = "center";
    ctx.fillText("------GAME PAUSED------", canvas.width/2, canvas.height/2);
}

// function to pause/continue game
function togglePause() {
    paused = !paused;
    lostlife = false;
    clearInterval(intvl);
    draw();
}

// function to handle keyboard specific presses
function keyDownHandler(e) {
    if(e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = true;
    }
    else if(e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = true;
    }

    // pause game when press 'P'
    if (e.keyCode == 80){
        if (pressedStart){
            togglePause();
        } 
    }
 
    // press 1 for slow-motion
    if (e.key == 1){
        if (dx>0){
            dx = 0.2
        }
        else {
            dx = -0.2
        }
        if (dy>0){
            dy = 0.2
        }
        else {
            dy = -0.2
        }
    }
    // press 2 for normal speed
    if (e.key == 2){
        if (dx>0){
            dx = 2
        }
        else {
            dx = -2
        }
        if (dy>0){
            dy = 2
        }
        else {
            dy = -2
        }
    }
    // press 3 for fast speed
    if (e.key == 3){
        if (dx>0){
            dx = 6
        }
        else {
            dx = -6
        }
        if (dy>0){
            dy = 6
        }
        else {
            dy = -6
        }
    }
}

function keyUpHandler(e) {
    if(e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = false;
    }
    else if(e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = false;
    }
}

// function to handle mouse movement on screen
function mouseMoveHandler(e) {
    var relativeX = e.clientX - canvas.offsetLeft;
    if(relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth/2;
    }

    // change cursor on start button
    if (pressedStart && pressedRestart){
        $('html,body').css('cursor', 'default');
        return;
    }
    var rect = myCanvas.getBoundingClientRect();
    var relativeX = e.clientX - rect.left;
    var relativeY = e.clientY - rect.top;
    if(relativeX >= canvas.width/2-(200/2)-5 && relativeX <= canvas.width/2-(200/2)+200-7
    && relativeY >= canvas.height/2 && relativeY <= canvas.height/2+75
    ) {
        $('html,body').css('cursor', 'pointer');
    }
    else {
        $('html,body').css('cursor', 'default');
    }
}

// function to handle mouse clicks on screen
function mouseClickHandler(e) {

    var rect = myCanvas.getBoundingClientRect();

    var relativeX = e.clientX - rect.left;
    var relativeY = e.clientY - rect.top;

    // draw volume/mute icon if game is paused or not started yet
    if (paused || !pressedStart){
        if (relativeX >= canvas.width-40-35 && relativeX <= canvas.width+35 &&
            relativeY >= 5 && relativeY <= 40)  {
                muted = !muted;
                ctx.clearRect(canvas.width-40, 5, 35, 35)
                drawVolume();
            }
    }

    // skip timer when lost life on click and click inside canvas
    if (e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom){
            if (lostlife){
                togglePause();
            }
    }

    // not allow click event when game is running
    if (pressedStart && pressedRestart){
        return;
    }

    // start or restart game when press Start or Restart respectively
    if(relativeX >= canvas.width/2-(200/2)-5 && relativeX <= canvas.width/2-(200/2)+200-7
    && relativeY >= canvas.height/2 && relativeY <= canvas.height/2+75
    ) {

        if (gameover || wongame){
            document.location.reload();
        }
        else {
            $('html,body').css('cursor', 'default');
            pressedStart = true;
            pressedRestart = true;
            draw();
        }
    } 
}

// remove brick on collision with ball, play sound, increase score
// and check if game is won
function brickBroken(b) {
    b.status = 0;
    playBrickSound();
    score += 5;
    if (score == totalBricks * 5)
    {
        wongame = true;
        pressedRestart = false;
        showWinning();
    }
}

// checks for collision between bricks and the ball
function collisionDetection() {
    for(var c=0; c<brickColumnCount; c++) {
        for(var r=0; r<brickRowCount; r++) {
            var b = bricks[c][r];

            //for vertical collision
            if(b.status==1)
            {
                if(x>b.x-ballRadius&&x<b.x+brickWidth+ballRadius)
                {
                    if(dy>0)
                    {
                        if(y>=b.y-ballRadius&&y-dy<b.y-ballRadius)
                        {
                            dy = -dy;
                            brickBroken(b);
                        }
                    }
                    else
                    {
                        if(y<=b.y+brickHeight+ballRadius&&y-dy>b.y+brickHeight+ballRadius)
                        {
                            dy = -dy;
                            brickBroken(b);
                        }
                    }
                }
            }

            //for horizontal collision
            if(b.status==1)
            {
                if(y>b.y-ballRadius&&y<b.y+ballRadius+brickHeight)
                {
                    if(dx>0)
                    {
                        if(x>=b.x-ballRadius&&x-dx<b.x-ballRadius)
                        {
                            dx = -dx;
                            brickBroken(b);
                        }
                    }
                    else
                    {
                        if(x<=b.x+brickWidth+ballRadius&&x-dx>b.x+brickWidth+ballRadius)
                        {
                            dx = -dx;
                            brickBroken(b);
                        }
                    }
                }
            }
        }
    }
}

function playBrickSound() {
    if (!muted){
        var audio = new Audio('sounds/collect.wav');
        audio.play()
    }
}

function playLostLife() {
    if (!muted){
        var audio = new Audio('sounds/lostlife.wav');
        audio.play()
    }
}

function playGameOver() {
    if (!muted){
        var audio = new Audio('sounds/gameover.wav');
        audio.play()
    }
}

function playWinGame() {
    if (!muted){
        var audio = new Audio('sounds/wingame.wav');
        audio.play()
    }
}

function playBoundsHit() {
    if (!muted){
        var audio = new Audio('sounds/hitbounds.wav');
        audio.play()
    }
}

function playPaddleHit() {
    if (!muted){
        var audio = new Audio('sounds/hitpaddle.wav');
        audio.play()
    }
}

function drawScore() {
    ctx.beginPath();
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = textColor;
    ctx.textAlign = "start";
    ctx.fillText("Score: " + score, 8, 30);

}

function drawLives() {
    ctx.beginPath();
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = textColor;
    ctx.textAlign = "start";
    ctx.fillText("Lives: " + lives, 8, 60);
}
function drawShortcuts() {
    // Set the font style for the text
    ctx.font = "16px Arial";

    // Set the fill style for the text (color)
    ctx.fillStyle = textColor;

    // Set the text alignment to "start" (you might want to use "left" instead)
    ctx.textAlign = "start";

    // Calculate the width and height of the box based on the text content
    const boxWidth = ctx.measureText("Press 3 for fast").width + 70;
    const boxHeight = 110;

    // Calculate the coordinates for the box
    const boxX = 20;
    const boxY = 100;

    // Draw the box
    ctx.beginPath();
    ctx.rect(boxX, boxY, boxWidth, boxHeight);
    ctx.fillStyle = "white";
    ctx.fill();

    // Draw the text inside the box
    ctx.fillStyle = textColor;
    ctx.font = 'bold 14px Arial';
    ctx.fillText("Shortcuts:", boxX + 10, boxY + 20);
    ctx.fillText("Press P to pause/play", boxX + 20, boxY + 40);
    ctx.fillText("Press 1 for slow", boxX + 20, boxY + 60);
    ctx.fillText("Press 2 for medium", boxX + 20, boxY + 80);
    ctx.fillText("Press 3 for fast", boxX + 20, boxY + 100);
}



function drawVolume(){
    sfxImg = new Image();
    if (muted){
        sfxImg.src = 'mute.png';
    }
    else {
        sfxImg.src = 'volume.png';
    }
    sfxImg.onload = function(){
        ctx.drawImage(sfxImg, canvas.width-40, 5, 35, 35);
    }
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);
document.addEventListener("click", mouseClickHandler, false);

// pause game on tab change
document.addEventListener("visibilitychange", function() {
    if (document.hidden && pressedStart){
        paused = true;
    }
});

draw();
