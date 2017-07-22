var MongoDb = require('mongodb');
var apiRouter = require('express').Router();

apiRouter.get('/items/:id', function(req,res){
    var reqId = req.params.id;
    app.locals.dataBind = app.locals.dataBind || {}; 
    var MongoClient = MongoDb.MongoClient;
    var url = 'mongodb://localhost:27017/shop';
    
    MongoClient.connect(url, function(err, db){
        var items = db.collection('ShopItems');
        var id;
        try{
        id =new MongoDb.ObjectID(reqId);
        } catch(err){
            id = parseInt(reqId);
        }
        items.find({_id : id}).toArray(function(err, items){
            if(err) {console.log("Error at shop"); res.send(err); return;}
            res.json(items[0]);
        });
    });
});

apiRouter.post('/items/:id', function(req,res){
    app.locals.dataBind = app.locals.dataBind || {}; 
    var MongoClient = MongoDb.MongoClient;
    var url = 'mongodb://localhost:27017/shop';

    body = req.body;
    var id = body.id;//new MongoDb.ObjectID(body.id);
    
    MongoClient.connect(url, function(err, db){
        var items = db.collection('ShopItems');
        items.find({_id : id}).toArray(function(err, docs){
            if(err) {console.log("Error at shop"); res.send(err); return;}
            if(docs.length != 0){
                res.end("Ten obiekt juz istnieje");
            }
            body._id = body.id;
            delete body.id;
            items.insertOne(body, function(err, result){
                db.close();

            });
        });
    });
})

exports.apiRouter = apiRouter;