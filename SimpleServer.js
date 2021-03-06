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
app.set('myDebugLog', false);
app.set('myDebugConf', true);
app.set('vhosting', false);

var pathsPack = {
    layoutsDir: fs.existsSync(path.join(__dirname, 'views' ,'layouts')) ? path.join(__dirname, 'views' ,'layouts') : 'views/layouts',
    partialsDir: fs.existsSync(path.join(__dirname, 'views' ,'partials')) ? path.join(__dirname, 'views' ,'partials') : 'views/partials',
    staticDir: fs.existsSync(path.join(__dirname, 'public')) ? path.join(__dirname, 'public') : '/public/'
}
// Template Engine
var hbs = exphbs.create({   defaultLayout: "main",
                            extname: ".handlebars",
                            layoutsDir: "views/layouts/", 
                            partialsDir: "views/partials/",
                            helpers: {
                                itemAvailable: function (item) { if( item.quantity > 1) return true; else{ return false } },
                                firstImage: function(indexVal) {if (indexVal == 0) return true; else{return false} },
                                incIndex: function(indexValue) {return (indexValue+1);},
                                hasComments: function(commArr) {
                                    if(commArr == undefined || commArr.length == 0 ) {
                                        return false
                                    }
                                    else{ return true}
                                },
                                noOfComments: function(commArr){return commArr.length},
                                alternatingWell: function(index) {if ( index+1 % 2 == 0) {return true} else {return false}}   
                            }
                                  
});
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

//Oprogramowanie pośredniczące
app.use(compression()); // Kompresja odpowiedzi dla klienta
app.use(bodyparser.json());  // Analiza JSON zapytania
app.use(cookieParser('secret'));  // analiza ciasteczek zapytania
app.use(methodoverride('X-HTTP-Method-Override')); //nadpisywanie zapytań dla rest-api
app.use(morgan('tiny')); // Logger zdarzen
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: { path: '/', httpOnly: false, secure: false, maxAge: null }
})
); //obługa sesji
app.use(b_util.reqUserParse); //biblioteki wlasne

/* Static assests configuration */
app.use(express.static('./public')) // Obsluga tresci statycznych


if(app.get('myDebugConf') == true){
    app.disable('etag');
    app.use(function(req, res, next) {
    req.headers['if-none-match'] = 'no-match-for-this';
    next();    
});
}

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
    res.render('login', {})
})

app.get('/signin', function(req,res){
    res.render('signin', {});
})

app.post('/signin',  bodyparser.urlencoded({'type' : '*/*', 'extended' : true}), function(req,res){
    app.locals.dataBind = app.locals.dataBind || {}; 
    var MongoClient = MongoDb.MongoClient;
    var url = 'mongodb://localhost:27017/shop';

    if(req.body.password == req.body.passwordRetype){
        MongoClient.connect(url, function(err, db){
            var users = db.collection('ShopUsers');
            users.find({$or:[{name : req.body.userName},{email : req.body.userMail}]}).toArray(function(err, docs){
                if(docs.length != 0){
                    res.end("Ten login lub hasło jest już w użyciu");
                }
                else{
                    console.log("Adding user to DB ")
                    users.insertOne({
                        name : req.body.userName, 
                        email : req.body.userMail,
                        password : req.body.password,
                        role : "buyer"
                    }, function(error, result){
                        db.close();
                        if(!error){
                            console.log("Added user" + result.ops);
                            res.redirect('/login');
                        }
                        else{
                            res.end("DB error");
                        }
                    });
                }
            });
        });
    }
    else{
        app.locals.dataBind.faultArr = app.locals.dataBind.faultArr || [];
        app.locals.dataBind.faultArr.push("Podane hasła się nie zgadzają");
        res.redirect('/signin');
    }
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
                if(docs[0].role.indexOf('admin') != -1){
                     req.session.admin = true;
                }
                console.log("Access granted for user:" + req.body.userName);
                res.redirect('/')
            }
            else{ 
                console.log("wrong password or username");
                res.redirect(401, '/login');
            }
        });
    });    
});

app.get('/logout', function(req,res){
    req.session.destroy(function(error){
        if(error){
            console.log(error);
        }else{
            res.redirect('/');
        }
    })
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

app.get('/shop', function(req,res){
    app.locals.dataBind = app.locals.dataBind || {}; 
    var MongoClient = MongoDb.MongoClient;
    var url = 'mongodb://localhost:27017/shop';
    MongoClient.connect(url, function(err, db){
        var items = db.collection('ShopItems');
        items.find({}).toArray(function(err, docs){
            if(err) {console.log("Error at shop"); res.send(err); return;}

            res.render('shop', {docs})
        });   
    });
})

app.get('/itemdetails/:id', function(req,res){
    app.locals.dataBind = app.locals.dataBind || {}; 
    var MongoClient = MongoDb.MongoClient;
    var url = 'mongodb://localhost:27017/shop';
    MongoClient.connect(url, function(err, db){
        var items = db.collection('ShopItems');
        var id =new MongoDb.ObjectID(req.params.id);
        items.find({_id : id}).toArray(function(err, items){
            if(err) {console.log("Error at shop"); res.send(err); return;}
            res.render('item', {itemObj: items[0]})
        });   
    });
})

app.post('/commentary/:itemId',bodyparser.urlencoded({'type' : '*/*', 'extended' : true}), function(req,res){
    
    console.log(req.params.itemId);
    app.locals.dataBind = app.locals.dataBind || {}; 
    var MongoClient = MongoDb.MongoClient;
    var url = 'mongodb://localhost:27017/shop';

    MongoClient.connect(url, function(err, db){
        var items = db.collection('ShopItems');
        var id = new MongoDb.ObjectID(req.params.itemId);
        var query = {_id : id}; // serch by ID
        var sort = [['_id', 'desc']];
        var insertion = {email: req.body.mail, rating: req.body.rate, text: req.body.commentText}
        var operators = {$push : {commentArray: insertion}}
        var options = {
            new: true
        }
        items.findAndModify(query,sort,operators,options, function(error, result){
            console.log(result.value.commentArray);
            if(error){console.log(error);res.send(err); return;}
            var meanNote =0;
            for(i=0;i<result.value.commentArray.length;i++){
               var rate = result.value.commentArray[i].rating;
               var rateInt = parseInt(rate);
               meanNote = meanNote +  rateInt;
            }
            meanNote = meanNote/result.value.commentArray.length;
            res.type('json');
            res.json({
                comments: result.value.commentArray,
                mean : meanNote
                })
        })
    })
    
});

//Plug additiona router for API requiests - all mounted on /api will be used in router as relative (i.e. / not as /api)
app.use('/api', require('./routes/api').apiRouter);

app.listen(app.get('port'), function(){
    console.log("Serwer nasluchje na porcie " + app.get('port'));
    console.log("Sciezka projektu to: " + __dirname);
})
