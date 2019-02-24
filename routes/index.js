var express = require('express');
var router = express.Router();
var fs = require('fs');

/* GET home page. */
router.get('/', function (req, res, next) {
  if (req.session.userID)
    res.redirect('/html/store.html');
  else
    res.redirect('/html/login.html');
});

router.get('/banner', function (req, res, next) {
  res.setHeader('Cache-Control', 'no-store');
  fs.readdir('/webProjects/8060/dbpracticum/public/banners/', function (err, files) {
    if (err) {
      res.end('欢迎欢迎');
    } else {
      var index = Math.floor(Math.random() * files.length);
      res.sendFile('/webProjects/8060/dbpracticum/public/banners/' + files[index]);
    }
  })
});

module.exports = router;