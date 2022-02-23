var mongo = require("mongodb");
var mongoClient = mongo.MongoClient;
var url = "mongodb://localhost:27017/";

let targetDB;

module.exports = {
  connectToDb: function (callback) {
    mongoClient.connect(url, function (err, db) {
      if (err || !db) {
        // throw err;
        return callback(err);
      }

      targetDB = db.db("testDB");
      console.log("App Connected To DB Successfully.");

    //   return callback();
    });
  },

  getDb: function () {
    return targetDB;
  },
};
