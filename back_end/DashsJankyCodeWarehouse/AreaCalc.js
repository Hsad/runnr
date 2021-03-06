
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


function CalulateAreaOfLoop(LoopData){
	//for each point in the loop data
	for (var point = 0; point + 0 < loopData.length; points++){
		//calculate area per point
		var p1 = loopData[point];
		var p2 = loopData[point + 1];
		area += (p1[0]*p2[1] - p2[0]*p1[1]) / 2;
	}
	//loop around and calulate last to first var
	var p1 = loopData[loopData.length];
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
	return LoopsGPSdata;
}

//Find Loops from intersections
//Find if start and end form Loop, (Distance Check)
//Get individual verts for each loop
//calculate area of each loop
function CalculateTerritoryFromRun(GPSdata){  //GPSdata is expected to be a list of list size two
	if (GPSdata[0][0] == undefined || GPSdata[0][2] != undefined){
		//Toss in an asset to stop when the Data is BAD
	}
	var LoopsGPSData = GetLoopsAsPointArray(GPSdata){
	///////////////////////  Calculate total area of Loop  ////////////////////
	var LoopsTotalArea = [];
	//loop through each individual loops data
	for (var L = 0; L < LoopsGPSdata.length; L++){
		var loopData = LoopsGPSdata[L];
		var area = CalulateAreaOfLoop(loopData);
		//add result to array of results
		LoopsTotalArea.push(area);
	}
	return LoopsTotalArea // <- has the areas of each closed loop.  
}
