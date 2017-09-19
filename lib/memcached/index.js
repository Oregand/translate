var memcachedServer = require('../../config/memcached')

module.exports = {

	get: function(key, callback) {
		memcachedServer.get('key', function (err, data) {
      callback(err,data);
    });
	},

  set: function(key, value, callback) {
    memcachedServer.set(key, value, 10000, function (err) {
      callback(err);
    });

  }

}
