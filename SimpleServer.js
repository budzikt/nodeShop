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
var methodoverride = require('method-override');
//Importy wlasne
var b_util = require('./utils');

app = express();

//Konfiguracja express
var portNum = 8010;
app.set('port', 8010);
app.set('myDebug', true);
app.set('vhosting', false);

//Oprogramowanie pośredniczące
app.use(compression()); // Kompresja odpowiedzi dla klienta
//app.use(bodyparser.urlencoded({ extended: true })); // Analiza zapytania URL
//app.use(bodyparser.json());  // Analiza JSON zapytania
app.use(cookieParser());  // analiza ciasteczek zapytania
app.use(methodoverride('X-HTTP-Method-Override'));
app.use(morgan('tiny')) // Logger zdarzen
app.use(b_util.reqUserParse); //biblioteki wlasne

//Virtual hosts
// var apiApp = express(); // Osobna aplikacja do obslugi REST api
// var vhApi = vhost('api.budzikt.pl', apiApp);
// app.use(vhApi);

//Rooting
//Main page 
app.get('/', function(req,res){ 
    res.end("Main");
})

app.post('/', function(req,res){ 
    var query = req.query
    res.send(JSON.stringify(query));
})

app.delete('/', function(req,res){
    res.end("Delete")
})


app.get('/items', function(req,res){
    res.end("Przedmioty");
})

//Plug additiona router for API requiests
app.use('/api', require('./routes/api').apiRouter);

app.listen(app.get('port'), function(){
    console.log("Serwer nasluchje na porcie " + app.get('port'));
    console.log("Sciezka projektu to: " + __dirname);
})
