var apiRouter = require('express').Router();

apiRouter.get('/:id', function(req,res){
    var reqId = req.params.id;
    if(req.app.get('myDebug')){
        console.log('GET request with ID ' + reqId);
    }
    console.log('Non debug msg');
});

exports.apiRouter = apiRouter;