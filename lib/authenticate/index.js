var express = require('express')
var responses = require('../response')
var dbConfig = require('../../config/mysql')
var log = require('../log')
var error = require('../error')

var app = module.exports = express()

app.post('/api/authenticate', function (req, res) {
    log.out('debug','authenticating ...');
    var authenticate = {}
    authenticate.email = req.body.email;
    authenticate.session_hash = req.body.session_hash;
    authenticateUser(authenticate,res)
});

function authenticateUser(authenticate, response) {
  var pool = dbConfig;
  log.out("debug","Auth " + authenticate.email + " " + authenticate.session_hash);
  pool.getConnection(function(err, connection) {
    connection.query("SELECT name, email_hash, session_hash FROM users WHERE email_hash=? and session_hash=?",[authenticate.email, authenticate.session_hash], function(err, result) {
      if(err) {
         log.out('err',"Error retrieving user "+err);
         if(connection)
           connection.release();
         error.send('Error retrieving session info','',response);
      } else if(result[0]) {
          var user = result;
          connection.release();
          response.jsonp(200, user);
      } else {
          connection.release();
          error.send('User not available ','',response);
      }
    });
 });
}
