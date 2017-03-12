/*
Wir nutzen für diesen Sketch das Express.js Framework für Node
Mehr zum Framework findest Du unter: http://expressjs.com/
*/

var express = require("express");

var app = express();

app.use(express.static('www'));
app.use("/lib", express.static('node_modules/p5'));
app.use("/lib", express.static('node_modules/p5/addons'));

app.listen(3000, function(){
    console.log("Express app is listening on port 3000. Visit it at http://localhost/3000 ");
});
