var express = require("express");
var util = require("util");
var fileserver = require('./fileserver');
var fs = require('fs');
var routes = require("./routes");
var lessMiddleware = require('less-middleware');

var app = express();
var logFile = fs.createWriteStream('./myLogFile.log', {flags: 'a'}); //use {flags: 'w'} to open in write mode

app.configure(function(){
	app.use(express.static(__dirname + "/public"));
	app.use(express.bodyParser());
	app.use(express.logger({stream: logFile}));
            app.use(lessMiddleware({src: __dirname + '/public', force: true })); });

process.chdir('/');

//app.post('/rmdir', fileserver.rmdir);

app.get('/pwd', routes.pwd);

app.post('/chdir', routes.chdir);

//get memory (RAM)
app.get('/memory', routes.memory);

//get disk space
app.post('/diskspace', routes.diskspace);

app.get('/test', fileserver.test);

//list
app.post('/ls', routes.ls);

//upload files
app.post('/upload', fileserver.upload);

//upload files (resumable version)
app.post('/uploadresumable', fileserver.uploadresumable);

//download a file
app.post('/download', fileserver.download);

//delete file or folder
app.del('/delete', routes.delete);

app.post('/stat', routes.stat);

//create a directory
app.post('/mkdir', routes.createDir);

//add http link to download
app.post('/httpDownload', fileserver.httpDownload);

app.listen(3001);
console.log('Listening on port 3001');