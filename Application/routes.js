var fileserver = require('./fileserver');

exports.stat = function (req,res){
	fileserver.stat(req.body.path, function(err,stats){
		if(stats){
			res.send(stats);
		}
		else{
			res.send({error : err.message});
		}
	});
}

//list directory
exports.ls = function(req,res){
	fileserver.ls(req.body.path, function(err, nodes){
		if(!err){
			res.send(nodes);
		}
		else{
			res.send({error : err.message});
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
		if(err) res.send({ error : err.message });
		else res.send('');
	});
}

exports.memory = function(req,res){
	fileserver.memory(function(mem){
		res.json(mem);
	});
}

//get disk space
exports.diskspace = function(req,res){
	fileserver.diskspace(req.body.path, function(err, space){
		if(!err){
			res.json(space);
		}
		else{
			res.send({status:'fail', error : err.message});
		}
	});
}

//download a file
exports.download = function (req,res){
}

//delete file or folder
exports.delete = function(req,res){
	fileserver.delete(req.body.path, function(err, status){
		if(!err) res.send(status);
		else res.send({error : err.message});
	});
}

//create new directory
exports.createDir = function(req,res){
	fileserver.createDir(req.body.path, function(err){
		if(err) res.send({ error : err.message });
		else res.send('');
	});
}

exports.httpDownload = function(req,res){
}