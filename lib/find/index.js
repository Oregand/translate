var glob = require("glob")

var find = {
	findFiles: function (searchConfig, callback) {
		findFiles(searchConfig, callback);
	}
}

function findFiles(searchConfig, callback) {
	console.log(searchConfig);
	// options is optional
	if(searchConfig.mainDir) {
		glob(searchConfig.mainDir
			+searchConfig.filePrefix+'*'+searchConfig.fileSuffix, {}, function (er, files) {
			console.log("---1 "+searchConfig.files);
			if(searchConfig.files)
				searchConfig.files.push(createFileObjects(files));
			else {
				searchConfig.files = createFileObjects(files);
			}
		  callback(searchConfig);
		});
	}
}

function createFileObjects(files) {
		var fileObjs =[];
		for(var i = 0; i < files.lenght; i++) {
			var file = files[i];
			var fileObj =  {};
			fileObj.file = file;
			fileObjs.push(fileObj);
		}
		return fileObjs;
}

module.exports = find;
