var express = require("express");
var util = require("util");
var fileserver = require('./fileserver');
var fs = require('fs');

var app = express();
var logFile = fs.createWriteStream('./myLogFile.log', {flags: 'a'}); //use {flags: 'w'} to open in write mode

app.configure(function(){
	app.use(express.static(__dirname + "/public"));
	app.use(express.bodyParser());
	app.use(express.logger({stream: logFile}));
});

process.chdir('/');

app.post('/chdir', fileserver.chdir);

//get memory (RAM)
app.get('/memory', fileserver.memory);

//get disk space
app.post('/diskspace', fileserver.diskspace);

app.get('/test', fileserver.test);

//list
app.post('/ls', fileserver.ls);

//upload files
app.post('/upload', fileserver.upload);

//upload files (resumable version)
app.post('/uploadresumable', fileserver.uploadresumable);

//download a file
app.post('/download', fileserver.download);

//delete a file
app.del('/delete', fileserver.delete);

app.post('/stat', fileserver.stat);

//create a directory
app.post('/mkdir', fileserver.createDir);

//add http link to download
app.post('/httpDownload', fileserver.httpDownload);

app.listen(3001);
console.log('Listening on port 3001');