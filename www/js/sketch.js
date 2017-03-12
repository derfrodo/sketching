var socket;

var receivedClientsPathsData;
var pathsData = {};

var colorButton;

function setup() {
    var b = createButton('clear');
    b.mousePressed(() => {
        clearData();
        emitPathsData();

    });
    colorButton = createButton('refreshColor');
    colorButton.mousePressed(() => {
        refreshColor();
        emitPathsData();
    }
    );
    createP('');

    createCanvas(1280, 720);

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

function clearData() {
    pathsData.currentPath = undefined;
    pathsData.paths = [];
}

function refreshColor() {
    pathsData.pathColor = {
        h: floor(random(0, 360)),
        s: 100,
        b: 50,
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
