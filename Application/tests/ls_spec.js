var frisby = require('frisby');

//var EXPECTED_RESPONSE = "[{'type':'dir'}]";


var EXPECTED_RESPONSE = '[\
       { "type": "dir", "name": "dir1"},\
       { "type": "", "name": "/home/vadim/Downloads/private-cloud/Application/tests/sandbox/file0"}\
      ]';


frisby.create('ls happy path')
   .post('http://127.0.0.1:3001/ls', {
      path: "/home/vadim/Downloads/private-cloud/Application/tests/sandbox"
   })
   .expectStatus(200)
   .expectBodyContains(EXPECTED_RESPONSE)
   .after(function (error, response, body) {
         console.log('Here is the body of response: ' + body);      
   })
   .toss();

frisby.create('ls should return 400 (Bad Request) if no path provided')
   .post('http://127.0.0.1:3001/ls')
   .expectStatus(400)
   .after(function (error, response, body) {
         console.log('Here is the body of response: ' + body);      
   })
   .toss();
