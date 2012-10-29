
var fs = require('fs');
var mime_magic = require('mime-magic');//require('mime');
var mime = require("mime");

var util = require('util');
var resumable = require('./resumable-upload.js')(__dirname + '/tmp/');
var diskspace = require('diskspace');
var os = require('os');
var path = require('path');
var wrench = require('wrench');

var httpFileDownloader = require('./http-file-downloader');

var errorHandler = require('./errorHandler');

var sharedPaths = [ 'c:/temp', 'e:/Vadim' ];

var readSharedPathsFromArgs = function(){
	if(process.argv.length > 2) sharedPaths = [];

	for(var i = 2; i < process.argv.length; i++){
		sharedPaths.push(process.argv[i]);
	}	
}();

var getMimeByContent = function(arrayOfPaths, callback){
	if(arrayOfPaths.length == 0) return callback([]);

	mime_magic(arrayOfPaths, function (err, types) {
	    if (err) {
	        console.log(err);
	        return callback(types);
	        // ERROR: cannot open `/path/to/foo.pdf' (No such file or directory)
	        // ERROR: cannot open `/path/to/foo.txt' (No such file or directory)
	    } else {
	        return callback(types);
	        // ['application/pdf', 'text/plain']
	    }
	});
}

var getMimeByExtension = function(path){
	return mime.lookup(path);
}

var getNodeType = function(nodePath, callback){
	fs.stat(nodePath, function(err, stats){
		if(err){
		    console.log(err);
		    return callback(err);			
		} 
		else{
			var nodeType;
			if(stats.isFile()){
				if(path.extname(nodePath) == '')
					nodeType = 'file_no_extension';
				else
					nodeType = getMimeByExtension(nodePath);
				
				return callback(null, nodeType);
			}
			else if(stats.isDirectory()){
				nodeType = 'dir';
				return callback(null, nodeType);
			}
			else if(stats.isSymbolicLink()){
				nodeType = 'dir';
			}
			else return callback(null, null);
		}
	});
}

var getArrayOfNodes = function(nodePaths, callback){
	var fileCounter = 0;
	
	var nodes = [];
	var nodeDirs = [];
	var nodeFiles = [];
	var nodeFilesWithoutExtension = [];
	nodePaths.forEach(function(nodePath){
		getNodeType(nodePath, function(err,nodeType){
			if(err) console.log(err);
			else{
				var node = { type : nodeType, name : path.basename(nodePath) };
				if(nodeType == 'dir')
					nodeDirs.push(node);
				else if (nodeType == 'file_no_extension'){
					nodeFilesWithoutExtension.push(nodePath);
				}
				else if (nodeType == null){
					
				}
				else
					nodeFiles.push(node);
			}
			fileCounter++;
			if(fileCounter == nodePaths.length){
				getMimeByContent(nodeFilesWithoutExtension, function(types){
					for(var i = 0 ;i<nodeFilesWithoutExtension.length; i++){
						if(types && types[i]){
							nodeFiles.push({type : types[i], name : nodeFilesWithoutExtension[i]});
						}
						else{
							nodeFiles.push({type:'', name : nodeFilesWithoutExtension[i]});
						}
					}
					//clear array
					nodeFilesWithoutExtension = [];
					//sort dirs and files alphabetically
					sortNodesAlphabetically(nodeDirs);
					sortNodesAlphabetically(nodeFiles);

					//concatenate sorted dirs and files (dirs first)
					nodes = nodeDirs.concat(nodeFiles);

					return callback(null,nodes);				
				});
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
	//return error if path doesn't exist
	var err;
	if(err = errorHandler.pathNotFoundError(p)){
		return callback(err.message);
	}	

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

//list directory
exports.ls = function(p, callback){
	if(!p){
		getArrayOfNodes(sharedPaths, function(nodes){
			return callback(null ,nodes);
		});
	}
	else{
		var err;
		if(err = errorHandler.pathNotFoundError(p)){
			console.log(err);
			return callback(err.message, []);
		}
		fs.readdir(p, function(err,files){
			if(err) return callback(err,[]);
			//empty dir
			if(files.length < 1) return callback(null, []);
			addPathToFilenames(p, files, function(filePaths){
				//if(!filePaths) return callback(null, []);
				getArrayOfNodes(filePaths, function(err,nodes){
					if(err) console.log(err);
					return callback(null, nodes);
				});
			});
		});
	}
}

exports.moveFile = function(sourceFile, destinationFile, callback){
	var is = fs.createReadStream(sourceFile);
	var os = fs.createWriteStream(destinationFile);

	util.pump(is,os,function(err){
		if(err){
			console.log(err);	
			callback(err);		
		} 
		else{
			fs.unlinkSync(sourceFile);
			callback(null);
		}
	});	
}

exports.moveFileSync = function(sourceFile, destinationFile){
    fs.writeFileSync(destinationFile, fs.readFileSync(sourceFile));
    fs.unlinkSync(sourceFile);	
}

//upload files
exports.upload = function (req,res){
	var sourceFile = req.files.fileUpload.path;
	var destinationFile = req.body.path;

	var is = fs.createReadStream(sourceFile);
	var os = fs.createWriteStream(destinationFile);

	util.pump(is,os,function(err){
		if(err) console.log(err);
		fs.unlinkSync(sourceFile);
		res.send('');
	});
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
	//return error if dir doesn't exist
	var err;
	if(err = errorHandler.pathNotFoundError(p)){
		return callback(err.message);
	}

	try{
		process.chdir(p);
	}
	catch(err){
		console.log(err);
		return callback(err.message);
	}
	return callback(null);
}

exports.memory = function(callback){
	callback({ total : os.totalmem(), free : os.freemem() });
}

//get disk space
exports.diskspace = function(drive, callback){
	diskspace.check(drive, function (total, free, status)
	{
	    return callback(null, { total : total, free : free });
	});
}

//download a file
exports.download = function (req,res){
	var p = req.body.path;
	res.attachment(p);
	res.end();
}

var deleteFile = function(p, callback){
	fs.unlink(p, function(err){
		if(!err){
			console.log('file: ' + p + ' was successfully deleted');
			return callback(null);
		}
		else{
			console.log(err);
			return callback(err.message);
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
	//return error if path doesn't exist
	var err;
	if(err = errorHandler.pathNotFoundError(p)){
		return callback(err.message);
	}

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

//create new directory
exports.createDir = function(p, callback){
	fs.mkdir(p, function(err){
		if(err){
			console.log(err);	
		}
		return callback(err);
	});
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