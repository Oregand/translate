var express = require('express');
var responses = require('../response')
var error = require('../error')
var database = require('../../config/mysql')
var security = require('../security')

var app = module.exports = express();

app.post('/api/translate', function (req, res) {
	security.validateRequest(req, res, processLangTranslate);
});

function processLangTranslate(req, res, userId) {
	var translateDetails = req.body;
  count(translateDetails, processTranslate, res);
}

function processTranslate(translate, count, res) {
	if(count > 0)
		updateTranslate(translate, res);
	else {
		insertTranslate(translate, res);
	}
}

function updateTranslate(translate, res) {
	database.getConnection(function(err, connection) {
		connection.query('UPDATE language SET textvalue=? WHERE language=? AND property=?', [translate.textvalue,translate.language, translate.property_val ], function(err, result) {
			connection.release();
			if (err) {
				console.log(err);
				res.jsonp(500, err);
			} else {
		  		res.jsonp(200, translate);
		  	}
		});
	});
}

function insertTranslate(translate, res) {
	database.getConnection(function(err, connection) {
		connection.query('INSERT INTO language (textvalue, language, property) VALUES (?,?,?)', [translate.textvalue,translate.language, translate.property_val ], function(err, result) {
			connection.release();
			if (err) {
				console.log(err);
				res.jsonp(500, err);
			} else {
		  		res.jsonp(200, translate);
		  	}
		});
	});
}

function count(translate, callback, res) {
	database.getConnection(function(err, connection) {
		connection.query('SELECT COUNT(*) FROM language WHERE language=? AND property=?', [translate.language, translate.property_val ], function(err, result) {
			connection.release();
			callback(translate, result[0].count, res);
		});
	});
}

function transformLanguage(dbRows, language, file) {
	var languageObj = {};
	languageObj.file = file;
	languageObj.language = language;
	languageObj.properties = [];
	for(var rowNum in dbRows) {
		var row = dbRows[rowNum];
		var property = {};
		property.name = row.property;
		property.value = row.textvalue;
		property.id = row.id;
		languageObj.properties.push(property);
	}
	return languageObj;
}
