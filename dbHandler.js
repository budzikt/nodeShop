var MongoDb = require('mongodb');
var assert = require('assert');
var jsonTestItems = require('./dbTestData.json');
var jsonTestUsers = require('./dbTestUsers.json')

var MongoClient = MongoDb.MongoClient;
var DbUrl = 'mongodb://localhost:27017/shop';

// Use connect method to connect to the server


function RevertDbData(client, url){
  client.connect(DbUrl, function(err, db) {
    assert.equal(null, err);
    console.log("Polaczono z baza danych");
    insertDocuments(db, 'ShopItems', jsonTestItems['items'], function(result) {
        db.close();
    });
  });
};

var insertDocuments = function(db, collection='ShopItems', dataset={}, callback) {
  
  db.dropCollection('ShopItems', function(){
    console.log('Usunueto cala kolekcje, dodaje dane startowe');
    var collectionItems = db.collection('ShopItems');
    
    //Add date to each JSON item
    for (var i = 0; i< dataset.length; i++){
      dataset[i].dateAdded = new Date(2017,7,1+i,5);
    }
    
    collectionItems.insertMany(dataset, function(err, result) {
      assert.equal(err, null);
      console.log("Dodano swieze dane");
      callback(result);
    });
  });
}

var findDocuments = function(db, callback) {
  // Get the documents collection
  var collection = db.collection('ShopItems');
  // Find some documents
  collection.find({}).toArray(function(err, docs) {
    assert.equal(err, null);
    console.log("Znaleziono " + docs.length + " rekordy:");
    console.log(docs)
    callback(docs);
  });
}

RevertDbData(MongoClient, DbUrl);