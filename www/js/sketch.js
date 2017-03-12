var socket;
function setup() {

    createP("Hallo Viewer!");
    createCanvas(1280, 720);

    socket = io.connect();
    socket.on("new client", (data) => {
        // console.log("new client");
        // console.log(data);
    })

    socket.on("paths updated", (data) => {
        paths = data.paths;
        // console.log(data);
    })
}
var paths;

var path = {
    color: {
        r: Math.floor(Math.random() * 256),
        b: Math.floor(Math.random() * 256),
        g: Math.floor(Math.random() * 256)
    },
    paths: [],
    currentPath: undefined,
};

function mousePressed() {

    if (path.currentPath) {
        path.paths.push(path.currentPath);
    }

    path.currentPath = [];
    path.currentPath.push({
        x: mouseX,
        y: mouseY
    });
    // console.log("send new path")
    emitUpdatedPaths();
}

function mouseDragged() {
    path.currentPath.push({
        x: mouseX,
        y: mouseY
    });
    emitUpdatedPaths();
    // console.log("update path")
}

function emitUpdatedPaths() {
    if (!updateHandle) {
        updateHandle = setTimeout(() => {
            socket.emit("update path", { path });
            updateHandle = undefined;
        }, 500);
    }
}

var updateHandle = undefined;

function draw() {

    background(255);
    noFill();
    stroke(0);
    strokeWeight(1);
    rect(0, 0, width - 1, height - 1);

    if (paths) {
        for (let cpDataId in paths) {
            if (cpDataId !== socket.id) {
                clientPathData = paths[cpDataId];
                for (let p of clientPathData.clientPaths) {
                    drawPath(p, clientPathData.color);
                }

                if (clientPathData.currentClientPath) {
                    drawPath(clientPathData.currentClientPath, clientPathData.color);
                }
            }
        }
    }

    if (path) {
        for (let p of path.paths) {
            drawPath(p, path.color);
        }
        if(path.currentPath){

        drawPath(path.currentPath, { r: 255, g: 0, b: 255 });
        }
    }

}

function drawPath(path, cpColor) {
    push();
    let drawColor = color(cpColor.r, cpColor.g, cpColor.b);

    strokeWeight(4);
    stroke(drawColor);
    beginShape();
    for (let i = 0; i < path.length; i++) {
        vertex(path[i].x, path[i].y)
    }
    endShape();

    pop();
}
