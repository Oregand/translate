var log = require('../log')

module.exports = {
	
	release: function(connection) {  
		log.out('debug', 'Releasing connection '+ connection)
	    if(connection)
	    	connection.release();
	}
}