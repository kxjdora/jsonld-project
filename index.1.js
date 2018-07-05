'use strict';

var shacler = require('./lib/shacler.js');
var shacl = require('./lib/checker.js');
const utils = require('./lib/utils.js');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();

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

app.use(express.static(path.join(__dirname, 'public')))

app.use(bodyParser.urlencoded({
    extended: true
}));

//body parser
app.use(bodyParser.json());

function fread(path) {
    return fs.readFileSync(path, 'utf-8');
}

function load_graph(file) {
    var body = fread(file);
    var g = new $rdf.graph();
    $rdf.parse(body, g, why, 'text/turtle');
    return g;
};

function test(res) {
    var schema = load_graph(sfile)
    var data = load_graph(dfile)
    var g = new $rdf.graph()
    var s = new shacl(g, undefined, undefined,undefined);
    s.addGraph(schema).addGraph(data)
    s.execute();
};

//Test Shacl Validator
app.get('/t', function (req, res) {
    //    shacl_validate();
    test();
    res.send("Test Shacl Validation!");
})

//Start web server
app.listen((process.env.PORT || 3000), function () {
    console.log("Server up and listening");
});