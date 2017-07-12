//Importy node.js
var util = require('util');
var querystring = require('querystring');
var path = require('path');
var fs = require('fs');
var assert = require('assert');
//Importy npm
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyparser = require('body-parser');
var morgan = require('morgan');
var vhost = require('vhost');
var compression = require('compression');
var methodoverride = require('method-override');
var exphbs  = require('express-handlebars');
var session = require('express-session')
var MongoDb = require('mongodb');
//Importy wlasne
var b_util = require('./utils');

app = express();

//Konfiguracja express
var portNum = 8010;
app.set('port', 8010);
app.set('myDebug', false);
app.set('vhosting', false);

var pathsPack = {
    layoutsDir: fs.existsSync(path.join(__dirname, 'views' ,'layouts')) ? path.join(__dirname, 'views' ,'layouts') : 'views/layouts',
    partialsDir: fs.existsSync(path.join(__dirname, 'views' ,'partials')) ? path.join(__dirname, 'views' ,'partials') : 'views/partials'
}
// Template Engine
var hbs = exphbs.create({   defaultLayout: "main",
                            extname: ".handlebars",
                            layoutsDir: "views/layouts/", /*path.join(__dirname, 'views' ,'layouts'),*/
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
app.use(cookieParser('secret'));  // analiza ciasteczek zapytania
app.use(methodoverride('X-HTTP-Method-Override'));
app.use(morgan('tiny')); // Logger zdarzen
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true})
); //obługa sesji
app.use(b_util.reqUserParse); //biblioteki wlasne

/* Static assests configuration */
app.use(express.static('./public')) // Obsluga tresci statycznych

//Databasing test set
var jsonTestData = require('./dbTestData.json');

/*Rooting*/

//Main page 
app.get('/', function(req,res){ 
    //var app.locals.dataBind = {};
    app.locals.dataBind = app.locals.dataBind || {};
    if(req.session.name){
        app.locals.dataBind['user'] = req.session.name;
        app.locals.dataBind['known'] = true;
    }
    else{
        app.locals.dataBind['user'] = 'niezalogowany użytkowniku';
        app.locals.dataBind['known'] = false;
    }
    res.render('mainPage', {"user" : app.locals.dataBind['user'], "known": app.locals.dataBind['known']});
})

app.get('/login', function(req,res){
    res.render('login')
})

app.get('/signin', function(req,res){
    res.render('signin');
})

app.post('/signin', function(req,res){

})

app.post('/login',  bodyparser.urlencoded({'type' : '*/*', 'extended' : true}), function(req,res){
    app.locals.dataBind = app.locals.dataBind || {}; 
    var MongoClient = MongoDb.MongoClient;
    var url = 'mongodb://localhost:27017/shop';
    MongoClient.connect(url, function(err, db) {
        if(err) {console.log(err); res.send(err); return;}
        var users = db.collection('ShopUsers');
        users.find({name: req.body.userName}).toArray(function(err, docs){
            if(docs && docs.length == 1 && req.body.password == docs[0]['password']){
                app.locals.dataBind['user'] = req.body.userName;
                req.session.name = req.body.userName;
                req.session.logged = true;
                console.log("Access granted for user:" + req.body.userName);
                res.redirect('/')
            }
            else{ 
                console.log("wrong password or username");
                res.redirect(401, '/login');
            }
        });
    });    
})

app.get('/logout', function(req,res){

})

app.post('/userAuth', bodyparser.urlencoded({'type' : '*/*', 'extended' : true}), function(req,res){
    console.log(req.body);
    res.end('UserAuth')
})

app.get('/createAccount', function(req,res){

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
