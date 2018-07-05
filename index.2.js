'use strict';

var shacler = require('./lib/shacler.js');
var shacl = require('./lib/checker.js');
var superagent=require("superagent");
const utils = require('./lib/utils.js');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();

const fs = require('fs');

const request = require('request');

const sfile= __dirname + "/public/data/schema.json"
const dfile= __dirname + "/public/data/data.json";

const $rdf = require('rdflib');
const RDF = $rdf.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#')
const sh = $rdf.Namespace('http://www.w3.org/ns/shacl#');
const a = RDF('type')
const why = "http://tr.com"

var surl = __dirname + "/public/data/s.json"; //新建一个本地文件
var slink = "http://127.0.0.1:3000/data/schema.json";
const s_stream = fs.createWriteStream(surl);  //创建surl文件的写入流
const s_req = superagent.get(slink);          //获得slink的超级代理
s_req.pipe(s_stream);                         //把slink中的内容写到本地文件surl中

var durl = __dirname + "/public/data/d.json";
var dlink = "http://127.0.0.1:3000/data/data.json";
const d_stream = fs.createWriteStream(durl);
const d_req = superagent.get(dlink);
d_req.pipe(d_stream); 

app.use(express.static(path.join(__dirname, 'public')))

app.use(bodyParser.urlencoded({
    extended: true
}));

//body parser
app.use(bodyParser.json());

function fread(path) {
    return fs.readFileSync(path, 'utf-8');
}

function validate (res) {
    var sbody = fread(surl);
    var dbody = fread(durl);
    var g = new $rdf.graph();
    var s = new shacl(g, undefined, undefined,undefined);
    $rdf.parse(sbody, g, why, 'application/ld+json', function(err, expand){      
        s.addGraph(expand);
        $rdf.parse(dbody, g, why, 'application/ld+json', function(err, expand){      
            s.addGraph(expand)
            s.execute();
        });
    });   
};

function test(res) {
    validate(res);   
    res.send("look at result in console please!");
};

//Test Shacl Validator
app.get('/t', function (req, res) {
    test(res);
})

//Start web server
app.listen((process.env.PORT || 3000), function () {
    console.log("Server up and listening");
});