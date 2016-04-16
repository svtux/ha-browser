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
				.otherwise({
					redirectTo: "/"
				});
		}
	]);