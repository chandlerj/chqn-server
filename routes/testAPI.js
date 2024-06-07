var express = require("express");
var router = express.Router();


const requestTime = function (req, res, next) {
    req.requestTime = Date.now()
    next()
}

router.use(requestTime)

router.get("/", function(req, res, next) {
    res.send(`api is working properly. Timestamp: ${req.requestTime}`)
});


module.exports = router;
