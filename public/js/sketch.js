var socket;

var receivedClientsPathsData;
var pathsData = {};

var colorButton;

var sliderHue;
var sliderSat;
var sliderBri;

function setup() {
    frameRate(5);
    var b = createButton('clear');
    b.mousePressed(() => {
        clearData();
        emitPathsData();

    });
    colorButton = createButton('refreshColor');
    colorButton.mousePressed(() => {
        refreshColor(floor(random(0, 360),50,50));
        emitPathsData();
    }
    );
    createP('');
    createCanvas(1024, 500);
    createP('');
     
    b = createButton('go fullscreen');
    b.mousePressed(goFullScreen);

    createP('Hue');
    sliderHue = createSlider(0, 359, floor(random(0, 360)));
    sliderHue.input(()=>refreshColor());

    createP('Saturation');
    sliderSat = createSlider(0, 100, 50);
    sliderSat.input(()=>refreshColor());

    createP('Brightness');
    sliderBri = createSlider(0, 100, 50);
    sliderBri.input(()=>refreshColor());

    socket = io.connect();


    refreshColor();
    clearData();

    socket.on("message", (data) => {
        console.log(`Server meldet: ${data}`);
    });

    socket.on("paths data updated", clientsPathsData => {
        // console.log(clientsPathsData);
        receivedClientsPathsData = clientsPathsData;
    })

    socket.on("connected", () => {
        console.log("Server meldet: connected");
    });


}


function goFullScreen() {
    let cs = document.getElementsByTagName("CANVAS");
    if (cs && cs.length === 1) {
        const canvas = cs[0];
        if (canvas.requestFullScreen)
            canvas.requestFullScreen();
        else if (canvas.webkitRequestFullScreen)
            canvas.webkitRequestFullScreen();
        else if (canvas.mozRequestFullScreen)
            canvas.mozRequestFullScreen();
    }
}

function clearData() {
    pathsData.currentPath = undefined;
    pathsData.paths = [];
}

function refreshColor(nextHue, nextSat, nextBri) {
    pathsData.pathColor = {
        h: nextHue || sliderHue.value(),
        s: nextSat || sliderSat.value(),
        b: nextBri || sliderBri.value(),
    };
}

function mousePressed() {
    pathsData.currentPath = [{ x: mouseX, y: mouseY }];
    pathsData.paths.push(pathsData.currentPath);
}

function mouseDragged() {
    if (pathsData.currentPath) {
        pathsData.currentPath.push({ x: mouseX, y: mouseY });
    }
    else {
        mousePressed();
    }
    emitPathsData();
}

var timeoutHandle = undefined;

function emitPathsData() {
    if (!timeoutHandle) {
        timeoutHandle = setTimeout(() => {
            timeoutHandle = undefined;
            socket.emit("client paths data updated", pathsData);
        }, 500);
    }
}


function draw() {
    pathColor = pathsData.pathColor;
    colorMode(HSB);
    let col = color(pathColor.h, pathColor.s, pathColor.b);
    colorButton.style("background-color", col);

    background(255);
    noFill();
    strokeWeight(1);
    stroke(0);
    rect(0, 0, width - 1, height - 1);

    for (let clientId in receivedClientsPathsData) {
        if (clientId !== socket.id) {
            var clientPaths = receivedClientsPathsData[clientId];
            drawClientPaths(clientPaths);
        }
    }
    drawClientPaths(pathsData);
}

function drawClientPaths(clientPathsData) {
    for (let path of clientPathsData.paths) {
        drawPath(path, clientPathsData.pathColor);
    }
}


function drawPath(path, pathColor) {
    push();
    noFill();

    colorMode(HSB);
    let col = color(pathColor.h, pathColor.s, pathColor.b);

    strokeWeight(4);
    stroke(col);

    beginShape();
    for (let point of path) {
        vertex(point.x, point.y);
    }
    endShape();
    pop();
}
