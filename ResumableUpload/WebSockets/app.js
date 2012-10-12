var express = require('express');
var app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);
var fs = require('fs');
var util = require('util');

app.use(express.static(__dirname + '/public'));
app.use(express.bodyParser());

var files = {};

io.sockets.on('connection', function (socket) {

  socket.on('upload', function(filename, data){

    files[filename]['downloaded'] += data.length;
    files[filename]['data'] += data;

    //if file is fully uploaded
    if(files[filename]['downloaded'] == files[filename]['filesize']){
      fs.write(files[filename]['handler'], files[filename]['data'], null, 'binary', function(err, written){
        if(err) console.log(err);
        else{
          var inp = fs.createReadStream("temp/" + filename);
          var out = fs.createWriteStream("downloads/" + filename);
          util.pump(inp, out, function(){
             files[filename]['data'] = '';
             fs.close(files[filename]['handler'], function(err){
               if(err) console.log(err);
               fs.unlink("temp/" + filename, function (err) {
                if(err) console.log(err);
                else{
                  socket.emit('done');
                }
               });
             });
          });          
        }
      });
    }
    else if(files[filename]['data'].length > 10485760){//clear the buffer if it reacher X MB
      fs.write(files[filename]['handler'], files[filename]['data'], null, 'binary', function(err, written){
        if(err) console.log(err);
        else{
          files[filename]['data'] = ''; //reset the buffer
          var place = files[filename]['downloaded'] / 524288;
          var percent = (files[filename]['downloaded']/files[filename]['filesize']) * 100;
          socket.emit('moreData', place, percent);
        }
      });
    }
    else{
      var place = files[filename]['downloaded'] / 524288;
      var percent = (files[filename]['downloaded']/files[filename]['filesize'])*100;
      socket.emit('moreData', place, percent);
    }
  });

  socket.on('start', function(filename, size){
    //create new entry in files array
    files[filename] = { filesize : size, data : '', downloaded : 0 };
    var place = 0;
    var percent = 0;

    //create temp folder if it's not already exist
    if(!fs.existsSync('temp')) fs.mkdirSync('temp');

    if(fs.existsSync('temp/' + filename)){
      var stat = fs.statSync('temp/' + filename);
      if(stat.isFile()){
        console.log('resume');
        files[filename]['downloaded'] = stat.size;
        place = stat.size / 524288;
        percent = (files[filename]['downloaded']/files[filename]['filesize'])*100;
      }
    }
    fs.open("temp/" + filename, "a", 0755, function(err,fd){
      if(err) console.log(err);
        else{
          //store file handler to append data to it later          
          files[filename]['handler'] = fd; 
          socket.emit('moreData', place, percent);
        }
    });
    
  });

});

server.listen(3000);
