var net = require('net');

var logHost = '127.0.0.1'
  , logPort = 5801
  , sender = require('os').hostname();

var conn = net.createConnection({host: logHost, port: logPort}, () => {
  console.log('connected!')
  var message = {
    '@tags': ['nodejs', 'test']
  , '@message': 'tcp test ' + Math.floor(Math.random() * 10000)
  , '@fields': {'sender': sender}
  }
  console.log(conn.write(JSON.stringify(message)));
  process.exit(0);
})
.on('error', (err) => {
  console.error(err);
  process.exit(1);
});