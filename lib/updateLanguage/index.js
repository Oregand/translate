var express = require('express');
var responses = require('../response')
var error = require('../error')
var database = require('../../config/mysql')

var app = module.exports = express();

app.post('/api/updateLanguage', function (req, res) {
	var translateDetails = req;
  console.log("td: " + translateDetails);
	//processLangTranslate(translateDetails, res);
});
