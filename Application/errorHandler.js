var path = require('path');
var fs = require('fs');

var customErrMsg = {
	pathNotFound : "Path not found",
	pathNotDefined : "Path was not specified",
	driveNotDefined : "Drive was not specified",
	invalidPath : "Invalid Path",
	directoryAlreadyExist : "Directory already exist"
}


exports.pathNotFoundError = function(p){
	if(!fs.existsSync(p)){
		error = new Error(customErrMsg.pathNotFound + ': ' + p);
		console.log(error);
		return error;
	}
	else{
		return null;
	}
}


