var httpFileDownloader = require('./http-file-downloader');

var linkToDownload1 = "http://nodejs.org/dist/node-v0.2.6.tar.gz";
var linkToDownload2 = "http://media.ch9.ms/ch9/c3e5/e5e02f2e-5962-48db-9ddd-85e27a4fc3e5/IntroducingTSAndersH_Source.wmv";
var linkToDownload3 = "http://media.ch9.ms/ch9/3469/ca7c7a77-6c08-4fc2-b794-08db0eae3469/HejlsbergBakTSJSDart_Source.wmv";



var httpFileDownloader3 = new httpFileDownloader.HttpFileDownloader({
	saveTo : "E:/Vadim/Video Courses/Not Synced/",
	httpLink : linkToDownload3,
	callback :  function(err, details){
		if(details.status == 'progress'){
			console.log((details.completed/1024/1024).toFixed(2) + ' mb');
		}
		else if(details.status == 'done'){
			console.log("Finished downloading " + details.filename);
		}
	}
});
httpFileDownloader3.httpDownloadFile();