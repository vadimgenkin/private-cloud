var express = require('express');
var resumable = require('./resumable-node.js')(__dirname + '/tmp/');
var app = express();
var fs = require('fs');
var util = require('util');
// Host most stuff in the public folder
app.use(express.static(__dirname + '/public'));

app.use(express.bodyParser());

// Handle uploads through Resumable.js
app.post('/upload', function(req, res){
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
});

// Handle cross-domain requests
// NOTE: Uncomment this funciton to enable cross-domain request.
/*
  app.options('/upload', function(req, res){
  console.log('OPTIONS');
  res.send(true, {
  'Access-Control-Allow-Origin': '*'
  }, 200);
  });
*/

/*
// Handle status checks on chunks through Resumable.js
app.get('/upload', function(req, res){
    resumable.get(req, function(status, filename, original_filename, identifier){
        console.log('GET', status);
        res.send(status, (status == 'found' ? 200 : 404));
      });
  });

app.get('/download/:identifier', function(req, res){
	resumable.write(req.params.identifier, res);


  });
*/

app.listen(3000);
