var express = require("express");
var app = express();
var port = 8000;
var connector = require("./connections.js");
connector.connectToDb();

app.use(express.urlencoded({ extended: true }));

//Response To Home Page
app.get("/", function (req, res) {
  console.log("Home Page Called");
  res.send("Hello Buddy\n This Is Home Page.");
});

const handleErrorResponse = (err, errMsg, res) => {
  res.status(400).send({
    statusCode: 400,
    message: errMsg,
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
  var dbo2 = connector.getDb();
  const payload = { ...req.body, _id: parseInt(req.body._id) };
  dbo2.collection("customers").insertOne(payload, function (err, result) {
    if (err) handleErrorResponse(err, "Failed to create customer", res);
    else if (result.insertedId)
      _200_response(res, "Customer created Successfully", {
        userId: result.insertedId,
      });
    else handleEmptyResponse(res);
  });
});

//List All Customers
app.get("/customers_list", function (req, res) {
  var dbo2 = connector.getDb();
  dbo2
    .collection("customers")
    .find({})
    .toArray(function (err, result) {
      if (err) handleErrorResponse(err, "Failed to fetch customers", res);
      else _200_response(res, "Data Fetched Successfully", result);
    });
});

//Get Customer By Id
app.get("/customer/:id", function (req, res) {
  var dbo2 = connector.getDb();
  var myQuery = { _id: parseInt(req.params.id) };
  dbo2.collection("customers").findOne(myQuery, function (err, result) {
    if (err) handleErrorResponse(err, "Failed to find customer", res);
    else if (!result) _404_response(res, req.params.id);
    else _200_response(res, "Customer Found", result);
  });
});

//Update Customer Info
app.put("/customer/:id/update", function (req, res) {
  var dbo2 = connector.getDb();
  var myQuery = { _id: parseInt(req.params.id) };
  var newData = { $set: req.body };
  dbo2
    .collection("customers")
    .updateOne(myQuery, newData, function (err, result) {
      if (err) handleErrorResponse(err, "Failed to update customer", res);
      else if (!result.matchedCount) _404_response(res, req.params.id);
      else _200_response(res, "Customer Records Updated Successfully");
    });
});

//Delete Single Customer By Id
app.delete("/customer/:id/delete", function (req, res) {
  var dbo2 = connector.getDb();
  var myQuery = { _id: parseInt(req.params.id) };
  dbo2.collection("customers").deleteOne(myQuery, function (err, result) {
    if (err) handleErrorResponse(err, "Failed to delete customer", res);
    else if (!result.deletedCount) _404_response(res, req.params.id);
    else _200_response(res, "Customer Deleted Successfully");
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
