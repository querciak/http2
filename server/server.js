const fs = require("fs");
const http2 = require("http2");
const koa = require("koa");
var Router = require("koa-router");
const cors = require("@koa/cors");
const koaBody = require("koa-body");
var bodyParser = require('koa-bodyparser');
const mime = require("mime");
var json = require("koa-json");
var logger = require("koa-logger");

const options = {
  key: fs.readFileSync("./localhost.key"),
  cert: fs.readFileSync("./localhost.crt")
};
const { HTTP2_HEADER_PATH } = http2.constants;

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

const app = new koa();
app.use(cors());
app.use(koaBody());
app.use(bodyParser());

var router = new Router();

/*
use-case 1
*/
router.get("/regional/maps", (ctx, next) => {

  let whichpoint = fs.readFileSync("./trace/regions.json");
  var jsonContent = JSON.parse(whichpoint);

  let get_num = fs.readFileSync("./trace/metadata.json");
  var number = JSON.parse(get_num);
  console.log("================================================")
  console.log("URL : ", ctx.url);
  //console.log("number",number.route)
  var i;
  //console.log("ar l",number.route.length);
  for (i = 0; i < number.route.length; i++){
    if(number.route[i][0] == ctx.request.query.longitude && number.route[i][1] == ctx.request.query.lattitude){
        console.log("Found the location in metadata file.");
        var loc_index = i;
        break;
    }else{
        var loc_index = -1;
    }
  }

  console.log("Index of the location:", loc_index);
  if(loc_index == -1){
    ctx.body = "{\"message\":\"NO SUCH LOCATION FOUND IN THE DATABASE!!!\"}";
    ctx.status = 404;
  }
  else if(loc_index > jsonContent.Espoo.end && jsonContent.Helsinki.end >= loc_index){
   console.log("The location belongs to region : Helsinki");
   regionalMap = fs.readFileSync("./trace/helsinki.json");
   ctx.body = JSON.parse(regionalMap);
  }else if(loc_index >= jsonContent.Espoo.start){
   console.log("The location belongs to region : Espoo");
   regionalMap = fs.readFileSync("./trace/espoo.json");
   ctx.body = JSON.parse(regionalMap);
  }
});


/*
use-case 2
*/
router.post("/upload", async ctx => {
  console.log(ctx.request.body);
  console.log('FILE UPLOADED,');
  ctx.body = { 'status':'uploaded'};
});

router.put("/upload", async ctx => {
  console.log(ctx.request.body);
  console.log('FILE UPLOADED,');
  ctx.body = { 'status':'uploaded'};
});


const sendFile = (stream, fileName) => {
  const fd = fs.openSync(fileName, "r");
  const stat = fs.fstatSync(fd);
  const headers = {
    "content-length": stat.size,
    "last-modified": stat.mtime.toUTCString(),
    "content-type": mime.getType(fileName)
  };
  stream.respondWithFD(fd, headers);
  stream.on("close", () => {
    console.log("closing file", fileName);
    fs.closeSync(fd);
  });
  stream.end();
};

const pushFile = (stream, path, fileName) => {
  stream.pushStream({ ":path": path }, (err, pushStream) => {
    if (err) {
      throw err;
    }
    sendFile(pushStream, fileName);
  });
};


/*
use-case 3
*/
router.post("/stream", async ctx => {


  // read regions
  let pointsJson = fs.readFileSync("./trace/regions.json");
  let points = JSON.parse(pointsJson);
  // read metadata
  let positionsJson = fs.readFileSync("./trace/metadata.json");
  var positions = JSON.parse(positionsJson);

  // one time var
  let espoo = false;
  let helsinki = false;
  let espooMap = fs.readFileSync("./trace/espoo.json");
  let helsinkiMap = fs.readFileSync("./trace/helsinki.json");



  // If starting point == Aalto -> respond immediately with Espoo map
  if(ctx.request.body["route"]["start"] === "Aalto University, Espoo"){
    ctx.body = {
      'espoo': `${espooMap}`
    };
  }

  // If end point == Helsinki -> push Helsinki map
  if(ctx.request.body["route"]["end"] === "University of Helsinki, Universitetsgatan, Helsinki"){
    // PUSH server here
    //ctx.state.h2push = {"test1": helsinkiMap}; DOESN'T WORK
    //pushFile(ctx.res.stream, "./trace/helsinki.json", "./trace/helsinki.json") DOESN'T WORK
    console.log("Server pushing the helsinki map to client..")
    ctx.res.write(helsinkiMap);
    console.log("File pushed to client successfully...")

  }


});



app.use(json());
app.use(bodyParser());
app.use(logger());

// response
app.use(router.routes()).use(router.allowedMethods());


const server = http2.createSecureServer(options, app.callback());
server.listen(443);
