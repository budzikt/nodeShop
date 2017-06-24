//Importy node.js
var util = require('util');
var querystring = require('querystring');
//Importy npm
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyparser = require('body-parser');
var morgan = require('morgan');

//Importy wlasne
var b_util = require('./utils');

//Konfiguracja
var portNum = 8010;

//Konstruktor express
var app = express();

app.set('myDebug', true);
//Middlewear
app.use(cookieParser());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(morgan('combined'))

//Rooting
app.get('/', function(req,res){ 
    var query = req.query; 
    console.log(b_util.isJsonEmpty(query));
    res.end("Main");
})

app.get('/items', function(req,res){
    res.end("Przedmioty");
})

//Plug additiona router for API requiests
app.use('/api', require('./routes/api').apiRouter);

app.listen(portNum, function(){
    console.log("Serwer nasluchje na porcie 8010");
    console.log("Sciezka projektu to: " + __dirname);
})
