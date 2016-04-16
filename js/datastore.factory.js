/**
 * Модуль работы с данными.
 *
 * Получение, сохранение, изменение данных на сервере.
 */
angular.module("haBrowser")
	.factory("DataStore", function($resource) {
			return {
				player: $resource("player?id=:id")
			};
		}
	);