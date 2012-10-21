var canvas;
var stage;

//[Graphics]
//Background
var bg;

//Title View
var main;
var startB;
var creditsB;

//Credits
var credits;

//Game View
var player;
var ball;
var cpu;
var win;
var lose;

//Score
var playerScore;
var cpuScore;
var cpuSpeed = 6;

//[Variables]
var xSpeed = 5;
var ySpeed = 5;

var tkr = new Object;

//preloader
var preloader;
var manifest;
var totalLoaded = 0;

var TitleView = new Container();

function Main() {
    /* Link Canvas */
    canvas = document.getElementById('PongStage');
    stage = new Stage(canvas);

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
    Tween.get(credits).to({x:0}, 300);
    credits.onPress = hideCredits;
}

function hideCredits(e) {
    Tween.get(credits).to({x:480}, 300).call(rmvCredits);
}

function rmvCredits() {
    stage.removeChild(credits);
}

function tweenTitleView() {
    Tween.get(TitleView).to({y:-320}, 300).call(addGameView);
}
