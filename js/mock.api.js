angular.module("haBrowser").run(function($httpBackend) {
	var player = {};
	var players = [];

	$httpBackend.whenGET("player?id=").respond(200, player);
	$httpBackend.whenGET("players").respond(function(method, url, data, headers, params) {
		var result = [];
		// for (var i = 0; i < courses.length; i++) {
		// 	if (courses[i].date.replace(/-/g, "") == params.date) {
		// 		result.push(courses[i]);
		// 	}
		// }
		return [200, result];
	});

	$httpBackend.whenDELETE("player?id=").respond(function(method, url, data) {
		// var courseId = parseInt(url.match(courseIdRequest)[1]);
		// for (var i = 0; i < courses.length; i++) {
		// 	if (courses[i].courseId == courseId) {
		// 		courses.splice(i, 1);
		// 		break;
		// 	}
		// }
		return [200];
	});

	$httpBackend.whenPOST("player").respond(function(method, url, data) {
		var result = [];
		// data = angular.fromJson(data);
		// var nextCourseId = courses[courses.length - 1].courseId;
		// for (var i = 0; i < data.length; i++) {
		// 	if (!data[i].courseId) {
		// 		data[i].courseId = ++nextCourseId;
		// 		courses.push(data[i]);
		// 		result.push(data[i]);
		// 	}
		// }
		return [200, result];
	});
	$httpBackend.whenPOST("player?id=").respond(function(method, url, data) {
		// var courseId = parseInt(url.match(courseIdRequest)[1]);
		// data = angular.fromJson(data);
		// for (var i = 0; i < courses.length; i++) {
		// 	if (courses[i].courseId == courseId) {
		// 		courses[i] = data;
		// 		break;
		// 	}
		// }
		return [200];
	});

	// pass through other requests
	$httpBackend.whenGET(/template/i).passThrough();
});