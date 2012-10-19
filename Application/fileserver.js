
var fs = require('fs');
var mime = require('mime');
var util = require('util');
var resumable = require('./resumable-upload.js')(__dirname + '/tmp/');
var diskspace = require('diskspace');
var os = require('os');
var path = require('path');
var wrench = require('wrench');

var httpFileDownloader = require('./http-file-downloader');

var sharedPaths = [ 'c:/temp', 'e:/Vadim' ];

var customErrorMessages = {
	pathNotFound : "Path doesn't exist",
	pathNotDefined : "Path was not specified",
	driveNotDefined : "Drive was not specified"
}

var readSharedPathsFromArgs = function(){
	if(process.argv.length > 2) sharedPaths = [];

	for(var i = 2; i < process.argv.length; i++){
		sharedPaths.push(process.argv[i]);
	}	
}();


var getNodeType = function(nodePath, callback){
	fs.stat(nodePath, function(err, stats){
		if(err){
		    console.log(err);
		    return callback(err);			
		} 
		else{
			var nodeType;
			if(stats.isFile()){
				nodeType = mime.lookup(nodePath);
			}
			else if(stats.isDirectory()){
				nodeType = 'dir';
			}
			return callback(null, nodeType);
		}
	});
}

var getArrayOfNodes = function(nodePaths, callback){
	var fileCounter = 0;
	
	var nodes = [];
	var nodeDirs = [];
	var nodeFiles = [];

	nodePaths.forEach(function(nodePath){
		getNodeType(nodePath, function(err,nodeType){
			if(err) console.log(err);
			else{
				var node = { type : nodeType, name : path.basename(nodePath) };
				if(nodeType == 'dir')
					nodeDirs.push(node);
				else 
					nodeFiles.push(node);
			}
			fileCounter++;
			if(fileCounter == nodePaths.length){
				
				//sort dirs and files alphabetically
				sortNodesAlphabetically(nodeDirs);
				sortNodesAlphabetically(nodeFiles);

				//concatenate sorted dirs and files (dirs first)
				nodes = nodeDirs.concat(nodeFiles);

				return callback(null,nodes);				
			}
		});
	});
}

var sortNodesAlphabetically = function(nodes){
	nodes.sort(function(nodeA, nodeB){
		 var nameA = nodeA.name.toLowerCase(), nameB = nodeB.name.toLowerCase()
		 if (nameA < nameB) //sort string ascending
		  return -1;
		 if (nameA > nameB)
		  return 1;
		 return 0; //default return value (no sorting)
	})
}

var addPathToFilenames = function(_path, filenames, callback){
	var filePaths = [];
	filenames.forEach(function(filename){
		filePaths.push(path.join(_path, filename));
	});
	return callback(filePaths);
}

exports.stat = function (p, callback){
	if(fs.existsSync(p)){
		fs.stat(p, function(err, stats){
			if(err){
				console.log(err);
				return callback(err, null);
			}
			else{
				return callback(null, stats);
			}
		});
	}
	else{
		console.log(new Error("Path doesn't exist"));
		return callback(err, null);
	}
}

//list directory
exports.ls = function(p, callback){
	//var p = req.body.path;
	if(!p){
		getArrayOfNodes(sharedPaths, function(nodes){
			return callback(null ,nodes);
		});
	}
	else{
		if(!fs.existsSync(p)){
			var err = new Error("Path not found");
			console.log(err);
			return callback(err, []);
		}
		else{
			fs.readdir(p, function(err,files){
				//empty dir
				if(files.length < 1) return callback(null, []);
				addPathToFilenames(p, files, function(filePaths){
					getArrayOfNodes(filePaths, function(err,nodes){
						if(err) console.log(err);
						return callback(null, nodes);
					});
				});
			});
		}
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
			if(err) console.log(err);
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

exports.pwd = function(callback){
	callback(process.cwd());
}

exports.chdir = function(p, callback){
	if(fs.existsSync(p)){
		try{
			process.chdir(p);
		}
		catch(err){
			console.log(err);
			callback(err);
		}
	}
	else{//directory doesn't exist
		return callback(new Error("Directory doesn't exist"));
	}
	return callback(null);
}

exports.memory = function(callback){
	callback({ total : os.totalmem(), free : os.freemem() });
}

//get disk space
exports.diskspace = function(drive, callback){
	if(drive){
		diskspace.check(drive, function (total, free, status)
		{
		    return callback(null, { total : total, free : free });
		});
	}
	else{
		console.log(new Error("Drive was not specified"));
		return callback(err, null);
	}
}

//download a file
exports.download = function (req,res){
	var p = req.body.path;
	if(p){
		res.sendfile(p);
	}
}

var deleteFile = function(p, callback){
	fs.unlink(p, function(err){
		if(!err){
			console.log('file: ' + p + ' was successfully deleted');
			return callback(null);
		}
		else{
			console.log(err);
			return callback(err);
		}
	});	
}

var deleteDirectory = function(p, callback){
	wrench.rmdirRecursive(p, function(err){
		if(err){
			console.log(err);				
			return callback(err);
		} 
		else{
			return callback(null);
		}
	});
}

//delete file or folder
exports.delete = function(p, callback){
	if(fs.existsSync(p)){
		fs.stat(p, function(err, stats){
			if(err){
				console.log(err);
				return callback(err, null);
			}
			else{
				if(stats.isFile()){
					deleteFile(p, function(err, status){
						return callback(err, status);
					});
				}
				else if(stats.isDirectory()){
					deleteDirectory(p, function(err, status){
						return callback(err, status);
					});
				}
			}
		});
	}
	else{
		return callback(new Error("Path doesn't exist"));
	}
}

//create new directory
exports.createDir = function(p, callback){
	if(p){
		fs.mkdir(p, function(err){
			if(err){//
				console.log(err);	
				return callback({status:"fail"});
			}
			else{
				return callback({status:"success"});
			}
		});
	}
	else{//path is not defined
		console.log(new Error('Path is not defined'));
		return callback({status:"fail"});
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