var log = require('../log')
var dbConfig = require('../../config/mysql')
var responses = require('../response')
var security = require('../security')

module.exports = {

	hash: function(value, salt) {
			console.log(value + " " + salt);
	    var crypto = require('crypto');
	    var hash = crypto.createHash('md5').update(salt+''+value).digest("hex");
	    log.out('debug',"returned-hash " + hash);
	    return hash;
	},

	hashSessionKey: function(emailAddr) {
	    var curTime = new Date().getTime();
	    var random = Math.random();
	    return this.hash(curTime + random + emailAddr,'');
	},

	validateRequest: function(request, response, successCallback) {
		var session_hash = request.cookies.session_hash
		var email = request.cookies.email

		if(session_hash && email) {
			verifyUser(session_hash, email, request, response,successCallback)
		} else {
			log.out('err',"No session information passed in " + request);
			securityFailed(response)
		}
	}
}

function verifyUser(session_hash, email, request, response, successCallback) {

  log.out('debug','Verifying the user');

  var pool = dbConfig;
  pool.getConnection(function(err, connection) {
  	if(!err) {
	    connection.query("SELECT users.id FROM users WHERE email_hash=? and session_hash=?",[email, session_hash], function(err, result) {
	      if(err) {
	         log.out('err',"Error verifying user "+err);
	         connection.release();
	         securityFailed(response);
	      } else {
	          log.out('info','result.length ' + email + ' ' + result.length);
	          if(result.length > 0) {
	            log.out('debug','User ' + result[0])
	            var user = result[0];
	            connection.release();
	            successCallback(request, response, user.id);
	          } else {
	            connection.release();
				securityFailed(response);	          }
	      }
	    });
		}
	});
}

function securityFailed(response) {
    var obj = responses.error("You are not authorized to complete this action");
    response.jsonp(401, obj);
}
