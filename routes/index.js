var express = require('express');
var router = express.Router();


const requestTime = function (req, res, next) {
    req.requestTime = Date.now()
    next()
}

router.use(requestTime)

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'chqn.xyz', time: `${req.requestTime}`});
});




module.exports = router;
