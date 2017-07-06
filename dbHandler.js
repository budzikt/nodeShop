var MongoDb = require('mongodb');
var assert = require('assert');

var jsonTestItems = require('./dbTestData.json');
var jsonTestUsers = require('./dbTestUsers.json')

var MongoClient = MongoDb.MongoClient;
var DbUrl = 'mongodb://localhost:27017/shop';

function RevertDbData(client, url, collection, dataIn={}, callback){
  client.connect(DbUrl, function(err, db) {
    assert.equal(null, err);
    console.log("Polaczono z baza danych " + db.databaseName);
    insertDocuments(db, collection, dataIn, function(result) {
        callback(db, collection, db.close);
    });
  });
};

var insertDocuments = function(db, collection, dataset={}, callback) {
  db.dropCollection(collection, function(){
    console.log('Usunueto cala kolekcje, dodaje dane startowe');
    var collectionItems = db.collection(collection);
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

var findDocuments = function(db, collection) {
  var collection = db.collection(collection);   
  collection.find({}).toArray(function(err, docs) {
    assert.equal(err, null);
    console.log("Znaleziono " + docs.length + " rekordy:");
    console.log(docs)
    db.close();
  });
}

RevertDbData(MongoClient, DbUrl, 'ShopItems', jsonTestItems['items'], findDocuments);
RevertDbData(MongoClient, DbUrl, 'ShopUsers', jsonTestUsers['users'], findDocuments);
