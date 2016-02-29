var fileserver = require('./fileserver');
var fs = require('fs');

var check_path = function (req, res) {
	if(!req.body.path) {
      res.status(400).send('Path is not defined');
      return false;
   } else {
      return true;
   }
}

exports.stat = function (req,res){
	if(!check_path) return;

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
	if(!check_path) return;

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
	if(!check_path) return;

	fileserver.chdir(req.body.path, function(err){
		if(err) res.send({ error : err });
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
	if(!check_path) return;

	fileserver.diskspace(req.body.path, function(err, space){
		if(!err){
			res.json(space);
		}
		else{
			res.send({ error : err});
		}
	});
}

//delete file or folder
exports.delete = function(req,res){
	if(!check_path) return;

	fileserver.delete(req.body.path, function(err, status){
		if(!err) res.send(status);
		else res.send({error : err.message});
	});
}

//create new directory
exports.createDir = function(req,res){
	if(!check_path) return;

	fileserver.createDir(req.body.path, function(err){
		if(err) res.send({ error : err });
		else res.send('');
	});
}

exports.httpDownload = function(req,res){
}
