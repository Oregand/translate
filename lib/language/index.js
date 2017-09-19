var express = require('express');
var responses = require('../response')
var error = require('../error')
var database = require('../../config/mysql')
var security = require('../security')
var memcachedServer = require('../memcached')


var app = module.exports = express();
app.get('/api/language', function (req, res) {
	getDefaultLanguage(req,res,1);
});

app.get('/api/language/stat', function (req, res) {
	security.validateRequest(req, res, getLanguageStats);
});

function getDefaultLanguage(req, res, userId) {
	var language = req.query.language;
	getLanguageData("en", {}, undefined, function (data) {
		getLanguageData(language, data, req.query.search,function (data2) {
			console.log(data2);

			if(req.query.blanks=='true')
				data2 = filterBlanks(data2, language);
			else
			 	data2 = transferToList(data2);

			if(typeof req.query.search !=='undefined')
				data2 = filterPopulated(data2, language);

				if(req.query.start && req.query.end) {
						data2 = data2.slice(req.query.start, req.query.end)
				}

			res.jsonp(data2);
		});
	});
}

function transferToList(dataObj) {
	var languageList = [];
	for(var obj in dataObj) {
		var languageProperty = dataObj[obj];
		languageList.push(languageProperty);
	}
	return languageList;
}


function filterPopulated(languageProperties, language) {
	var populateList = [];
	var propertyLen = 0;
	for(var property in languageProperties) {
		if(typeof languageProperties[property][language] !== 'undefined')
			populateList.push(languageProperties[property]);
		propertyLen++;
	}
	return populateList;
}

function filterBlanks(languageProperties, language) {
	var blankList = [];
	var propertyLen = 0;
	for(var property in languageProperties) {
		if(typeof languageProperties[property][language] === 'undefined')
			blankList.push(languageProperties[property]);
		propertyLen++;
	}
	console.log(propertyLen + " ----- " + blankList.length);
	return blankList;
}

function filterBlanks(languageProperties, language) {
	var blankList = [];
	var propertyLen = 0;
	for(var property in languageProperties) {
		if(typeof languageProperties[property][language] === 'undefined')
			blankList.push(languageProperties[property]);
		propertyLen++;
	}
	console.log(propertyLen + " ----- " + blankList.length);
	return blankList;
}


function getLanguageStats(req, res, userId) {
	database.getConnection(function(err, connection) {
	connection.query( 'SELECT language, count(*) as total FROM language WHERE textvalue != "" group by 1',
			[],
				function(err, rows) {
					if(err) {
						error.send(err, [], res)
					} else {
						processStatRows(rows, res);
					}
					connection.release();
			});
	});
}

function processStatRows(statData, res) {
	var stats = {};
	var enTotal = 0;
	//find en first as base
	for(var rowNo in statData) {
		var stat = statData[rowNo];
		if(stat.language == "en") {
			enTotal= stat.total;
		}
	}
	console.log(statData);
	for(var rowNo in statData) {
		var stat = statData[rowNo];
		var lang = stat.language;
		stat.percentage = (stat.total/enTotal) * 100;
		stats[lang] = stat;
	}
	res.jsonp(200, stats);
}

function getLanguageData(language, languageData, search, callback){
	var query = "SELECT * from language WHERE language=?";
	if(typeof search !== 'undefined')
		query += " AND textvalue LIKE '%"+search+"%'";

	memcachedServer.get(language, function (cacheData, err) {
		console.log(" ++++++ cacheData " + language + " " + new Date());

		console.log(cacheData);
		if(cacheData === undefined) {
			console.log("NO DATA FOUND FOR " + language);
			database.getConnection(function(err, connection) {
			  	connection.query(query,
			  	[language],
			  		function(err, rows) {
				  		if(err) {
									callback(getLanguageAsMap(err));
				  		} else {
				  			callback(getLanguageAsMap(rows, language, languageData));
				  		}
							memcachedServer.set(language, rows, function (err) {
								console.log(err);
								console.log("Stored " + language);
							});
				    	connection.release();
			  	});
			});
		} else {
			callback(getLanguageAsMap(cacheData, language, languageData));
		}
	});
}

app.get('/api/language/codes', function (req, res) {
	database.getConnection(function(err, connection) {
		var language = req.query.language;
		var file = req.query.file;
	  	connection.query( 'SELECT distinct language from language',
	  	[],
	  		function(err, rows) {
		  		if(err) {
		  			error.send(err, [], res)
		  		} else {
		  			res.jsonp(200, rows);
		  		}
		    	connection.release();
	  	});
	});
});


app.post('/api/language', function (req, res) {
	var property = req.body;
	if(!property.id || property.id === undefined) {
		processLangInsert(property, res);
	} else {
		processLangUpdate(property, res);
	}
});

function processLangInsert(property, res) {
	database.getConnection(function(err, connection) {
		connection.query('INSERT INTO language SET ?', property, function(err, result) {
			connection.release();
			if (err) {
				console.log(err);
				res.jsonp(500, "failed");
			} else {
		  		res.jsonp(200, property);
		  	}
		});
	});
}

function processLangUpdate(property, res) {
	database.getConnection(function(err, connection) {
		connection.query('UPDATE language SET textvalue=:textvalue WHERE id=:id', property, function(err, result) {
			connection.release();
			if (err) {
				console.log(err);
				res.jsonp(500, "failed");
			} else {
		  		res.jsonp(200, property);
		  	}
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


function getLanguageAsMap (dbRows, language, languageMap) {
	console.log();
	for(var rowNum in dbRows) {
		var languageObj = {};
		var property = {};
		var row = dbRows[rowNum];
		property.name = row.property;
		property.value = row.textvalue;
		property.file = row.filename;
		property.id = row.id;
		if(typeof languageMap[row.property] !== 'undefined') {
			var currentObject = languageMap[row.property];
			currentObject[language] = property;
			languageMap[row.property] = currentObject;
		} else {

			languageObj[language] = property;
			languageMap[row.property]=languageObj;
		}
	}
	return languageMap;
}

app.post('/api/language/all', function (req, res) {
	var languageFiles = req.body;
	var insertList = [];
	for(var fileNo in languageFiles.fileData) {
		var file = languageFiles.fileData[fileNo];
		for (var propNo in file.fileProperties) {
			var property = file.fileProperties[propNo];
			var propObj = {};
			propObj.filepath = file.fileName;
			propObj.filename = file.fileName.substring(file.fileName.lastIndexOf("/")+1,file.fileName.length);
			propObj.language = file.language;
			propObj.property = propNo;
			propObj.textvalue = property;
			insertList.push(propObj);
		}
	}
	//console.log(insertList);
	processBulkLanguageInsert(insertList, 0, function(data) {
		res.jsonp(200, data);
	});
});


function processBulkLanguageInsert(languageObjs, numberProcessed, callback) {
	var language = languageObjs[numberProcessed];
	console.log(language);
	database.getConnection(function(err, connection) {
		try {
				connection.query('INSERT INTO language SET ?', language, function(err, result) {
						if (err) {
							console.log(err);
						}
						connection.release();
					  	if(numberProcessed >= languageObjs.length) {
					  		callback(languageObjs)
					  	} else {
					  		numberProcessed = numberProcessed+1;
					  		processBulkLanguageInsert(languageObjs, numberProcessed, callback);
				  		}
					});
				}
				catch (err) {
					console.log(err);
				}
	});
}
