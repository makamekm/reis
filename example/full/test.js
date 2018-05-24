// Add this to the VERY top of the first file loaded in your app
var apm = require('elastic-apm-node').start({
    // Set required service name (allowed characters: a-z, A-Z, 0-9, -, _, and space)
    serviceName: 'test',
    secretToken: 'qwerty',
    instrument: true,
    captureBody: 'all',
    errorOnAbortedRequests: true,
    serverUrl: 'http://localhost:8200',
    active: true,
    transactionSampleRate: 0.5
})

var app = require('express')()

app.get('/', function (req, res) {
    res.send('Hello World!')
})

app.listen(3000)