//Importy
var express = require('express');
var util = require('util');
var querystring = require('querystring');

//Konfiguracja
var portNum = 8010;

//Konstruktor express
var app = express();

//Middlewear

app.get('/', function(req,res){
    res.end("Main");
})

app.get('/items', function(req,res){
    res.end("Przedmioty");
})

app.listen(portNum, function(){
    console.log("Serwer nasluchje na porcie 8010");
    console.log("Sciezka projektu to: " + __dirname);
})
