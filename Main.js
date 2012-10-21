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

    /* Set the flash plugin for browsers that don't support SoundJS */
    SoundJS.FlashPlugin.BASE_PATH = "assets/";
    if (!SoundJS.checkPlugin(true)) {
        alert("Error!");
        return;
    }

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
        {src: "assets/playerScore.mp3|assets/playerScore.ogg", id: "playerScore"},
        {src: "assets/enemyScore.mp3|assets/enemyScore.ogg", id: "enemyScore"},
        {src: "assets/hit.mp3|assets/hit.ogg", id: "hit"},
        {src: "assets/wall.mp3|assets/wall.ogg", id: "wall"},
    ];

    preloader = new PreloadJS();
    preloader.installPlugin(SoundJS);
    preloader.onProgress = handleProgress;
    preloader.onComplete = handleComplete;
    preloader.onFileLoad = handleFileLoad;
    preloader.loadManifest(manifest);

    /* Ticker */
    Ticker.setFPS(30);
    Ticker.addListener(stage);

}

function handleProgress(event) {

}

function handleComplete(event) {
    totalLoaded++;
    if (manifest.length == totalLoaded) {
        addTitleView();
    }
}

function handleFileLoad(event) {
    switch(event.type) {
        case PreloadJS.IMAGE:
            var img = new Image();
            img.src = event.src;
            img.onload = handleLoadComplete;
            window[event.id] = new Bitmap(img);
        break;

        case PreloadJS.SOUND:
            handleLoadComplete();
        break;
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
    Tween.get(credits).to({x: 0}, 300);
    credits.onPress = hideCredits;
}

function hideCredits(e) {
    Tween.get(credits).to({x: 480}, 300).call(rmvCredits);
}

function rmvCredits() {
    stage.removeChild(credits);
}

function tweenTitleView() {
    Tween.get(TitleView).to({y: -320}, 300).call(addGameView);
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

    playerScore = new Text('0', 'bold 20px Arial', '#a3ff24');
    playerScore.x = 211;
    playerScore.y = 20;

    cpuScore = new Text('0', 'bold 20px Arial', '#a3ff24');
    cpuScore.x = 262;
    cpuScore.y = 20;

    stage.addChild(playerScore, cpuScore, player, cpu, ball);
    stage.update();

    bg.onPress = startGame;
}

function startGame(e) {
    bg.onPress = null;
    stage.onMouseMove = movePaddle;

    Ticker.addListener(tkr, false);
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
    Ticker.removeListener(tkr);
    bg.onPress = startGame;
}

function alert(e) {
    Ticker.removeListener(tkr);
    stage.onMouseMove = null;
    bg.onPress = null;

    if (e == 'win') {
        win.x = 140;
        win.y = -90;

        stage.addChild(win);
        Tween.get(win).to({y: 115}, 300);
    }
    else {
        lose.x = 140;
        lose.y = -90;

        stage.addChild(lose);
        Tween.get(lose).to({y: 115}, 300);
    }
}

function update() {
    // Ball Movement
    ball.x = ball.x + xSpeed;
    ball.y = ball.y + ySpeed;

    // CPU Movement
    if (cpu.y < ball.y) {
        cpu.y = cpu.y + 4;
    }
    else if (cpu.y > ball.y) {
        cpu.y = cpu.y - 4;
    }

    // Wall Collision
    if (ball.y < 0) { // Up
        ySpeed = -ySpeed;
        SoundJS.play('wall');
    }

    if ((ball.y + 30) > 320) { // Down
        ySpeed = -ySpeed;
        SoundJS.play('wall');
    }

    // CPU Score
    if (ball.x < 0) {
        xSpeed = -xSpeed;
        cpuScore.text = parseInt(cpuScore.text + 1);
        reset();
        SoundJS.play('enemyScore');
    }

    // Player Score
    if ((ball.x + 30) > 480) {
        xSpeed = -xSpeed;
        playerScore.text = parseInt(playerScore.text + 1);
        reset();
        SoundJS.play('playerScore');
    }

    // CPU Collision
    if (ball.x + 30 > cpu.x && ball.x + 30 < cpu.x + 22 && ball.y >= cpu.y && ball.y < cpu.y + 75) {
        xSpeed *= -1;
        SoundJS.play('hit');
    }

    // Player collision
    if (ball.x <= player.x + 22 && ball.x > player.x && ball.y >= player.y && ball.y < player.y + 75) {
        xSpeed *= -1;
        SoundJS.play('hit');
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
