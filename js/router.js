/**
 * Маршрутизатор
 */
angular.module("haBrowser")
	.config(["$routeProvider",
		function($routeProvider) {
			$routeProvider
				.when("/", {
					templateUrl: "template/players.table.html",
					controller: "PlayersController as plCtrl"
				})
				.when("/games", {
					templateUrl: "template/games.html",
					controller: "GamesController as gCtrl"
				})
				.when("/games/:gameID", {
					templateUrl: "template/games.html",
					controller: "GamesController as gCtrl"
				})
				.otherwise({
					redirectTo: "/"
				});
		}
	]);