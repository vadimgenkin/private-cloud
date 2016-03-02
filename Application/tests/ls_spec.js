var frisby = require('frisby');
var settings = require('../settings.json');

var SANDBOX_PATH = __dirname + "/sandbox";
var WRONG_PATH = "abhjsk/dskjdnsl/dsjdlksdj";
var LS_URL = 'http://127.0.0.1:' + settings.listen_port + '/ls'; 

frisby.create('ls happy path')
   .post(LS_URL, {
      path: SANDBOX_PATH
   })
   .expectStatus(200)
   .expectJSONTypes('*', {
      type: String,
      name: String
   })
   .after(function (error, response, body) {
         console.log('Here is the body of response: ' + body);      
   })
   .toss();

frisby.create('ls should return 400 (Bad Request) if no path provided')
   .post(LS_URL)
   .expectStatus(400)
   .after(function (error, response, body) {
         console.log('Here is the body of response: ' + body);      
   })
   .toss();

frisby.create('ls should return 500 (Internal Server Error) if path does not exist')
   .post(LS_URL, {
      path: WRONG_PATH
   })
   .expectStatus(500)
   .after(function (error, response, body) {
         console.log('Here is the body of response: ' + body);      
   })
   .toss();

