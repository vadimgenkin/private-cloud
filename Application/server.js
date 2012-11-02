var express = require("express");
var util = require("util");
var fileserver = require('./fileserver');
var fs = require('fs');
var routes = require("./routes");

var uploadServer = require("./uploadServer");

var path = require("path");

var app = express();
var logFile = fs.createWriteStream('./myLogFile.log', {flags: 'a'}); //use {flags: 'w'} to open in write mode

app.configure(function(){
	app.use(express.static(__dirname + "/public"));
	app.use(express.bodyParser());
	app.use(express.logger({stream: logFile}));
});

process.chdir('/');

var serverPath = __dirname;
//app.post('/rmdir', fileserver.rmdir);

app.get('/pwd', routes.pwd);

app.post('/chdir', function(req,res){
	if(!req.body.path) return res.send('Path is not defined');

	 app.configure(function(){
	 	app.use(express.static(path.relative(serverPath, req.body.path)));
	 });	

	routes.chdir(req,res);
});

//get memory (RAM)
app.get('/memory', routes.memory);

//get disk space
app.post('/diskspace', routes.diskspace);

//list
app.post('/ls', routes.ls);

//upload files
app.post('/upload', fileserver.upload);

//upload files (resumable version)
app.post('/uploadresumable', fileserver.uploadresumable);

//download a file
app.post('/download', function(){
});

//delete file or folder
app.del('/delete', routes.delete);

app.post('/stat', routes.stat);

//create a directory
app.post('/mkdir', routes.createDir);

//add http link to download
app.post('/httpDownload', fileserver.httpDownload);

app.listen(3001);
console.log('Server listening on port 3001');

uploadServer.start(8888);
console.log('Upload Server listening on port 8888');
