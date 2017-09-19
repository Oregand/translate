var properties = require ("properties");

var property = {
	submitProperties: function(propertiesObj, fileToRetrieve, callback) {
		submitProperties(propertiesObj, fileToRetrieve, callback);
	}
}

function submitProperties(propertiesObj, fileObj, callback) {
	console.log("---------------------->>> "+fileObj.file);

	properties.parse (fileObj.file, { path: true }, function (error, props){
	  if (error)
	  	return console.error (error);
	  callback(pushPropertiesToObject(propertiesObj, fileObj.fileName, props, fileObj.language))
	});
}

function pushPropertiesToObject(propertiesFile, fileName, properties, language) {
	var fileData = {};
	var language = fileName.substring(fileName.indexOf(propertiesFile.filePrefix)+propertiesFile.filePrefix.length,
		fileName.indexOf(propertiesFile.fileSuffix));
	console.log(language);
	if(language)
		fileData.language = language;
	fileData.fileName = fileName;
	fileData.fileProperties = properties;
	propertiesFile.fileData.push(fileData);

	return propertiesFile;
}

module.exports = property;
