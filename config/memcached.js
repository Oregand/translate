var Memcached = require('memcached');
Memcached.config.maxValue = 5048576;
Memcached.config.poolSize = 25;
Memcached.config.timeout= 1000;
Memcached.config.retries= 2;
Memcached.config.retry= 2000;

var memcachedServer = new Memcached('ec2-34-249-198-83.eu-west-1.compute.amazonaws.com:11211');
console.log(memcachedServer);
module.exports = memcachedServer;
