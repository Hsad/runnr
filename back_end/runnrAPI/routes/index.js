var express = require('express');
var router = express.Router();

/*
	ROUTER CODE (PAUL STEINER)
*/


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
	var distance = req.body.distance;
	var runCollection = db.get('runcollection');
	var userCollection = db.get('usercollection');
	runCollection.insert({
		"username" : userName,
		"runtime" : time,
		"coordinates" : coordinates,
		"distance" : distance
	}, function (err, doc){
		if(err){
			res.send("Error adding information into the database.");
		} else {
			var newscore = 0;
			var coordlist = [];
			for(var i = 0; i < coordinates.length; i+=2){
				coordlist.push([coordinates[i], coordinates[i+1]]);

			}

			userCollection.find({username : userName}, function(err, result){
				newscore = result.score;
			});
			newscore += CalculateTerritoryFromRun(coordlist);
			userCollection.update({username : userName }, {$set : {score : newscore}}, function(err, doc){
				if(err){
					console.log("Woah there! error!");
				} else {
					console.log("Updated succesfully");
				}
			});
			res.send(doc);
			res.end("wewlad");

			// res.send(doc);
		}
	});
});
//Add a user to a team. Both parameters should be put in the post request.
router.post('/addtoteam', function(req, res, next){
    var db = req.db;
    var users = db.get('usercollection');

    var userName = req.body.username;
    var userTeam = req.body.team;

    users.update({username : userName}, {$set : {team : userTeam}}, function(err, doc){
        if(err){
            console.log("Team Member not added succesfully");

        } else {
            console.log("Added team member sucessfully");
        }
    });
});
//Returns all 
router.get('/teams/:teamname', function(req, res, next){
	var db = req.db;
	var users = db.get('usercollection');

	var requestedTeam = req.params.teamname;

	users.find({team : requestedTeam}, function(err, docs){
		if(err){
			res.json({status : false});
		} else {
			res.json(docs);
		}
	});
});

/*
	AREA CALCULATION CODE (DASH KIELER)
*/

//is passed an array of [x, y] points
//returns an array of ints, each int is the area of a territory within a loop

function intersecting(index1, index2, GPSdata){ //index1, index2, GPSdata
	var p1 = GPSdata[index1]; //[x,y]
	var p2 = GPSdata[index1 + 1];
	var p3 = GPSdata[index2];
	var p4 = GPSdata[index2 + 1];
	
	return lineIntersect( p1[0], p1[1], p2[0], p2[1],  p3[0], p3[1], p4[0], p4[1] );
}
	
function lineIntersect(x1,y1,x2,y2, x3,y3,x4,y4) {
    var x=((x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
    var y=((x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
    if (isNaN(x)||isNaN(y)) {
        return false;
    } else {
        if (x1>=x2) {
            if (!(x2<=x&&x<=x1)) {return false;}
        } else {
            if (!(x1<=x&&x<=x2)) {return false;}
        }
        if (y1>=y2) {
            if (!(y2<=y&&y<=y1)) {return false;}
        } else {
            if (!(y1<=y&&y<=y2)) {return false;}
        }
        if (x3>=x4) {
            if (!(x4<=x&&x<=x3)) {return false;}
        } else {
            if (!(x3<=x&&x<=x4)) {return false;}
        }
        if (y3>=y4) {
            if (!(y4<=y&&y<=y3)) {return false;}
        } else {
            if (!(y3<=y&&y<=y4)) {return false;}
        }
    }
    return true;
}

function DistanceBetween(gpsPoint1, gpsPoint2){
	var x1 = gpsPoint1[0];
	var y1 = gpsPoint1[1];
	var x2 = gpsPoint2[0];
	var y2 = gpsPoint2[1];
	return Math.sqrt( (x1-x2)*(x1-x2) + (y1-y2)*(y1-y2) );
}


function CalulateAreaOfLoop(loopData){
	if (loopData.length < 3) {
		return 0;
	}
	var area = 0;
	//for each point in the loop data
	for (var point = 0; point + 1 < loopData.length; point++){
		//calculate area per point
		var p1 = loopData[point];
		var p2 = loopData[point + 1];
		area += (p1[0]*p2[1] - p2[0]*p1[1]) / 2;
	}
	//loop around and calulate last to first var
	var p1 = loopData[loopData.length - 1];
	var p2 = loopData[0];
	area += (p1[0]*p2[1] - p2[0]*p1[1]) / 2;
	return area;
}


function GetLoopsAsPointArray(GPSdata){
	//input is a list of [x, y] points
	//[ [x,y], [x,y], [x,y] ]
	//returns list of lists of points
	//[ [[x,y], [x,y]] ,  [[x,y], [x,y]] ]
	var Loops = [];
	var DistanceToCloseLoop = 10;  ///// Set this accurately /////
	////////////////  Find loops from intersections  ////////////////////
	//size of the loop must be > 1
	for (var slowIter = 0; slowIter + 3 < GPSdata.length; slowIter++){
		for (var fastIter = slowIter + 2; fastIter + 1 < GPSdata.length; fastIter++){
			if (intersecting(slowIter, fastIter, GPSdata)){
				//add a loop tuple (startNode, endNode) Don't miss the + 1
				//could be a class too, what ever works
				Loops.push( [slowIter + 1, fastIter] );
			}
		}
	}
	/////////////////////  Find if start and end form a loop  ///////////////////
	//If the start and end are close enough together
	if ( DistanceBetween(GPSdata[0], GPSdata[GPSdata.length - 1]) < DistanceToCloseLoop){
		Loops.push( [0, GPSdata.length - 1] );
	}
	//////////////////  Get individual Verts in each loop  ////////////////
	//list sorted from smallest loop size to largest.  Size being number of gps points
	Loops.sort( function(a, b){ 	return a.length - b.length;    });
	//copy original
	var GPScopy = GPSdata.slice();
	//store each loops own data
	var LoopsGPSdata = [];
	//finding the smallest loop size and copying it from the total.  setting its values as taken
	//next loop size takes its values, avoiding the ones that have been taken
	//only loops are calculated
	for (var loop = 0; loop < Loops.length; loop++){
		var copyArray = [];
		for (var index = Loops[loop][0]; index < Loops[loop][1] + 1; index++){
			//if the value is in that loop range & unclaimed, copy it, set it as claimed by a loop
			if ( GPScopy[index] != undefined ){
				copyArray.push(GPScopy[index]);
				GPScopy[index] = undefined;
			}
		}
		LoopsGPSdata.push(copyArray);
	}
	var copyArray2 = [];
	for (var x = 0; x < GPScopy.length; x++){
		if ( GPScopy[x] != undefined ){
			copyArray2.push(GPScopy[x]);
			//GPScopy[x] = undefined;
		}
	}
	LoopsGPSdata.push(copyArray);

	//returns a list of lists, each item are the points that make up a loop
	//last list are the points from the non looping sections
	return LoopsGPSdata;
}
 
   
//Find Loops from intersections
//Find if start and end form Loop, (Distance Check)
//Get individual verts for each loop
//calculate area of each loop
function CalculateTerritoryFromRun(GPSdata){  //GPSdata is expected to be a list of list size two
	//if (GPSdata != undefined || (GPSdata[0][0] == undefined || GPSdata[0][2] != undefined)){
		//Toss in an asset to stop when the Data is BAD
	//}
	var LoopsGPSdata = GetLoopsAsPointArray(GPSdata);
	///////////////////////  Calculate total area of Loop  ////////////////////
	var LoopsTotalArea = [];
	//loop through each individual loops data, but not the last, it is for strait runs
	for (var L = 0; L < LoopsGPSdata.length - 1; L++){
		var loopData = LoopsGPSdata[L];
		var area = CalulateAreaOfLoop(loopData);
		//add result to array of results
		LoopsTotalArea.push(area);
	}
	
	//Rightnow there is only profit from running loops
	//calculate the score for the strait parts of the run
	var straightRun = LoopsGPSdata[LoopsGPSdata.length];
	var lineScore = 0;
	for (var p = 0; p < straightRun.length - 1; p++){
		lineScore += DistanceBetween(straightRun[p], straightRun[p+1]);
	}
	lineScore = Math.pow((lineScore / 4), 1.75);
	LoopsTotalArea.push(lineScore);

	return LoopsTotalArea // <- has the areas of each closed loop.  
}

module.exports = router;
