

exports.isJsonEmpty = function(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }
    return true;
}

exports.reqUserParse = function(req,res,next){

    if(req.app.get('myDebug')){
        console.log('User parser fetched\n');
        console.log(req.hostname);
        console.log(req.get('Host'));
    }
    
    next();
}