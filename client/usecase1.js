// disable SSL certificate verification
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
// set the protocol
const http2 = require("http2");
// set the API link
//const client = http2.connect("https://ec2-52-15-50-82.us-east-2.compute.amazonaws.com");
const client = http2.connect("https://localhost");
// append user location to this path
var path_for_request = "/regional/maps?";

// read the file and prompt the user to select a location
const locations_path = "sample_data/trace/metadata.json";
// open the file
const fs = require('fs');
// use sync reading to store the content of metadata.json into data
var json_data = fs.readFileSync(locations_path, 'utf8');
// parse json
var metadata = JSON.parse(json_data)
// ask te user to select a location
console.log("You are between: [" + metadata['start'] + `]\nand: [${metadata['end']}]`);
// console.log(`Please select a location (insert a n. between 0 and ${metadata['route'].length-1})`);

// take user input
var readline = require('readline-sync');
//var user_location = -1;
//while(user_location < 0 || user_location > metadata['route'].length-1){
var longitude = readline.question(`Please enter longitude:`);
var lattitude = readline.question(`Please enter lattitude:`);
//}
console.log(`-------------------You are here: [${longitude}, ${lattitude}]`);

// update path with user location
path_for_request = path_for_request+"longitude=" + longitude +'&' +"lattitude="+lattitude;
//console.log(`-------------------Here is the updated path: ${path_for_request}`);

// request the specific location
const req = client.request({
 ":method": "GET",
 ":path": path_for_request
});

// data is created and ready to be evaluated
let data = "";

req.on("response", (headers, flags) => {
 for (const name in headers) {
  console.log(`${name}: ${headers[name]}`);
 }
});

req.on("data", chunk => {
 data += chunk;
});


req.on("end", () => {
 console.log(data);
 client.close();
});

req.end();
