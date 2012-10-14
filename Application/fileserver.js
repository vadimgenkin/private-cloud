
var fs = require('fs');
var mime = require('mime');
var util = require('util');
var resumable = require('./resumable-upload.js')(__dirname + '/tmp/');
var diskspace = require('diskspace');
var os = require('os');

var httpFileDownloader = require('./http-file-downloader');

var sharedPaths = [ 'c:/temp', 'e:/Vadim' ];

var readSharedPathsFromArgs = function(){
	if(process.argv.length > 2) sharedPaths = [];

	for(var i = 2; i < process.argv.length; i++){
		sharedPaths.push(process.argv[i]);
	}	
}();


var getNodeType = function(nodePath, callback){
	fs.stat(nodePath, function(err, stats){
		if(err) return callback(err);
		var nodeType;
		if(stats.isFile()){
			nodeType = mime.lookup(nodePath);
		}
		else if(stats.isDirectory()){
			nodeType = 'dir';
		}
		console.log(nodeType);
		return callback(err, nodeType);
	});
}

var getArrayOfNodes = function(nodePaths, callback){
	var fileCounter = 0;
	var nodes = [];
	nodePaths.forEach(function(nodePath){
		getNodeType(nodePath, function(err,nodeType){
			if(err) return callback(err);

			var node = { type : nodeType, name : nodePath };
			nodes.push(node);

			fileCounter++;
			if(fileCounter == nodePaths.length){
				return callback(nodes);
			}
		});
	});
}

var addPathToFilenames = function(path, filenames, callback){
	var filePaths = [];
	filenames.forEach(function(filename){
		filePaths.push(path + '/' + filename);
	});
	return callback(filePaths);
}

exports.test = function (req,res){

	//res.end();
	res.sendfile('c:/temp/a.mp4');
	//res.attachment('e:/archive.pst');
}

exports.stat = function (req,res){
	fs.stat(req.body.path, function(err, stats){
		res.send(stats);
	});
}

//list directory
exports.ls = function(req,res){
	var p = req.body.path;
	if(!p){
		getArrayOfNodes(sharedPaths, function(nodes){
			res.send(nodes);
		});
	}
	else{
		if(!fs.existsSync(p)){
			return res.send("Path not found");
		}
		fs.readdir(p, function(err,files){
			addPathToFilenames(p, files, function(filePaths){
				getArrayOfNodes(filePaths, function(nodes){
					res.send(nodes);
				});
			});
		});
	}
}



//upload files
exports.upload = function (req,res){
	var destinationFile = req.body.path;
	if(destinationFile){
		var sourceFile = req.files.fileUpload.path;
		var destinationFile = req.body.path;

		var is = fs.createReadStream(sourceFile);
		var os = fs.createWriteStream(destinationFile);

		util.pump(is,os,function(err){
			fs.unlinkSync(req.files.fileUpload.path);
			res.send('');
		});
	}
}

//upload files (resumable version)
exports.uploadresumable = function(req,res){
 	var stream = fs.createWriteStream(__dirname + '/uploads/' + req.body.resumableFilename);

    resumable.post(req, function(status, filename, original_filename, identifier){
      if(status == 'done'){
        resumable.write(identifier, stream);
        stream.on('close', function(){ resumable.clean(identifier); });
      }
      res.send(status, {
          // NOTE: Uncomment this funciton to enable cross-domain request.
          //'Access-Control-Allow-Origin': '*'
      });
    });	
}

exports.memory = function(req,res){
	res.json({ total : os.totalmem(), free : os.freemem() });
}

//get disk space
exports.diskspace = function(req,res){
	var drive = req.body.drive;

	if(drive){
		diskspace.check(drive, function (total, free, status)
		{
			console.log(status);
		    res.json({ total : total, free : free });
		});
	}
}

//download a file
exports.download = function (req,res){
	var p = req.body.path;
	if(p){
		res.sendfile(p);
	}
}

//delete a file
exports.delete = function(req,res){
	var p = req.body.path;
	if(p){
		//if p is file
		fs.unlink(p, function(err){
			if(!err){
				console.log('file: ' + p + ' was successfully deleted');
			}
			else{
				console.log(err);
			}
		});
		res.send('');
		//if p is directory
		//remove recursively
	}
}

//create new directory
exports.createDir = function(req,res){
	var p = req.body.path;
	if(p){
		fs.mkdir(p, function(err){
			res.send('');
		});
	}
}

exports.httpDownload = function(req,res){
	var httpLink = req.body.httpLink;
	var saveTo = req.body.saveTo;

	if(httpLink && saveTo){
		var _httpFileDownloader = new httpFileDownloader.HttpFileDownloader({
		saveTo : saveTo,
		httpLink : httpLink,
		callback :  function(err, details){
			if(details.status == 'progress'){
				console.log((details.completed/1024/1024).toFixed(2) + ' MiB');
			}
			else if(details.status == 'done'){
				console.log("Finished downloading " + details.filename);
			}
		}
	});
		_httpFileDownloader.httpDownloadFile();
		res.send('');
	}	
}