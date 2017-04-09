/**
 * Модуль работы с данными.
 *
 * Получение, сохранение, изменение данных на сервере.
 */
angular.module("haBrowser")
	.factory("DataStore", function($resource) {
			return {
				gamesList: $resource("http://ha-browser.itdom.org/data/games.php"),
				player: $resource("player?id=:id"),
				players: $resource("players")
			};
		}
	);