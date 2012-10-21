var canvas;
var stage;

//[Graphics]
// Background
var bg;

// Title View
var main;
var startB;
var creditsB;

// Credits
var credits;

// Game View
var player;
var ball;
var cpu;
var win;
var lose;

// Score
var playerScore;
var cpuScore;
var cpuSpeed = 6;

//[Variables]
var xSpeed = 5;
var ySpeed = 5;

var tkr = new Object;

// preloader
var preloader;
var manifest;
var totalLoaded = 0;

var TitleView = new createjs.Container();

function Main() {
    /* Link Canvas */
    canvas = document.getElementById('PongStage');
    stage = new createjs.Stage(canvas);

    stage.mouseEventsEnabled = true;

    manifest = [
        {src: "assets/bg.png", id: "bg"},
        {src: "assets/main.png", id: "main"},
        {src: "assets/startB.png", id: "startB"},
        {src: "assets/creditsB.png", id: "creditsB"},
        {src: "assets/credits.png", id: "credits"},
        {src: "assets/paddle.png", id: "cpu"},
        {src: "assets/paddle.png", id: "player"},
        {src: "assets/ball.png", id: "ball"},
        {src: "assets/win.png", id: "win"},
        {src: "assets/lose.png", id: "lose"},
        {src: "assets/playerScore.ogg", id: "playerScore"},
        {src: "assets/enemyScore.ogg", id: "enemyScore"},
        {src: "assets/hit.ogg", id: "hit"},
        {src: "assets/wall.ogg", id: "wall"},
    ];

    preloader = new createjs.PreloadJS();
    preloader.installPlugin(createjs.SoundJS);
    preloader.onProgress = handleProgress;
    preloader.onComplete = handleComplete;
    preloader.onFileLoad = handleFileLoad;
    preloader.loadManifest(manifest);

    /* Ticker */
    createjs.Ticker.setFPS(30);
    createjs.Ticker.addListener(stage);
}

function handleProgress(event) {

}

function handleComplete(event) {

}

function handleFileLoad(event) {
    switch(event.type) {
        case createjs.PreloadJS.IMAGE:
            var img = new Image();
            img.src = event.src;
            img.onload = handleLoadComplete;
            window[event.id] = new createjs.Bitmap(img);
        break;

        case createjs.PreloadJS.SOUND:
            handleLoadComplete();
        break;
    }
}

function handleLoadComplete(event) {
    totalLoaded++;
    if (manifest.length == totalLoaded) {
        addTitleView();
    }
}

function addTitleView() {
    startB.x = 240 - 31.5;
    startB.y = 160;
    startB.name = 'startB';

    creditsB.x = 241 - 42;
    creditsB.y = 200;

    TitleView.addChild(main, startB, creditsB);
    stage.addChild(bg, TitleView);
    stage.update();

    startB.onPress = tweenTitleView;
    creditsB.onPress = showCredits;
}

function showCredits() {
    credits.x = 480;

    stage.addChild(credits);
    stage.update();
    createjs.Tween.get(credits).to({x: 0}, 300);
    credits.onPress = hideCredits;
}

function hideCredits(e) {
    createjs.Tween.get(credits).to({x: 480}, 300).call(rmvCredits);
}

function rmvCredits() {
    stage.removeChild(credits);
}

function tweenTitleView() {
    createjs.Tween.get(TitleView).to({y: -320}, 300).call(addGameView);
}

function addGameView() {
    stage.removeChild(TitleView);
    TitleView = null;
    credits = null;

    player.x = 2;
    player.y = 160 - 37.5;
    cpu.x = 480 - 25;
    cpu.y = 160 - 37.5;
    ball.x = 240 - 15;
    ball.y = 160 - 15;

    playerScore = new createjs.Text('0', 'bold 20px Arial', '#a3ff24');
    playerScore.x = 211;
    playerScore.y = 20;

    cpuScore = new createjs.Text('0', 'bold 20px Arial', '#a3ff24');
    cpuScore.x = 262;
    cpuScore.y = 20;

    stage.addChild(playerScore, cpuScore, player, cpu, ball);
    stage.update();

    bg.onPress = startGame;
}

function startGame(e) {
    bg.onPress = null;
    stage.onMouseMove = movePaddle;

    createjs.Ticker.addListener(tkr, false);
    tkr.tick = update;
}

function movePaddle(e) {
    player.y = e.stageY;
}

function reset() {
    ball.x = 240 - 15;
    ball.y = 160 - 15;
    player.y = 160 - 37.5;
    cpu.y = 160 - 37.5;

    stage.onMouseMove = null;
    createjs.Ticker.removeListener(tkr);
    bg.onPress = startGame;
}

function alert(e) {
    createjs.Ticker.removeListener(tkr);
    stage.onMouseMove = null;
    bg.onPress = null;

    if (e == 'win') {
        win.x = 140;
        win.y = -90;

        stage.addChild(win);
        createjs.Tween.get(win).to({y: 115}, 300);
    }
    else {
        lose.x = 140;
        lose.y = -90;

        stage.addChild(lose);
        createjs.Tween.get(lose).to({y: 115}, 300);
    }
}

function update() {
    // Ball Movement
    ball.x = ball.x + xSpeed;
    ball.y = ball.y + ySpeed;

    // CPU Movement
    if ((cpu.y + 32) < (ball.y - 14)) {
        cpu.y = cpu.y + cpuSpeed;
    }
    else if ((cpu.y + 32) > (ball.y + 14)) {
        cpu.y = cpu.y - cpuSpeed;
    }

    // Wall Collision
    if (ball.y < 0) { // Up
        ySpeed = -ySpeed;
        createjs.SoundJS.play('wall');
    }

    if ((ball.y + 30) > 320) { // Down
        ySpeed = -ySpeed;
        createjs.SoundJS.play('wall');
    }

    // CPU Score
    if (ball.x < 0) {
        xSpeed = -xSpeed;
        cpuScore.text = parseInt(cpuScore.text + 1);
        reset();
        createjs.SoundJS.play('enemyScore');
    }

    // Player Score
    if ((ball.x + 30) > 480) {
        xSpeed = -xSpeed;
        playerScore.text = parseInt(playerScore.text + 1);
        reset();
        createjs.SoundJS.play('playerScore');
    }

    // CPU Collision
    if ((ball.x + 30) > cpu.x && (ball.x + 30) < (cpu.x + 22) && ball.y >= cpu.y && ball.y < (cpu.y + 75)) {
        xSpeed *= -1;
        createjs.SoundJS.play('hit');
    }

    // Player collision
    if (ball.x <= (player.x + 22) && ball.x > player.x && ball.y >= player.y && ball.y < (player.y + 75)) {
        xSpeed *= -1;
        createjs.SoundJS.play('hit');
    }

    // Stop paddle from going out of canvas
    if (player.y >= 249) {
        player.y = 249;
    }

    // Check for win
    if (playerScore.text == '10') {
        alert('win');
    }

    // Check for game over
    if (cpuScore.text == '10') {
        alert('lose');
    }
}
