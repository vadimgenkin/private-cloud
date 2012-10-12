$(function(){
	if(window.File && window.FileReader){ //These are the necessary HTML5 objects the we are going to use 
		$('#upload-button').on('click', startUpload);
		$('#filebox').on('change', fileChosen);

		var $dropbox = $('#dropbox');
		$dropbox.bind('dragenter', noopHandler);
		$dropbox.bind('dragexit', noopHandler);
		$dropbox.bind('dragover', noopHandler);
		$dropbox.bind('drop', drop);
	}
	else
	{
		$('#upload-area').html("Your Browser Doesn't Support The File API Please Update Your Browser");
	}
});

function noopHandler(e){
	e.stopPropagation();
	e.preventDefault();
}

function dragEnter(e){
	noopHandler(e);
}

function dragExit(e) {
	noopHandler(e);
}


function dragOver(e) {
	noopHandler(e);
}

function drop(e) {
	noopHandler(e);

	var files = e.originalEvent.dataTransfer.files;
	var count = files.length;

	// Only call the handler if 1 or more files was dropped.
	if (count > 0){
		fileChosen(files[0]);
		// for(var i =0;i<count;i++){
		// 	$('#namebox').val(files[i].name);
		// 	startUpload(files[i]);
		// }
	}
}

var selectedFile;
function fileChosen(file) {
    selectedFile = file;
    //selectedFile = e.target.files[0];
	$('#namebox').val(selectedFile.name);
}

var socket = io.connect('http://localhost:3000');

var fileReader;
var filename;
function startUpload(){
	if(selectedFile)
	{
		fileReader = new FileReader();
		filename = $('#namebox').val();
		var content = "<span id='namearea'>Uploading " + selectedFile.name + " as " + filename + "</span>";
		content += '<div id="progress-container"><div id="progressbar"></div></div><span id="percent">50%</span>';
		content += "<span id='uploaded'> - <span id='mb'>0</span>/" + Math.round(selectedFile.size / 1048576) + "MB</span>";
		
		$('#upload-area').html(content);
		fileReader.onload = function(evnt){
			socket.emit('upload', filename, evnt.target.result );
		}
		socket.emit('start', filename, selectedFile.size);
	}
	else
	{
		alert("Please Select A File");
	}
}

socket.on('moreData', function (place, percent){
	console.log('place: ' + place);
	console.log('percent: ' + percent);
	updateProgressBar(percent);
	var place = place * 524288; //The Next Blocks Starting Position
	var newFile; //The Variable that will hold the new Block of Data
	if(selectedFile.webkitSlice) 
		newFile = selectedFile.webkitSlice(place, place + Math.min(524288, (selectedFile.size-place)));
	else
		newFile = selectedFile.mozSlice(place, place + Math.min(524288, (selectedFile.size-place)));
	fileReader.readAsBinaryString(newFile);
});
function updateProgressBar(percent){
	$('#progressbar').width(percent + '%');
	$('#percent').html((Math.round(percent*100)/100) + '%');
	var mbDone = Math.round(((percent/100.0) * selectedFile.size) / 1048576);
	$('#mb').html(mbDone);
}

var path = "http://localhost/";

socket.on('done', function (data){
	var content = "Video Successfully Uploaded !!"
	if(data){
		content += "<img id='thumb' src='" + path + data['image'] + "' alt='" + filename + "'><br>";
	}
	
	content += "<button	type='button' id='restart' class='btn'>Upload Another</button>";
	$('#upload-area').html(content);
	$('#restart').on('click', refresh);
	$('#uploadbox').width('270px');
	$('#uploadbox').height('270px');
	$('#uploadbox').css('text-align', 'center');
	$('#restart').css('left', 20);
});
function refresh(){
	location.reload(true);
}
