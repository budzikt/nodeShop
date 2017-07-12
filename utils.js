exports.isJsonEmpty = function(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }
    return true;
}

exports.reqUserParse = function(req,res,next){

    if(req.app.get('myDebugLog')){
        console.log(req.hostname + ' ' + req.get('Host'));
    }
    next();
}

exports.addDateField = function(item){
    
}
