
var fs = require('fs');
var mime = require('mime');
var util = require('util');
var resumable = require('./resumable-upload.js')(__dirname + '/tmp/');
var diskspace = require('diskspace');
var os = require('os');
var path = require('path');

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
		if(err) callback(err);
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
	//return callback(null, '');
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
			return res.send(nodes);
		});
	}
	else{
		if(!fs.existsSync(p)){
			return res.send("Path not found");
		}
		else{
			fs.readdir(p, function(err,files){
				//empty dir
				if(files.length < 1) return res.send('');
				addPathToFilenames(p, files, function(filePaths){
					getArrayOfNodes(filePaths, function(err,nodes){
						if(err) console.log(err);
						return res.send(nodes);
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

exports.chdir = function(req, res){
	var p = req.body.path;
	if(fs.existsSync(p)){
		process.chdir(p);
	}
	res.send('');
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