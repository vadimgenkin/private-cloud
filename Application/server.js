var express = require("express");
var util = require("util");
var fileserver = require('./fileserver');
var fs = require('fs');
var routes = require("./routes");
var path = require("path");
var settings = require("./settings.json");

var uploadServer = require("./uploadServer");
var bodyParser = require("body-parser");
var logger = require("morgan")

var app = express();
var logFile = fs.createWriteStream('./myLogFile.log', {flags: 'a'}); //use {flags: 'w'} to open in write mode

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({
   extended: true
}));
app.use(bodyParser.json());
app.use(logger("combined", {
   stream: logFile,
}));

process.chdir('/');

app.get('/pwd', routes.pwd);

app.post('/chdir', function(req,res){
	setStaticServerPath(req.body.path);

	routes.chdir(req,res);
});

var setStaticServerPath = function(p){
	if(!p) return res.send('Path: ' + p + ' is not defined');

	 app.configure(function(){
	 	app.use(express.static(path.relative(__dirname, p)));
	 });		
}

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
app.delete('/delete', routes.delete);

app.post('/stat', routes.stat);

//create a directory
app.post('/mkdir', routes.createDir);

//add http link to download
app.post('/httpDownload', fileserver.httpDownload);

app.listen(settings.listen_port);
console.log('Server listening on port ' + settings.listen_port);

uploadServer.start(8888);
console.log('Upload Server listening on port 8888');
