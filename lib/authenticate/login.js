var express = require('express')
var responses = require('../response')
var security = require('../security')
var dbConfig = require('../../config/mysql')
var log = require('../log')
var error = require('../error')

var app = module.exports = express();

app.post('/api/login', function (req, res) {
    log.out('debug','Logging');
    var authenticate = {}
    authenticate.email = req.body.email;
    authenticate.password = security.hash(req.body.password,req.body.password);
    console.log("hashed passsword " + authenticate.password);
    authenticateUser(authenticate,res)
});


function authenticateUser(authenticate, response) {
  log.out('debug','Authenicating user');
  var pool = dbConfig;
  pool.getConnection(function(err, connection) {
    connection.query("SELECT users.name, users.session_hash, users.email_hash FROM users WHERE email=? and password=? and active=1",[authenticate.email, authenticate.password], function(err, result) {
      if(err) {
         log.out('err',"Error retrieving user "+err);
         console.log(err);
         connection.release();
         error.send('Error retrieving session info','',response);
      } else {
          log.out('info','result.length ' + authenticate.email + ' ' + result.length);
          if(result.length > 0) {
            var user = result;
            connection.release();
            response.jsonp(200, user);
          } else {
            connection.release();
            error.send('Error logging in',['Invalid username or password'],response);
          }
      }
    });
 });
}
