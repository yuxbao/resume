#!/usr/bin/node
//
// This script will run a local development server. This is useful when
// developing the theme.
//
// Usage:
// `serve.js` to use the default JSONResume example
// `serve.js <filename>` to open a particular resume file 

var http = require("http");
var fs = require('fs');
var args = require('optimist').argv;

var port = 8888;
var localResumeCandidates = ["./resume.public.json", "./resume.json"];
http.createServer(async function (req, res) {
  if (req.url === '/') {
    res.writeHead(200, {
      "Content-Type": "text/html"
    });
    res.end(await render());
  }
}).listen(port);

console.log("Preview: http://localhost:8888/");
console.log("Serving..");

async function render() {
  try {
    var localResumePath = args._.length
      ? args._[0]
      : localResumeCandidates.find(function (candidate) {
          return fs.existsSync(candidate);
        });
    var resume = localResumePath
      ? JSON.parse(fs.readFileSync(localResumePath, 'utf8'))
      : require("resume-schema").resumeJson;
    return await require("./index.js").render(resume);
  } catch (e) {
    console.log(e.message);
    return "";
  }
}
