const HTTP2_PORT = 443;
const fs = require("fs");
/**
 * create an http2 server
 */
const http2 = require("http2");

// read and send file content in the stream
const sendFile = (stream, fileName) => {
    const fd = fs.openSync(fileName, "r");
    const stat = fs.fstatSync(fd);
    const headers = {
        "content-length": stat.size,
        "last-modified": stat.mtime.toUTCString(),
        "content-type": "application/json"
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

// handle requests
const http2Handlers = (req, res) => {
    console.log(req.url);
    if (req.url === "/ok") {
        // push style.css
        pushFile(res.stream, "/helsinki.json", "helsinki.json");

        pushFile(res.stream, "/regions.json", "regions.json");

        // lastly send index.html file
        sendFile(res.stream, "metadata.json");
    } else {
       console.log("\nWrong URL\n");
    }
};

const serverOptions = {
    key: fs.readFileSync(__dirname + "/localhost.key"),
    cert: fs.readFileSync(__dirname + "/localhost.crt")
};

http2
    .createSecureServer( serverOptions, http2Handlers)
    .listen(HTTP2_PORT, () => {
        console.log("http2 server started on port", HTTP2_PORT);
    });

