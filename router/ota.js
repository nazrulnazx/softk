var express = require('express');
var path = require('path');
var fs = require("fs");
var router = express.Router();
var md5 = require("md5-file");

router.get('/update/:version', function (req, res, next) {

  if (req.params.version != "v2") {
    return res.status(200).json(["failed"]);
  }

  // console.log(req.params.version);
  // console.log(req.headers);
  var filePath = path.join(__dirname, '../esp_ota/softkliqv2.ino.generic.bin');

  console.log("ota started");

  var options = {
    headers: {
      "x-MD5": md5.sync(filePath)
    }
  }
  res.sendFile(filePath, options, function (err) {
    if (err) {
      next(err);
    } else {
      console.log('Sent:', filePath)
    }
  });

});
module.exports = router;
