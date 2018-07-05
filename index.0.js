'use strict';

var shacler = require('./lib/shacler.js');
const utils = require('./lib/utils.js');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();

const fs = require('fs');

const request = require('request');
const slnk = "http://localhost:3000/data/schema.ttl";
const dlnk = "http://localhost:3000/data/data.ttl";

const $rdf = require('rdflib');
const RDF = $rdf.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#')
const sh = $rdf.Namespace('http://www.w3.org/ns/shacl#');
const a = RDF('type')

app.use(express.static(path.join(__dirname, 'public')))

app.use(bodyParser.urlencoded({
    extended: true
}));

//body parser
app.use(bodyParser.json());

function test_data(targetClass) {
    //var kb = new $rdf.IndexedFormula();
    var kb = new $rdf.graph();
    request(dlnk, function (err, res, body) {
        $rdf.parse(body, kb, dlnk, 'text/turtle');
        kb.statementsMatching(null, a, targetClass)
            .forEach(function (st) {
                console.log('   Target classs member: ' + st.subject)
            });
    });
};

function test_schema() {
    //var kb = new $rdf.IndexedFormula();
    var kb = new $rdf.graph();
    request(slnk, function (err, res, body) {
        $rdf.parse(body, kb, slnk, 'text/turtle');
        //        console.log(JSON.stringify(kb));
        console.log("=====Find targetClass in Schema file=======");
        kb.statementsMatching(null, sh('targetClass'), null)
            .forEach(function (st) {
                var targetClass = st.object
                var shape = st.subject
                console.log(' Target class ' + targetClass + ' is Shape of ' + shape)
                test_data(targetClass)
            });
        console.log("====================================");
    });
};

//Test Shacl Validator
app.get('/t', function (req, res) {
    //    shacl_validate();
    test_schema();
    res.send("Test Shacl Validation!");
})

//Start web server
app.listen((process.env.PORT || 3000), function () {
    console.log("Server up and listening");
});