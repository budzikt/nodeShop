

var http = require('http');

var server = http.createServer(function(req, res){
});

server.on("listening", function(){
    console.log("server connecd");
})

server.listen(8912);

