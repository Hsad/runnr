var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser());
app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.post('/routeComplete', function (req, res) {
  console.log(req.body);
  res.send(req.body);
  // res.send('POST request to the homepage');
});


var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
