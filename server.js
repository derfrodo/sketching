/*
Wir nutzen für diesen Sketch das Express.js Framework für Node
Mehr zum Framework findest Du unter: http://expressjs.com/
*/

var express = require("express");

var app = express();
var http = require("http").createServer(app);

const clientsPathsData = {};

var io = require("socket.io")(http);
io.on("connection", (socket) => {
    socket.on("message", (msg) => {
        console.log(`Client ${socket.id} has send message: ${msg}`);
    });
    socket.on("client paths data updated", pathsData => {
        clientsPathsData[socket.id] = pathsData;

        socket.broadcast.emit("paths data updated", clientsPathsData);
        console.log(pathsData);
    });

    socket.on("disconnect", data => {
        if (clientsPathsData[socket.id]) {
            delete clientsPathsData[socket.id];
            socket.broadcast.emit("paths data updated", clientsPathsData);
        }
    });

    console.log(`Client connected: ${socket.id}`);
    socket.send("connected");
    socket.emit("paths data updated", clientsPathsData);
    
});

app.use(express.static('www'));
app.use("/lib", express.static('node_modules/p5/lib'));
app.use("/lib", express.static('node_modules/p5/lib/addons'));
app.use("/lib", express.static('node_modules/socket.io-client/dist'));

http.listen(3000, "0.0.0.0", () => {
    console.log("Http-Server is listening on port 3000. Visit it at http://localhost:3000 ");
})