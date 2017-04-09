/**
 * Games view controller
 *
 * Предполагаемый домен: ha-browser.ru
 */

angular.module("haBrowser")
	.controller("GamesController", function(DataStore, $routeParams, $http, $route, $scope) {
		var currRoute = $route.current;
		$scope.$on("$locationChangeSuccess", function(ev, current){
			$route.current = currRoute;
		});
		this.list = DataStore.gamesList.query();

		this.gameID = $routeParams.gameID || "";

		if (this.gameID) {
			console.log(this.gameID);
			showGame.bind(this)();
		}

		this.gameData = "";

		this.showGame = showGame.bind(this);

		this.showContent = function(data) {
			this.gameData = data;
			// history.pushState({}, "", "#/games/" + this.gameID);
			location.hash = "#/games/" + this.gameID;
			document.getElementById("gameContent").innerHTML = this.gameData;
		};

		function showGame(id, event) {
			if (event) {
				event.preventDefault();
			}
			if (id) {
				this.gameID = id;
			}
			var host = ""; //http://ha-browser.itdom.org/";
			var url = host + "db/games/" + this.gameID;
			// DataStore.game.get({id: id || this.gameID || ""}, this.showContent.bind(this));
			$http.get(url).then(function(response){
				this.showContent(response.data);
			}.bind(this));
		}
	});