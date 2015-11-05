var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/runs', function(req, res){
	var db = req.db;
	var collection = db.get('runcollection');
	collection.find({},{}, function(err, docs){
		res.json(docs);
	});
});
router.get('/runs/:user', function(req, res){
	var db = req.db;
	var collection = db.get('runcollection');
	var userName = req.params.user;
	collection.find({ "username" : userName }, function(err, doc){
		res.json(doc);
	});
});
/* GET Userlist page. */
router.get('/userlist', function(req, res) {
    var db = req.db;
    var collection = db.get('usercollection');
    collection.find({},{},function(e,docs){
        res.render('userlist', {
            "userlist" : docs
        });
    });
});
/* GET New User page. */
router.get('/newuser', function(req, res) {
    res.render('newuser', { title: 'Add New User' });
});
router.post('/finishRun', function(req, res, next){
	var db = req.db;

	var userName = req.body.userName;
	var time = req.body.runtime;
	var coordinates = req.body.coordinates;

	var runCollection = db.get('runcollection');

	runCollection.insert({
		"username" : userName,
		"runtime" : time,
		"coordinates" : coordinates
	}, function (err, doc){
		if(err){
			res.send("Error adding information into the database.");
		} else {
			res.send(doc);
			res.end("wewlad");
			// res.send(doc);
		}
	});
});

module.exports = router;
