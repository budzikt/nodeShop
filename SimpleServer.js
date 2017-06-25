//Importy node.js
var util = require('util');
var querystring = require('querystring');
//Importy npm
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyparser = require('body-parser');
var morgan = require('morgan');
var vhost = require('vhost');
var compression = require('compression');
//Importy wlasne
var b_util = require('./utils');

//Konstruktor express
var app = express();

//Konfiguracja express
var portNum = 8010;
app.set('myDebug', true);

//Oprogramowanie pośredniczące
app.use(compression()); // Kompresja odpowiedzi dla klienta
app.use(cookieParser());  // analiza ciasteczek zapytania
app.use(bodyparser.urlencoded({ extended: true })); // Analiza zapytania URL
app.use(bodyparser.json());  // Analiza JSON zapytania
app.use(morgan('tiny')) // Logger zdarzen

app.use(b_util.reqUserParse); //biblioteki wlasne

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
