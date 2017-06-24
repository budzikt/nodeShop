var router = require('express').Router;

router.get('*', function(req,res,next) {
    res.write("Captured by all route \n");
    next();
});

exports.router = router;