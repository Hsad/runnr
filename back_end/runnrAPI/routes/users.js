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
    console.log("Keep me... POSTED... hah...");
    // Set our collection
    var collection = db.get('usercollection');

    // Submit to the DB
    collection.insert({
        "username" : userName,
        "score" : userScore,
        "email" : userEmail
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


module.exports = router;
