var express = require('express');
var router = express.Router();



/* POST /users */
router.post('/', function(req, res, next) {
    // Set our internal DB variable
    var db = req.db;

    // Get our form values. These rely on the "name" attributes
    var userName = req.body.username;
    var userScore = req.body.userscore;
    var userEmail = req.body.useremail;
    var userPwd = req.body.password;
    console.log("Keep me... POSTED... hah...");
    // Set our collection
    var collection = db.get('usercollection');

    // Submit to the DB
    collection.insert({
        "username" : userName,
        "score" : userScore,
        "email" : userEmail,
        "password" : userPwd
    }, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // And forward to success page
            res.redirect("userlist");
        }
    });
});

/* GET /users/id */
router.get('/:id', function(req, res, next) {
	var db = req.db;

	db.get('usercollection').find({'_id': req.params.id}, function(err, result) {
	    if (err) {
	        // If it failed, return error
	        res.send("There was an error finding user");
	    }
	    else {
	        res.send(result); // The result should be a JSON object that you can access with result.field (example)
	    }
	});

});
router.get('/', function(req, res){
	var db = req.db;
	var collection = db.get('usercollection');
	collection.find({},{}, function(err, docs){
		res.json(docs);
	});
});

router.get('/login/:username/:pwd', function(req, res){
    var db = req.db;
    var collection = db.get('usercollection');
    var userName = req.params.username;
    var userPwd = req.params.pwd;

    collection.find({username : userName}, function(err, result){
        if(result.password == userPwd){
            res.json({loginsuccess : true});
        } else {
            res.json({loginsuccess : false});
        }
    })
});
module.exports = router;
