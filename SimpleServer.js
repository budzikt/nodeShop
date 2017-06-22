//Importy node.js
var util = require('util');
var querystring = require('querystring');
//Importy npm
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyparser = require('body-parser')
//Importy wlasne
var b_util = require('./utils');
//Konfiguracja
var portNum = 8010;

//Konstruktor express
var app = express();

//Middlewear
app.use(cookieParser());
app.use(bodyparser.urlencoded({ extended: true })); // <- Unikanie "depreciated error"

//Rooting
//All-path pass-through
app.get('*', function(req,res,next) {
    res.write("Captured by all route \n");
    next();
})

app.get('/', function(req,res){ 
    var query = req.query; 
    console.log(b_util.isJsonEmpty(query));
    res.end("Main");
})

app.get('/items', function(req,res){
    res.end("Przedmioty");
})

app.listen(portNum, function(){
    console.log("Serwer nasluchje na porcie 8010");
    console.log("Sciezka projektu to: " + __dirname);
})
