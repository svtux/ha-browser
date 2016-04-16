/**
 * Директивы общего назначения
 */
angular.module("haBrowser")
	.directive("btnChangeData", function() {
		return {
			scope: true,
			link: function(scope, element, attrs) {
				// открываем форму ввода данных игрока
			}
		};
	})

	.directive("btnUpdateData", function() {
		return {
			scope: true,
			link: function(scope, element, attrs) {
				// обновляем данные и закрываем форму ввода данных игрока
			}
		};
	})

	.directive("playerTable", function() {
		return {
			scope: true,
			link: function(scope, element, attrs) {
				element.on("click", function(e) {
					// if (e.target.tagName == "A" || e.target.parentNode.tagName == "A") {
					e.preventDefault();
					// }
				});
			}
		};
	})

	.directive("inputPlayerData", function() {
		return {
			scope: true,
			link: function(scope, element, attrs) {
				// форма ввода данных игрока
			}
		};
	});