(function(type, min, max, evenness) {
	// ставка на спонсора
	// если вызвать функцию без параметров, то значения параметров рассчитываются
	//   автоматически исходя из смысла параметра:
	//   type - если тип не задан, то делает ставки сначала на центр,
	//          и только если останутся возможные ставки на бортик.
	//   min  - минимальное значение ставки рассчитывается из текущего,
	//          а если осталась одна неделя до завершения,
	//          то минимальная ставка считается нулём.
	//   max  - максимальное значение считается нулём по умолчанию,
	//          но может принимать значение минимального ограничения от ставки
	//          на центр, в случае рассчёта для автоматической ставки.
	// index.php?p=manager_league_sponsors.inc&spo_id=4636545&action=offer_sql
	// type=1 - центр
	// type=2 - бортик
	// sum=123 - сумма ставки из элемента #max (td #1)
	// min - минимальный размер ставки
	// max - максимальный потолок ставки
	// evenness - чётность

	// URL страницы должен содержать строку вида "manager_league_sponsors.inc"
	var pageMarker = "manager_league_sponsors\\.inc";
	if (!isValidPage(pageMarker)) {
		alert("Скрипт не может найти данных на этой странице, перейдите на страницу спонсора.");
		return;
	}

	/** @const {string} */
	var CENTER = "center";
	/** @const {string} */
	var BOARD = "board";
	/** @const {string} */
	var ALL = "all";
	if (type !== CENTER && type !== BOARD) {
		type = ALL;
	}

	/** @const {number} the minimum gap of bet */
	var MINIMUM_GAP_OF_BET = 1E5;
	/** @type {object} */
	var bets = getCurrentBets();
	/** @type {{id: string, sum: number}[]} */
	var betList = processList();

	if (type === ALL) {
		// go through all sponsor placements
		max = 0;
		if (bets[CENTER].restDays === 1) {
			min = 0;
		} else {
			min = bets[CENTER].bet + MINIMUM_GAP_OF_BET;
		}
		sendToHAServer(0, CENTER, betList, min, max, function(i, max) {
			max = max || 0;
			if (bets[BOARD].restDays === 1) {
				min = 0;
			} else {
				min = bets[BOARD].bet + MINIMUM_GAP_OF_BET;
			}
			sendToHAServer(i, BOARD, betList, min, max);
		});
	} else {
		max = max || 0;
		if (bets[type].restDays === 1) {
			min = 0;
		} else {
			min = min || bets[type].bet + MINIMUM_GAP_OF_BET;
		}
		sendToHAServer(0, type, betList, min, max);
	}

	function isValidPage() {
		var args = Array.prototype.slice.call(arguments);
		var pageRex = new RegExp(args.join(".*"));
		return pageRex.test(location.search);
	}

	function processList() {
		/** @type {{id: string, sum: number}[]} */
		var betList = [];
		var list = document.querySelectorAll("#page table a.nib");
		for (var i = 0, l = list.length; i < l; i++) {
			var id = list[i].href.match(/spo_id=(\d+)/)[1];
			var sum = parseInt(list[i].parentElement.parentElement.children[1].innerText.replace(/\s/g, ""));
			betList.push({id: id, sum: sum});
		}
		return betList;
	}

	function getCurrentBets() {
		/** @const {string} */
		var CENTER = "Центральный круг";
		/** @const {string} */
		var BOARD = "Бортик";
		/** @type {object} */
		var bets = {
			board: {
				bet: 0,
				restDays: 0
			},
			center: {
				bet: 0,
				restDays: 0
			}
		};
		/** @type {string} */
		var rowTitle;
		/** @type {HTMLCollection} */
		var tableList = document.querySelectorAll("#page table");
		/** @type {HTMLTableElement} */
		var tableBets = tableList[tableList.length - 1];
		var rowsNumber = tableBets.rows.length;
		if (rowsNumber === 3) {
			// two bets already are presented
			bets.center.bet = parseInt(tableBets.rows[1].cells[0].innerText.replace(/\s/g,""));
			bets.center.restDays = parseInt(tableBets.rows[1].cells[1].innerText);
			bets.board.bet = parseInt(tableBets.rows[2].cells[0].innerText.replace(/\s/g,""));
			bets.board.restDays = parseInt(tableBets.rows[2].cells[1].innerText);
		} else if (rowsNumber === 2) {
			// only one bet is presented
			rowTitle = tableBets.rows[1].cells[0].innerText;
			switch (rowTitle) {
				case CENTER:
					bets.center.bet = parseInt(tableBets.rows[1].cells[0].innerText.replace(/\s/g,""));
					bets.center.restDays = parseInt(tableBets.rows[1].cells[1].innerText);
					break;
				case BOARD:
					bets.board.bet = parseInt(tableBets.rows[1].cells[0].innerText.replace(/\s/g,""));
					bets.board.restDays = parseInt(tableBets.rows[1].cells[1].innerText);
					break;
			}
		} else {
			// no bets
		}
		return bets;
	}

	function sendToHAServer(i, type, betList, min, max, callback) {
		if (i >= betList.length) {
			console.log("Bet list ended");
			return;
		}

		var id = betList[i].id;
		var sum = betList[i].sum;

		if (sum >= min && (max == 0 || sum <= max)) {
			console.log("Bet: #", id, type, sum);
			var host = "https://www.hockeyarena.net/ru/";
			var path = "index.php?p=manager_league_sponsors.inc&spo_id={id}&action=offer_sql";
			var url = host + path.replace("{id}", id);
			var data = ["type=" + (type === "center" ? 1 : 2), "sum=" + sum];

			var xhr = new XMLHttpRequest();
			xhr.open("POST", url, true);
			xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			xhr.onreadystatechange = function () {
				if (xhr.readyState != 4) return;
				if (xhr.status == 200) {
					if (xhr.responseText == 0) {
						alert("Ошибка обработки данных. Код ответа: " + xhr.responseText + "\nПовторите отправку.");
					} else {
						if (i < betList.length - 1) {
							var delay = Math.random() * 3000 ^ 0; // случайная задержка до 3000мс.
							setTimeout(function () {
								sendToHAServer(i + 1, type, betList, min, max, callback);
							}, delay);
						} else {
							console.log("Bet list ended");
						}
					}
				} else {
					alert("Ошибка отправки данных. Код ответа: " + xhr.status + " (" + xhr.statusText + ")" + " Повторите отправку.");
				}
			};
			xhr.send(data.join("&"));
		} else {
			console.log("The MINIMUM bet is reached: #", id, type, sum);
			if (typeof callback === "function") {
				callback(i, sum);
			}
		}
	}
})();