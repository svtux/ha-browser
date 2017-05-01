/**
 * Games view controller
 *
 * Предполагаемый домен: ha-browser.ru
 */

angular.module("haBrowser")
	.controller("GamesController", function(DataStore, $routeParams, $http, $route, $scope) {
		document.title = "Список игр";
		var currRoute = $route.current;
		$scope.$on("$locationChangeSuccess", function(ev, current){
			$route.current = currRoute;
		});
		this.list = DataStore.games.query();

		this.gameID = $routeParams.gameID || "";
		this.gameData = "";
		this.showGame = showGame.bind(this);

		if (this.gameID) {
			this.showGame();
		}

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
			DataStore.game.get({id: this.gameID}, function(response){
				this.showContent(response.data);
			}.bind(this));
		}
	});