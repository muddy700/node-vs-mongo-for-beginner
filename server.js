var mongo = require("mongodb");
var express = require("express");
var app = express();
var mongoClient = mongo.MongoClient;
var url = "mongodb://localhost:27017/";
var port = 8000;
var connector = require("./connections.js");
connector.connectToDb();

app.use(express.urlencoded({ extended: true }));

//Response To Home Page
app.get("/", function (req, res) {
  console.log("Home Page Called");
  res.send("Hello Buddy\n This Is Home Page.");
});

//Initialize Connection
const createConnection = () => {
  var response = { db: "", dbo: "" };
  mongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var targetDB = db.db("testDB");
    response = { ...response, dbo: targetDB, db: db };
  });

  return response;
};

const handleErrorResponse = (err, errMsg, res) => {
  res.status(400).send({
    statusCode: 400,
    message: errMsg,
    // error: err
  });
};

const handleEmptyResponse = (res) => {
  res.status(200).send({
    statusCode: 200,
    message: "Request Already Finished",
  });
};

const _404_response = (res, id) => {
  res.status(404).send({
    statusCode: 404,
    message: `No Customer Found with Id : ${id}`,
  });
};

const _200_response = (res, message, data = "") => {
  res.status(200).send({
    statusCode: 200,
    message: message,
    data,
  });
};

//Create New Customer
app.post("/create_customer", function (req, res) {
  mongoClient.connect(url, function (err, db) {
    if (err) {
      console.log("Failed To Connect To Database");
      throw err;
    }
    var dbo = db.db("testDB");
    const payload = { ...req.body, _id: parseInt(req.body._id) };
    dbo.collection("customers").insertOne(payload, function (err, result) {
      if (err) handleErrorResponse(err, "Failed to create customer", res);
      else if (result.insertedId)
        _200_response(res, "Customer created Successfully", {
          userId: result.insertedId,
        });
      else handleEmptyResponse(res);
      db.close();
    });
  });
});

//List All Customers
app.get("/customers_list", function (req, res) {
  // var conn = createConnection();
  // console.log("Connection Info: ", conn);
  // res.send("Wait");
  // const {db, dbo} = createConnection()
  // console.log('Connector: ', connector)
  // mongoClient.connect(url, function (err, db) {
  //   if (err) throw err;
  //   var dbo = db.db("testDB");

  var db1 = connector.getDb();
  // console.log(connector, db1);
  db1
    .collection("customers")
    // .find({},{projection: {_id:0}})
    .find({})
    .toArray(function (err, result) {
      if (err) handleErrorResponse(err, "Failed to fetch customers", res);
      else _200_response(res, "Data Fetched Successfully", result);
      // db.close();
    });
  // });
});

//Get Customer By Id
app.get("/customer/:id", function (req, res) {
  mongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("testDB");
    var myQuery = { _id: parseInt(req.params.id) };
    dbo.collection("customers").findOne(myQuery, function (err, result) {
      if (err) handleErrorResponse(err, "Failed to find customer", res);
      else if (!result) _404_response(res, req.params.id);
      else _200_response(res, "Customer Found", result);
      db.close();
    });
  });
});

//Update Customer Info
app.put("/customer/:id/update", function (req, res) {
  mongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("testDB");
    var myQuery = { _id: parseInt(req.params.id) };
    var newData = { $set: req.body };
    dbo
      .collection("customers")
      .updateOne(myQuery, newData, function (err, result) {
        if (err) handleErrorResponse(err, "Failed to update customer", res);
        else if (!result.matchedCount) _404_response(res, req.params.id);
        else _200_response(res, "Customer Records Updated Successfully");
        db.close();
      });
  });
});

//Delete Single Customer By Id
app.delete("/customer/:id/delete", function (req, res) {
  mongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("testDB");
    var myQuery = { _id: parseInt(req.params.id) };
    dbo.collection("customers").deleteOne(myQuery, function (err, result) {
      if (err) handleErrorResponse(err, "Failed to delete customer", res);
      else if (!result.deletedCount) _404_response(res, req.params.id);
      else _200_response(res, "Customer Deleted Successfully");
      db.close();
    });
  });
});

// mongoClient.connect(url, function (err, db) {
//     if (err) throw err;
//     console.log("Database created!");
//     db.close();
// });

//Create Collection
//   dbo.createCollection("customers", function (err, res) {
//     if (err) throw err;
//     console.log("Collection created!");
//     db.close();
//   });

var server = app.listen(port, function () {
  console.log("App Listening on Port #: ", port);
});
