var express = require('express');
var responses = require('../response')
var validation = require('./validate')
var security = require('../security')
var dbConfig = require('../../config/mysql')
var log = require('../log')
var error = require('../error')

var app = module.exports = express();

app.post('/api/register', function (req, res) {
    var user = {}
    user.email = req.body.email;
    user.password = security.hash(req.body.password);
    user.name = req.body.name;

    validateUser(user,res)
});

function validateUser(user,response) {
    log.out('debug',validation)
    validation.validate(user, response, success, error.send);
}

function success(user, response) {
    createUser(user, response);
}

function createUser(user, response) {
  var pool = dbConfig;
  user.session_hash = security.hashSessionKey(user.email)
  user.email_hash = security.hash(user.email.length,user.email)
  pool.getConnection(function(err, connection) {
    connection.query('INSERT INTO users SET ?',user , function(err, result) {
      if (err) {
        log.out('err',err);
        connection.release()
        res.jsonp(500, err)
      } else {
        log.out('debug',"Create user result "+result)
        response.jsonp(200, user)
      }
    });
 });

}
