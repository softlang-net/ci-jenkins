// https://www.tutorialspoint.com/nodejs/nodejs_net_module.htm
// https://node.readthedocs.io/en/latest/api/net/

var net = require('net');
var client = net.connect({port: 8081}, function() {
   console.log('connected to server!');  
});

client.on('data', function(data) {
   console.log(data.toString());
   //client.end();
});

client.on('end', function() { 
   console.log('disconnected from server');
});
