var MongoDb = require('mongodb');
var apiRouter = require('express').Router();
var mongoose = require('mongoose');


var Schema = mongoose.Schema;
var itemSchema = new Schema({
    "name":              {type: String, required: true},
    "quantity":          {type: Number, required: true},
    "price":             {type: Number, required: true},
    "discount":          {type: Boolean, defaul: false},
    "discription" :      {type: String},
    "fulldiscription":   {type: String},
    "imgRefs" :          {type: Array[String]},
    "dateAdded":         {type: Date, default: Date.now()},
},
{ collection: 'ShopItems' })
var ShopItemModel = mongoose.model('ShopItem', itemSchema);

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
            if(items.length == 1 ){
                res.json(items[0]);
            } else{
                res.json({info: "No Item with ID " + id + " in DB"});
            }
            res.end();
        });
    });
});

apiRouter.post('/items/:id', function(req,res){
    app.locals.dataBind = app.locals.dataBind || {}; 
    var MongoClient = MongoDb.MongoClient;
    var url = 'mongodb://localhost:27017/shop';

    //Create document from req.body
    var body = req.body;
    
    //Remove any id fields in current JSON - sanity...
    var idFields = ["_id", "id", "id_field"];
    for(i=0;i<idFields.length;i++){
        if(idFields[i] in body){
            delete body[idFields[i]]
        }
    }

    body["_id"] = parseInt(req.params.id);

    MongoClient.connect(url, function(err, db){
        var items = db.collection('ShopItems');
        items.find({_id : body["_id"]}).toArray(function(err, docs){          
            if(err) {console.log("Error at shop"); res.send(err); return;}           
            if(docs.length == 0){
                var doc = body;
                items.insertOne(doc, function(err, result){
                    db.close();
                    res.json(result.ops[0])
                    res.end();
                });
            } else if(docs.length > 1 ){
                res.json({error: "Duplicates of ID: " + body["_id"]});
                res.end();
                return;
            } else if(docs.length == 1) {
                res.json({error: "ID: " + body["_id"] + " already existing!"});
                res.end();
                return;               
            }
        });
    });
})

apiRouter.delete('/items/:id', function(req,res){
    app.locals.dataBind = app.locals.dataBind || {}; 
    var MongoClient = MongoDb.MongoClient;
    var url = 'mongodb://localhost:27017/shop';
    var id = parseInt(req.params.id);
    MongoClient.connect(url, function(err, db){
         if(err) {console.log("Error at shop"); res.send(err); return;}
         var items = db.collection('ShopItems');
         items.findOneAndDelete({_id : id}, function(error, result){
            respJson = result.value 
            res.json(respJson);
         });
    });
});

apiRouter.put('/items/:id', function(req,res){
    app.locals.dataBind = app.locals.dataBind || {}; 
    var MongoClient = MongoDb.MongoClient;
    var url = 'mongodb://localhost:27017/shop';
    var reqId = req.params.id;
    //Create document from req.body
    var body = req.body;
    //Remove any id fields in current JSON - sanity...
    if(body.hasOwnProperty('_id')){
        delete body['_id'];
    }
    var id;
    try {
        id = new MongoDb.ObjectID(reqId);
    } catch (err) {
        id = parseInt(reqId);
    }

    MongoClient.connect(url, function(err, db){
        if(err) {console.log("Error at shop"); res.send(err); return;}
        var items = db.collection('ShopItems');
        items.find({_id : id}).toArray(function(err, docs){
            var currDoc = docs[0];
            var keyNames = Object.keys(body);
            for(i=0;i<keyNames.length;i++){
                currDoc[keyNames[i]] = body[keyNames[i]];
            }
            items.findOneAndReplace({_id : id},currDoc,function(error, result){
                res.json(result.value);
            });
        });
    });
});

exports.apiRouter = apiRouter;