/**
 * Games view controller
 *
 * Предполагаемый домен: ha-browser.ru
 */

angular.module("haBrowser")
	.controller("GamesController", function(DataStore, $routeParams, $http) {
		var $ = angular.element;
		this.list = DataStore.gamesList.query();

		this.gameID = $routeParams.gameID;

		if (this.gameID) {
			console.log(this.gameID);
			showGame.bind(this)();
		}

		this.gameData = "";

		this.showGame = showGame.bind(this);

		this.showContent = function(data) {
			this.gameData = data;
			document.getElementById("gameContent").innerHTML = this.gameData;
		};

		function showGame(id, event) {
			if (event) {
				event.preventDefault();
			}
			var host = ""; //http://ha-browser.itdom.org/";
			var url = host + "db/games/" + (id || this.gameID || "");
			// DataStore.game.get({id: id || this.gameID || ""}, this.showContent.bind(this));
			$http.get(url).then(function(response){
				this.showContent(response.data);
			}.bind(this));
		}
	});