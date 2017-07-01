//Importy node.js
var util = require('util');
var querystring = require('querystring');
var path = require('path');
//Importy npm
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyparser = require('body-parser');
var morgan = require('morgan');
var vhost = require('vhost');
var compression = require('compression');
var methodoverride = require('method-override');
var exphbs  = require('express-handlebars');
//Importy wlasne
var b_util = require('./utils');

app = express();

//Konfiguracja express
var portNum = 8010;
app.set('port', 8010);
app.set('myDebug', true);
app.set('vhosting', false);

// Template Engine
var hbs = exphbs.create({   defaultLayout: "main",
                            extname: ".handlebars",
                            layoutsDir: "views/layouts/",
                            partialsDir: "views/partials/",
                            helpers: {

                            }          
});
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');


//Oprogramowanie pośredniczące
app.use(compression()); // Kompresja odpowiedzi dla klienta
//app.use(bodyparser.urlencoded({ extended: true })); // Analiza zapytania URL
app.use(bodyparser.json());  // Analiza JSON zapytania
app.use(cookieParser());  // analiza ciasteczek zapytania
app.use(methodoverride('X-HTTP-Method-Override'));
app.use(morgan('tiny')) // Logger zdarzen
app.use(express.static('./public')) // Obsluga tresci statycznych
app.use(b_util.reqUserParse); //biblioteki wlasne

//Databasing
var jsonTestData = require('./dbTestData.json');


//Virtual hosts
// var apiApp = express(); // Osobna aplikacja do obslugi REST api
// var vhApi = vhost('api.budzikt.pl', apiApp);
// app.use(vhApi);

//Rooting
//Main page 
app.get('/', function(req,res){ 
    res.render('main');
    //res.set({'Content-Type': 'text/html'})
    // res.end("<h1>Tu będzie sklep</h1>");
})

app.post('/', bodyparser.urlencoded({'type' : '*/*', 'extended' : true}), function(req,res){ 
    var query = req.query;
    var resStr = '';
    for (var prop in req.query) {
        resStr = resStr  + (prop + ' : '+ req.query[prop] + '\n');  
    }
    for (var qit in req.body) {
        if (req.body.hasOwnProperty(qit)) {
        resStr = resStr + (qit + ' : ' + req.body[qit] + '\n');
    }
}
    res.send(resStr);
})

app.get('/idreg/:id(\\d+)', function(req,res){
    res.send('Zapytano o ID z regex: ' + req.params['id']);
})

app.get('/id/:tagId', function(req,res){
    res.send('Zapytano o ID: ' + req.params['tagId']);
})

app.delete('/', function(req,res){
    res.end("Delete")
})


app.get('/items', function(req,res){
    res.end("Przedmioty");
})

//Plug additiona router for API requiests - all mounted on /api will be used in router as relative (i.e. / not as /api)
app.use('/api', require('./routes/api').apiRouter);

app.listen(app.get('port'), function(){
    console.log("Serwer nasluchje na porcie " + app.get('port'));
    console.log("Sciezka projektu to: " + __dirname);
})
