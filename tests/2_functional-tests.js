/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');
var MongoClient = require('mongodb').MongoClient;

const ObjectID = require("mongodb").ObjectID;

chai.use(chaiHttp);

suite('Functional Tests', function() {
  
    suite('POST /api/issues/{project} => object with issue data', function() {     
      suiteTeardown(function(done) {
        MongoClient.connect(process.env.DB, function(err, client) {
            client.db("glitch").collection("issue-tracker").deleteMany({created_by: "Functional Test - Posting issues"}, (err, doc) => {client.close();});
          }); 
        done();
      });
      
      test('Every field filled in', function(done) {
       chai.request(server)
        .post('/api/issues/test')
        .send({          
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Posting issues',
         //optional fields
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA' 
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, "Title");
          assert.equal(res.body.issue_text, "text");
          assert.equal(res.body.created_by, "Functional Test - Posting issues");
          assert.equal(res.body.assigned_to, "Chai and Mocha");
          assert.equal(res.body.status_text, "In QA");
          //created_on(date/time), updated_on(date/time), open(boolean, true for open, false for closed), and _id
          assert.property(res.body, 'created_on');
          assert.property(res.body, 'updated_on');
          assert.property(res.body, '_id');
          
          done();
        });
      });
      
      test('Required fields filled in', function(done) {
        chai.request(server)
        .post('/api/issues/test')
        .send({          
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Posting issues'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, "Title");
          assert.equal(res.body.issue_text, "text");
          assert.equal(res.body.created_by, "Functional Test - Posting issues");
          assert.equal(res.body.assigned_to, "");
          assert.equal(res.body.status_text, "");          
          assert.property(res.body, 'created_on');
          assert.property(res.body, 'updated_on');
          assert.property(res.body, '_id');
          
          done();
        });
      });
      
      test('Missing required fields', function(done) {
        chai.request(server)
        .post('/api/issues/test')
        .send({          
          issue_title: "Title",
          assigned_to: 'Chai and Mocha',
          created_by: 'Functional Test - Posting issues'
        })
        .end(function(err, res){
          assert.equal(res.status, 400);
          assert.equal(res.text, "Missing one or more required fields");
          
          done();
        });
      });
      
    });
    
    suite('PUT /api/issues/{project} => text', function() {
      let id = "5ba4d8a6e7179a4d34c5ae34";
      suiteSetup(function(done) {
          MongoClient.connect(process.env.DB, function(err, client) {
            client.db("glitch").collection("issue-tracker").insertOne({
              _id: id,
              "issue_title": "PUT Test",
              "issue_text": "text",
              "created_by": "Functional Test - Modifying issues",
              "assigned_to": "Chai and Mocha",
              "status_text": "In QA"
            }, (err, doc) => {client.close();});
          });
        done();
        });
        
        suiteTeardown(function(done) {
          MongoClient.connect(process.env.DB, function(err, client) {
            client.db("glitch").collection("issue-tracker").deleteOne({
              _id: id
            }, (err, doc) => {client.close();});
          });
          done();
        });
      
      test('No body', function(done) {
        chai.request(server)
        .put('/api/issues/test')
        .send({
          
        })
        .end(function(err, res){
          assert.equal(res.status, 400);
          assert.equal(res.text, "No updated fields sent");
          
          done();
        });
      });
      
      test('One field to update', function(done) {
        let date = new Date();
        chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: id,
          issue_text: "modified " + date
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, "Successfully updated " + id);          
          
          done();
        });
      });
      
      test('Multiple fields to update', function(done) {
        let date = new Date();
        chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: id,
          issue_text: "modified " + date,
          status_text: "in testing"
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, "Successfully updated " + id);
          
          done();
        });
      });
      
    });
    
    suite('GET /api/issues/{project} => Array of objects with issue data', function() {
      let id = "5bace1fdf9a3801e7e65393e";
      suiteSetup(function(done) {
          MongoClient.connect(process.env.DB, function(err, client) {
            client.db("glitch").collection("issue-tracker").insertOne({
              _id: id,
              issue_title: "GET Test",
              issue_text: "text",
              created_by: "Functional Test - Querying issues",
              assigned_to: "Chai and Mocha",
              status_text: "In QA",
              assigned_to: "",
              status_text: "",
              created_on: new Date(),
              updated_on: new Date(),
              open: true
            }, (err, doc) => {client.close();});
          });
        done();
        });
        
        suiteTeardown(function(done) {
          MongoClient.connect(process.env.DB, function(err, client) {
            client.db("glitch").collection("issue-tracker").deleteOne({
              _id: id
            }, (err, doc) => {client.close();});
          });
          done();
        });
      
      test('No filter', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
      });
      
      test('One filter', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({issue_title: "GET Test"})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.lengthOf(res.body, 1);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
      }); 
      
      test('Multiple filters (test for multiple fields you know will be in the db for a return)', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({open: true, issue_title: "GET Test"})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.lengthOf(res.body, 1);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
      });
      
    });
    
    suite('DELETE /api/issues/{project} => text', function() {
      const id = "5ba4dc7ce7179a4d34c5af78"   
      
      suiteSetup(function() {
          MongoClient.connect(process.env.DB, function(err, client) {
            client.db("glitch").collection("issue-tracker").insertOne({
              _id: id,
              "issue_title": "DELETE Test",
              "issue_text": "text",
              "created_by": "Functional Test - Deleting issues",
              "assigned_to": "Chai and Mocha",
              "status_text": "In QA"
            }, (err, doc) => {client.close();});
          });
        });
        
        suiteTeardown(function() {
          MongoClient.connect(process.env.DB, function(err, client) {
            client.db("glitch").collection("issue-tracker").deleteOne({
              _id: id
            }, (err, doc) => {client.close();});
          });
        });
      
      test('No _id', function(done) {
        chai.request(server)
        .delete('/api/issues/test')
        .send({})
        .end(function(err, res){
          assert.equal(res.status, 400);
          assert.equal(res.text, "No id sent");
          done();
        });
      }); 
      
      test('Valid _id', function(done) {                             
        chai.request(server)
        .delete('/api/issues/test')
        .send({_id: id})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, "Deleted " + id);
          done();
        });
      });
      
    });

});
