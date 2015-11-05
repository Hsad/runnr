Dependencies:

	* node.js
	* expressjs (npm install express)
	* body-parser (npm install body-parser)
	* Any others: npm install (in teh runnrAPI directory)
		- This will install dependencies from the package.json.

STARTING A MONGODB INSTANCE ON YOUR MACHINE:

Note: this can get complicated, and IDK how it works on mac/linux. HERE GOES!!!

1) Install mongoDB. Duh.
2) Go to your MongoDB installation.
3) navigate to a folder that is called bin
	(On my machine, this is C:\Program Files\MongoDB\Server\3.0\bin)
4) type the following

	mongod --dbpath c:\path\to\back_end\runnrAPI\data
	(For example, once again):
	mongod --dbpath B:\Documents\SD&D\back_end\runnrAPI\data

5) In a new terminal, open up the shell by typing:

	mongo

	you should see:

	MongoDB shell version: 2.4.5
	connecting to: test

6) simply type 

		use runnrAPI (The database can really be called whatever you want)

		in the mongoDB shell.

NOW YOU'RE UP AND RUNNING
(someone please kill me I didnt even mean to make that pun)