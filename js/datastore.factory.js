/**
 * Модуль работы с данными.
 *
 * Получение, сохранение, изменение данных на сервере.
 */
angular.module("haBrowser")
	.factory("DataStore", function($resource) {
		return {
			game: $resource("/db/games/:id", {}, {get: {interceptor: {response:
				function(response) {
					return response;
				}}}}),
			games: $resource("/data/games.php"),
			player: $resource("/db/players/:id"),
			players: $resource("/data/players.php")
		};
	});