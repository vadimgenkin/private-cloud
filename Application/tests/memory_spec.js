var frisby = require('frisby');
var settings = require('../settings.json');

var SANDBOX_PATH = __dirname + "/sandbox";
var MEMORY_URL = 'http://127.0.0.1:' + settings.listen_port + '/memory'; 

frisby.create('memory happy path')
   .get(MEMORY_URL)
   .expectStatus(200)
   .expectJSONTypes({
      total: Number,
      free: Number  
   })
   .after(function (error, response, body) {
         console.log('Here is the body of response: ' + body);      
   })
   .toss();
