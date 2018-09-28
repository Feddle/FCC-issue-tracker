/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require("chai").expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB; 


module.exports = function (app) {

  app.route("/api/issues/:project")
  
    .get(function (req, res){
      var project = req.params.project;
      let obj = {};
      MongoClient.connect(CONNECTION_STRING, function(err, client) {                
        for(let prop in req.query) {
          if(prop == "open") obj[prop] = req.query[prop] == "false" ? false : true;
          else obj[prop] = req.query[prop];  
        }
        
        client.db("glitch").collection("issue-tracker").find(obj).toArray((err, result) => {
          if(err) res.send(err);    
          res.send(result);
          client.close();
        });
      });
    })
    
    .post(function (req, res){
      var project = req.params.project;
      MongoClient.connect(CONNECTION_STRING, function(err, client) {
        if(req.body.issue_title && req.body.issue_text && req.body.created_by) {          
          let issue_title = req.body.issue_title;          
          let issue_text = req.body.issue_text;
          let created_by = req.body.created_by;
          let assigned_to = req.body.assigned_to ? req.body.assigned_to : "";
          let status_text = req.body.status_text ? req.body.status_text : "";
          let created_on = new Date();
          let updated_on = new Date();
          let open = true;

          var obj = {issue_title, issue_text, created_by, assigned_to, status_text, created_on, updated_on, open};
        } else {res.status(400); res.send("Missing one or more required fields"); client.close(); return}
        
        client.db("glitch").collection("issue-tracker").insertOne(obj, (err, doc) => {
           if(err) res.send(err);          
           else res.send(doc.ops[0]);
          client.close();
        });
      });
    })
    
    .put(function (req, res){
      var project = req.params.project;
      let id = req.body._id;
      let obj = {};         
      MongoClient.connect(CONNECTION_STRING, function(err, client) {
        if(id && Object.keys(req.body).length > 1) {          
          for(let prop in req.body) {
            if(prop == "_id") continue;
            if(prop == "open") obj[prop] = req.body[prop] == "false" ? false : true;
            else obj[prop] = req.body[prop];
          }
          obj.updated_on = new Date();          
        } else {res.status(400); res.send("No updated fields sent"); client.close(); return}
        
        client.db("glitch").collection("issue-tracker").updateOne({_id: ObjectId(id)}, {$set: {open: false}}, (err, result) => {
           if(err) res.send("Could not update " + id + " " + err);          
           else {res.send("Successfully updated " + id);}          
          client.close();
        });
      });
      
    })
    
    .delete(function (req, res){
      var project = req.params.project;
      if(!req.body._id) {res.status(400); res.send("No id sent"); return}
    
      MongoClient.connect(process.env.DB, function(err, client) {
            client.db("glitch").collection("issue-tracker").deleteOne({_id: ObjectId(req.body._id)}, (err, doc) => {
              if(err) res.send("Could not delete " + req.body._id);
              else res.send("Deleted " + req.body._id);
              client.close();
            });
      });
    });
    
};
