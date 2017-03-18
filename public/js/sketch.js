var socket;

var receivedClientsPathsData;
var pathsData = {};

var colorButton;

var sliderHue;
var sliderSat;
var sliderBri;

function setup() {
    frameRate(5);
    createCanvas(1024, 500);
    createP('');

    var b = createButton('clear');
    b.mousePressed(() => {
        clearData();
        emitPathsData();

    });
    colorButton = createButton('refreshColor');
    colorButton.mousePressed(() => {
        refreshColor(floor(random(0, 360), 50, 50));
        emitPathsData();
    }
    );

    b = createButton('go fullscreen');
    b.mousePressed(goFullScreen);


    createP('Hue');
    sliderHue = createSlider(0, 359, floor(random(0, 360)));
    sliderHue.input(() => refreshColor());

    createP('Saturation');
    sliderSat = createSlider(0, 100, 50);
    sliderSat.input(() => refreshColor());

    createP('Brightness');
    sliderBri = createSlider(0, 100, 50);
    sliderBri.input(() => refreshColor());

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
    smoothenCurrentPath();
    pathsData.currentPath = [{ x: mouseX, y: mouseY }];
    pathsData.paths.push(pathsData.currentPath);
    emitPathsData();
}

function mouseDragged() {
    if (pathsData.currentPath) {
        let currentPath = pathsData.currentPath;
        currentPath.push({ x: mouseX, y: mouseY });
    }
    else {
        mousePressed();
    }
    emitPathsData();
}

function smoothenCurrentPath() {
    if (pathsData.currentPath) {
        let currentPath = pathsData.currentPath;
        pathsData.currentPath = smoothenPath([].concat(currentPath));
        pathsData.paths.splice(pathsData.paths.length - 1, 1, pathsData.currentPath);
    }
}

function smoothenPath(pathData) {

    if (pathData.length > 2) {

        let result = doDouglasPeucker(pathData, 1);

        // console.log(pathData);
        // console.log(result);
        console.log("PathsLength:" + pathData.length + ", Result: " + result.length);
        // noLoop();

        return result;
    }
    else {
        return pathData;
    }

}

/** Siehe auch: https://de.wikipedia.org/wiki/Douglas-Peucker-Algorithmus */
function doDouglasPeucker(pathData, epsilon) {
    epsilon = epsilon || .5;
    let dmax = 0;
    let index = 0;

    // p1-------pe
    //      |
    //      | -> d !< epsilon
    //      p

    let end = pathData.length - 1;

    let u = {
        x: pathData[end].x - pathData[0].x,
        y: pathData[end].y - pathData[0].y
    };

    let lenU = dist(pathData[0].x, pathData[0].y, pathData[end].x, pathData[end].y);

    u.x /= lenU;
    u.y /= lenU;

    for (let i = 1; i < end; i++) {
        d = abs((pathData[i].x - pathData[0].x) * u.y - (pathData[i].y - pathData[0].y) * u.x);
        if (d > dmax) {
            dmax = d;
            index = i;
        }
    }

    if (dmax > epsilon) {
        // console.log(dmax)
        let firstArray = pathData.slice(0, index);
        let secondArray = pathData.slice(index);

        let consultedFirstArray = doDouglasPeucker(firstArray, epsilon);
        let consultedSecondArray = doDouglasPeucker(secondArray, epsilon);
        return consultedFirstArray.concat(consultedSecondArray.slice(0, consultedSecondArray.length));
    }
    else {
        return [pathData[0], pathData[end]];
    }
}

var timeoutHandle = undefined;

function emitPathsData() {
    if (!timeoutHandle) {
        timeoutHandle = setTimeout(() => {
            smoothenCurrentPath();
            timeoutHandle = undefined;
            socket.emit("client paths data updated", pathsData);
        }, 750);
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
        if (path.length > 1) {
            drawPath(path, clientPathsData.pathColor);
        }
        else if (path.length === 1) {
            push();
            colorMode(HSB);
            let pathColor = clientPathsData.pathColor;
            let col = color(pathColor.h, pathColor.s, pathColor.b);
            fill(col);
            noStroke();
            ellipse(path[0].x, path[0].y, 4, 4)
            pop();
        }
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
