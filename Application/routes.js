var fileserver = require('./fileserver');

exports.test = function (req,res){
}

exports.stat = function (req,res){
	fileserver.stat(req.body.path, function(stats){
		if(stats){
			res.send(stats);
		}
		else{
			res.send('');
		}
	});
}

//list directory
exports.ls = function(req,res){
	fileserver.ls(req.body.path, function(err, nodes){
		if(!err){
			res.send(nodes);
		}
	});
}

exports.pwd = function(req,res){
	fileserver.pwd(function(curDir){
		res.send(curDir);
	});
}

//upload files
exports.upload = function(req,res){
}

//upload files (resumable version)
exports.uploadresumable = function(req,res){
}

exports.chdir = function(req, res){
	fileserver.chdir(req.body.path, function(err){
		if(err) res.send({status : "fail"});
		else res.send({status : "success"});
	});
}

exports.memory = function(req,res){
	fileserver.memory(function(mem){
		res.json(mem);
	});
}

//get disk space
exports.diskspace = function(req,res){
	fileserver.diskspace(req.body.path, function(space){
		if(space){
			res.json(space);
		}
		else{
			res.send('');
		}
	});
}

//download a file
exports.download = function (req,res){
}

//delete file or folder
exports.delete = function(req,res){
	fileserver.delete(req.body.path, function(status){
		res.send(status);
	});
}

//create new directory
exports.createDir = function(req,res){
	fileserver.createDir(req.body.path, function(status){
		res.send(status);
	});
}

exports.httpDownload = function(req,res){

}