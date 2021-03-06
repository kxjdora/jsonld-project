'use strict';

var shacler = require('./lib/shacler.js');
var shacl = require('./lib/checker.js');
var superagent=require("superagent");
const utils = require('./lib/utils.js');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
var createError = require('http-errors');
var logger = require('morgan');

const fs = require('fs');

const request = require('request');

const sfile= __dirname + "/public/data/schema.ttl";
const dfile= __dirname + "/public/data/data.ttl";
const mfile= __dirname + "/public/data/mixture.ttl";

const $rdf = require('rdflib');
const RDF = $rdf.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#')
const sh = $rdf.Namespace('http://www.w3.org/ns/shacl#');
const a = RDF('type')
const why = "http://tr.com"

var surl = __dirname + "/public/data/s.json"; //新建一个本地文件
var slink = "https://sleepy-oasis-49343.herokuapp.com/data/schema.json";
const s_stream = fs.createWriteStream(surl);  //创建surl文件的写入流
const s_req = superagent.get(slink);          //获得slink的超级代理
s_req.pipe(s_stream);                         //把slink中的内容写到本地文件surl中

var durl = __dirname + "/public/data/d.json";
var dlink = "http://sleepy-oasis-49343.herokuapp.com/data/data.json";
const d_stream = fs.createWriteStream(durl);
const d_req = superagent.get(dlink);
d_req.pipe(d_stream); 

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));

app.use(express.static(path.join(__dirname, 'public')))

app.use(bodyParser.urlencoded({
    extended: true
}));

//body parser
app.use(bodyParser.json());

function fread(path) {
    return fs.readFileSync(path, 'utf-8');
}

function validate (cb) {
    var sbody = fread(surl);
    var dbody = fread(durl);
    var g = new $rdf.graph();
    var s = new shacl(g, undefined, undefined,true);
    $rdf.parse(sbody, g, why, 'application/ld+json', function(err, expand){      
        s.addGraph(expand);
        $rdf.parse(dbody, g, why, 'application/ld+json', function(err, expand){      
            s.addGraph(expand)
            return s.execute(function(report){
                cb(report)
            });
        });
    });   
};

function load_graph(file) {
    var body = fread(file);
    var g = new $rdf.graph();
    $rdf.parse(body, g, why, 'text/turtle');
    return g;
};

function test(cb) {
    var schema = load_graph(sfile)
    var data = load_graph(dfile)
    var g = new $rdf.graph()
    var s = new shacl(g, undefined, undefined,true);
    s.addGraph(schema).addGraph(data)
    return s.execute(function(report){
        cb(report)
    });
};

//jsonld Test Shacl Validator
app.get('/t_jsonld', function (req, res) {
    validate(function(report){
        res.set('Content-Type', 'text/turtle');
        res.send(new Buffer("Shacl Validator(jsonld format)\n\n"+report));
    });   
})

//turtle Test Shacl Validator
app.get('/t', function (req, res) {
    test(function(report){
        res.set('Content-Type', 'text/turtle');
        res.send(new Buffer("Shacl Validator(turtle format)\n\n"+report));
    })
    
})

// curl access url and assign accept parameter
app.get(/\/(.+)/, function (req, res) {
    var url=req.params[0];
    if(url.indexOf('.')!=-1){
       url=url.slice(0,url.indexOf('.'));
    }
    
    res.format({
      html: function(){
         console.log('html');
         res.redirect(url+".html");
      },
  
      json: function(){
        console.log('json');
        res.redirect(url+".json");  
      },
  
      'application/ld+json': function(){
        console.log('jsonld');
        res.redirect(url+".json");  
      },
  
      'default': function () {
        // log the request and respond with 406
        res.status(406).send('Not Acceptable');
      }
    });
  })

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
  });
  
// error handler
  app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });

//Start web server
app.listen((process.env.PORT || 3000), function () {
    console.log("Server up and listening , port 3000");
});
