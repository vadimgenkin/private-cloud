var sys = require("sys"),
    http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    events = require("events");

var HttpFileDownloader = function(options){
    options = options || {};

    if(!options.callback) throw new Error('provide a callback to constructor');
    if(!options.saveTo) throw new Error('provide saveTo path to constructor');
    if(!options.httpLink) throw new Error('provide httpLink to constructor');   

    var filename;
    var dlprogress = 0;
    var downloadfile;
    var intervalId;

    this.httpDownloadFile = function(httpLink, saveTo, callback){
        if(callback) options.callback = callback;
        if(saveTo) options.saveTo = saveTo;
        if(httpLink) options.httpLink = httpLink;

        initDownload();
    }

    function initDownload(){
        var host = url.parse(options.httpLink).hostname;
        filename = url.parse(options.httpLink).pathname.split("/").pop();

        var theurl = http.createClient(80, host);
        var requestUrl = options.httpLink;
        console.log("Downloading file: " + filename);
        var request = theurl.request('GET', requestUrl, {"host": host});
        request.end();


        request.on('response', openStream);
    }

    function openStream(response){
        downloadfile = fs.createWriteStream(options.saveTo + '/' + filename);//, {'flags': 'a'});
        console.log("File size " + filename + ": " + response.headers['content-length'] + " bytes.");

        //report progress each 1000 ms
        intervalId = setInterval(function(){
            options.callback( null, { status : 'progress', completed : dlprogress});
        }, 1000);

        response.on('data', processChunk);
        response.on('end', endDownload);
    }

    function processChunk(chunk){
        dlprogress += chunk.length;
        downloadfile.write(chunk, encoding='binary');
    }

    function endDownload(){
        downloadfile.end();

        //stop reporting progress
        clearInterval(intervalId);

        options.callback(null, { status : 'done', filename : filename});
    }

}

exports.HttpFileDownloader = HttpFileDownloader;