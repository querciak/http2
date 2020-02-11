// disable SSL certificate verification
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}


// set the protocol
const http2 = require("http2");

// create mime API access
var mime = require('mime-types')

// set the server link
//const client = http2.connect("https://ec2-52-15-50-82.us-east-2.compute.amazonaws.com");
const client = http2.connect("https://localhost");

// append user location to this path
var path_for_request = "/stream";

// read the route file
const locations_path = "sample_data/trace/metadata.json";

// open the file
const fs = require('fs');

// read the region file
let pointsJson = fs.readFileSync("sample_data/trace/regions.json");
let points = JSON.parse(pointsJson);

// use sync reading to store the content of metadata.json into data
var json_data = fs.readFileSync(locations_path, 'utf8');

// parse json
var metadata = JSON.parse(json_data);

// create a JSON { "route" : metadata.json }
let postbody = JSON.stringify({
    route: metadata
});


// create request
const req = client.request({
    ":method": "POST",
    ":path": path_for_request,
    "content-type": mime.lookup('json'), // require $ npm install mime-types
    "content-length": Buffer.byteLength(postbody),
});

req.on("response", (headers, flags) => {
    console.log("");
    console.log(headers);

});
let data = "";
var dataArray = [];
let app = 0;
req.on("data", chunk => {
    //console.log("new chunk: " + data);
    dataArray.push(chunk);
    data = data + chunk;
});
req.on("end", () => {
    //let dataJson = JSON.parse(data);

    for(let i = 0; i <= metadata["route"].length-1; i++){
        // check if current location belong to espoo or helsinki
        if(i >= points.Espoo.start && i <= points["Espoo"]["end"]){
            console.log("Now in: Espoo, in position: " + i + ", map stored in dataArray[1]" );
            if(points.Espoo.end - i === 2){
                // request the next regional map
                    // check the cache before
                console.log("checking cache before a new request...");
            }
        }
        if(i >= points.Helsinki.start && i <= points.Helsinki.end){
            console.log("Now in: Helsinki, in posizion: " + i + ", map stored in dataArray[0]" );

        }
        sleep(10);
    }
    client.on("stream", ()=>{
        console.log("\n\ninside stream" + data + "\n\n");
    });
    // print both maps
    for(a = 0; a < dataArray.length; a++){
        console.log(`dataArray: ${a} ` + dataArray[a]);
    }

    client.close();
});
req.end(postbody);

