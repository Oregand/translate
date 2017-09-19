var responseObj = require('../response')
var log = require('../log')

module.exports = {
	send: function(messageText, errorList, response) {
    	var obj = responseObj.error(messageText,errorList);
    	log.out('err' ,"error being returned ")
    	log.out('err',obj);
    	response.jsonp(500, obj);
	}
}

