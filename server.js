/*
Wir nutzen für diesen Sketch das Express.js Framework für Node
Mehr zum Framework findest Du unter: http://expressjs.com/
*/

var express = require("express");

//Deklariere und Initielisiere express-App
var app = express();
var http = require('http').createServer(app);


// app.get("/", (req, res)=>{
//     res.send("Hallo Viewer aus server.js");
// })

app.use(express.static('www'));
app.use("/lib", express.static('node_modules/p5/lib'));
app.use("/lib", express.static('node_modules/p5/lib/addons'));
app.use("/lib", express.static('node_modules/socket.io-client/dist'));

let paths = {};

var io = require('socket.io')(http);
io.on('connection', function (client) {
    client.on('event', function (data) {
        console.log(data);
    });
    client.on('disconnect', () => {
        console.log("disconnect");

        let clientId = client.id;
        if (paths[clientId]) {
            delete paths[clientId];
            emitPaths(paths);
        }
    });
    client.on("update path", (data) => {
        console.log("update path");
        let clientId = client.id;
        paths[clientId] = paths[clientId] || {};
        paths[clientId].color = data.path.color;
        paths[clientId].clientPaths = data.path.paths;
        paths[clientId].currentClientPath= data.path.currentPath;
        
        paths[clientId].currentClientPath = data.path.currentPath;
        emitPaths(paths, client.broadcast);
        console.log(paths[clientId]);
    });

    console.log("connect");
    console.log(client.id);
    //io.sockets.emit('new client', client.id);
    client.broadcast.emit('new client', client.id);
    
    emitPaths(paths, client);

});

function emitPaths(paths, emitter) {
    console.log("Emit paths:");
    console.log(paths);
    emitter = emitter || io;
    emitter.emit("paths updated",
        { paths });
}

http.listen(3000, "0.0.0.0", () => {
    console.log("Express app is listening on port 3000. Visit it at http://localhost:3000 ");
});

// app.listen(3000, function(){
//    
// });
