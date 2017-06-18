var http = require('http');
var app = require('express');
var portNum = 8080;

http.createServer(function(request, response) {
response.writeHead(200);
request.pipe(response);
}).listen(portNum)
console.log('Server listening on port ' + portNum);