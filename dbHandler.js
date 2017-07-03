var MongoDb = require('mongodb');
var assert = require('assert');
var jsonTestData = require('./dbTestData.json').items;

// Get client
var MongoClient = MongoDb.MongoClient;
// Connection URL
var url = 'mongodb://localhost:27017/shop';
// Use connect method to connect to the server
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Polaczono z kolekcja Shop");

  insertDocuments(db, function() {
    findDocuments(db, function() {
      db.close();
    });
  });
});

var insertDocuments = function(db, callback) {
  // Get the documents collection
  db.dropCollection('ShopItems', function(){
    console.log('Usunueto cala kolekcje, teraz dodamy swieze dane');
    var collection = db.collection('ShopItems');
    collection.insertMany(jsonTestData, function(err, result) {
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