var net = require('net');

var logHost = 'elk'
  , logPort = 5801
  , sender = require('os').hostname();

var conn = net.createConnection({host: logHost, port: logPort}, () => {
  console.log('connected!')
  var message = {
    '@tags': ['nodejs', 'test'],
    'message': {
      'text': 'tcp test ' + Math.floor(Math.random() * 10000),
    },
    'level': 'info',
    '@fields': {'sender': sender},
    '@metadata': {'beat': 'reiso_example_full', 'type': 'reiso_example_full_test'}
  }
  console.log(conn.write(JSON.stringify(message) + "\n"));
  process.exit(0);
})
.on('error', (err) => {
  console.error(err);
  process.exit(1);
});