// disable SSL certificate verification
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
// set the protocol
const http2 = require("http2");
// set the API link
// const client = http2.connect("https://ec2-52-15-50-82.us-east-2.compute.amazonaws.com");
const client = http2.connect("https://localhost")
//const client = http2.connect("http://localhost");
// append user location to this path
var path_for_request = "/upload?location=";

// read the file and prompt the user to select a location
const locations_path = "sample_data/trace/metadata.json";
// open the file
const fs = require('fs');
// use sync reading to store the content of metadata.json into data
var json_data = fs.readFileSync(locations_path, 'utf8');
// parse json
var metadata = JSON.parse(json_data);
// ask te user to select a location
console.log("You are between: [" + metadata['start'] + `]\nand: [${metadata['end']}]`);
// console.log(`Please select a location (insert a n. between 0 and ${metadata['route'].length-1})`);

// take user input
var readline = require('readline-sync');
var user_location = -1;
while(user_location < 0 || user_location > metadata['route'].length-1){
 user_location = readline.question(`Please select a location (insert a n. between 0 and ${metadata['route'].length-1})`);
}
console.log(`-------------------You are here: [${metadata['route'][user_location][0].toFixed(4)}, ${metadata['route'][user_location][1].toFixed(4)}]`);
// update path with user location
path_for_request = path_for_request + metadata['route'][user_location][0] + ',' + metadata['route'][user_location][1];
console.log(`-------------------Here is the updated path: ${path_for_request}`);


// converting the right image into base64
var image_path = "sample_data/trace/gsv_" + user_location + ".jpg";
// read binary data
var bitmap = fs.readFileSync(image_path);
// base64 image
var base64str = new Buffer.from(bitmap, "base64").toString("base64");

// creation of POST request, still missing the PUT request
/*
* POST Request: https://stackoverflow.com/questions/58156747/how-to-send-a-http-2-0-request-with-node-js
* */

// create a JSON { "image" : base64str }
let postbody = JSON.stringify({
    image: base64str
});
// create request
const req = client.request({
    ":method": "POST",
    ":path": path_for_request,
    "content-type": "application/json",
    "content-length": Buffer.byteLength(postbody),
});

req.on("response", (headers, flags) => {
    console.log(`|------------------ INSIDE req.on(response)`);
    for (const name in headers) {
        console.log(`${name}: ${headers[name]}`);
    }
});

let data = "";

req.on("data", chunk => {
    data = data + chunk;
});

req.on("end", () => {

    console.log(data);
    client.close();
});

req.end(postbody);
