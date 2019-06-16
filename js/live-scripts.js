/**
 * Created by sv on 11.2.17.
 */

//javascript:var teamID = 587; scriptSource = "save-player-data.js"; var script = document.createElement("script"); script.src="http://ha-browser.itdom.org/" + scriptSource; script.onload=function(){document.body.removeChild(script)}; document.body.appendChild(script);

// развёрнутый список выбора "Стоимость и сроки" в аналитике
document.forms[0].type.multiple = true;
document.forms[0].type.style.height = "120px";
document.forms[0].type.style.marginLeft = "200px";

// экспорт страницы спонсоров на сервер
parseInputData(document.querySelector("#table- tbody").innerText);

function parseInputData(data) {
	var delimiter = "\n";
	var list = data.split(delimiter);
	var tmpList;
	var element;
	var value = [];
	var tmpValue;

	for (var i = 0; i < list.length; i++) {
		tmpList = list[i].split("\t \t");
		for (var j = 0; j < tmpList.length; j++) {
			value[i] = [];
			element = tmpList[j].trim().split("\t");
			for (var k = 0; k < element.length; k++) {
				if (element[k] && k < 6) {
					tmpValue = element[k].trim().replace(/\s/g, "")
					value[i][k] = (k == 0) ? tmpValue : (parseInt(tmpValue) || "-");
					console.log(i, value[i][k]);
				}
			}
		}
	}
	console.log(JSON.stringify(value));
	if (value.length >= 16) {
		sendToServer(JSON.stringify(value));
	} else {
		// если данных нет или они не полные, то сразу переходим к обработке данных, уже имеющихся в базе
	}
}

function sendToServer(data) {
	data = "data=" + data;
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "http://ha-browser.itdom.org/sponsor-processor.php", true);
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.onreadystatechange = function() {
		if (xhr.readyState != 4) return;
		if (xhr.status == 200) {
			if (xhr.responseText == 0) {
				alert("Ошибка обработки данных. Код ответа: " + xhr.responseText + "\nПовторите отправку.");
			} else {
				console.log("Ответ сервера: " + xhr.responseText);
			}
		} else {
			alert("Ошибка отправки данных. Код ответа: " + xhr.status + " (" + xhr.statusText + ")" + " Повторите отправку.");
		}
	};
	xhr.send(data);
}

(function() {
	// ШАБЛОН
	// сохранение данных
	// URL страницы должен содержать строку вида "public_player_info.inc&player_id=40464747"
	var pageMarker = "public_player_info\\.inc";
	var playerIdMarker = "player_id=\\d+";
	if (!isValidPage(pageMarker, playerIdMarker)) {
		alert("Скрипт не может найти данных на этой странице, перейдите на страницу профиля игрока.");
		return;
	}

	var url = "http://ha-browser.itdom.org/save-player-data.php";
	var data = [
		"id=" + id,
		"name=" + encodeURIComponent(name),
		"body=" + encodeURIComponent(body)
	].join("&");

	var retData = {
		id: id,
		name: name,
		title: title,
		body: body,
		data: data,
		url: url
	};

	window.addEventListener("message", messageHandler, false);
	var popupWindow = window.open("http://ha-browser.itdom.org/save-data.html");

	function messageHandler(evt) {
		console.log(evt.data);
		if (typeof evt.data === "object" && evt.data.request === "data") {
			evt.source.postMessage(retData, "*");
		}
	}

	function isValidPage() {
		var args = Array.prototype.slice.call(arguments);
		var pageRex = new RegExp(args.join(".*"));
		return pageRex.test(location.search);
	}

	function sendDataToServer(url, data) {
		var xhr = new XMLHttpRequest();
		xhr.open("POST", url, true);
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xhr.onreadystatechange = function () {
			if (xhr.readyState != 4) return;
			if (xhr.status != 200) {
				alert('ERROR: ' + xhr.status + ': ' + xhr.statusText);
			} else {
				alert('OK: ' + xhr.responseText);
			}
		};
		xhr.send(data);
	}
})();

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
})("center");

(function(type, homeDress, awayDress) {
	// type - тип матча, дома или в гостях, 1 или 0
	// homeDress - id формы дома
	// awayDress - id формы в гостях
	// возможные пары:
	// 164, 408 (347) // 383, 407 // 404, 405, 125 // 415, 416
	var host = "https://www.hockeyarena.net/ru/";
	var path = "index.php?p=sponsor_dress_upload_sql.php";
	var url = host + path;
	var data = ["dress_file=" + (type ? homeDress : awayDress) + ".png"];

	var xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.onreadystatechange = function () {
		if (xhr.readyState != 4) return;
		if (xhr.status == 200) {
			console.log("Ответ сервера: " + xhr.status + ", " + xhr.statusText);
		} else {
			alert("Ошибка отправки данных. Код ответа: " + xhr.status + " (" + xhr.statusText + ")" + " Повторите отправку.");
		}
	};
	xhr.send(data.join("&"));
})(1, 404, 405);

(function() {
// сохранение данных матча на сервер
// save-data.js
// javascript:var script = document.createElement("script"); script.src="http://ha-browser.itdom.org/save-data.js"; script.onload=function(){document.body.removeChild(script)}; document.body.appendChild(script);
})();

(function() {
	// сохранение данных тренировки
	// URL страницы должен содержать строку вида "pmanager_training_form1.php"
	var pageMarker = "manager_training_form1\\.php";
	if (!isValidPage(pageMarker)) {
		alert("Скрипт не может найти данных на этой странице, перейдите на страницу тренировок.");
		return;
	}
	var table1 = cloneElementWithPreparing(document.getElementById("table-1"));
	removeRedundantTHeads(table1);
	removeRedundantOptions(table1);
	var table2 = cloneElementWithPreparing(document.getElementById("table-2"));
	removeRedundantTHeads(table2);
	removeRedundantOptions(table2);

	var trainingDate = new Date();
	var hours = trainingDate.getHours();
	if (hours >= 21) {
		// тренировка обновляется после 21:00 по моему местному времени (зимнее время)
		// поэтому дату нужно записать на следующий день
		trainingDate = new Date(trainingDate.getTime() + 24 * 60 * 60 * 1000);
	}
	var month = trainingDate.getMonth() + 1;
	var day = trainingDate.getDate();
	var date = trainingDate.getFullYear() + (month - 10 < 0 ? "0" : "") + month + (day - 10 < 0 ? "0" : "") + day;

	var title = "ТРЕНИРОВКИ " + date;
	var body = "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>" + title + "</title></head>"
		+ "<body>"
		+ table1.outerHTML
		+ "<br>"
		+ table2.outerHTML
		+ "</body></html>";
	var url = "http://ha-browser.itdom.org/save-training.php";
	var data = [
		"date=" + date,
		"body=" + encodeURIComponent(body)
	].join("&");

	var retData = {
		date: date,
		title: title,
		body: body,
		data: data,
		url: url
	};

	window.addEventListener("message", messageHandler, false);
	var popupWindow = window.open("http://ha-browser.itdom.org/save-data.html");

	function messageHandler(evt) {
		console.log(evt.data);
		if (typeof evt.data === "object" && evt.data.request === "data") {
			evt.source.postMessage(retData, "*");
		}
	}

	function isValidPage() {
		var args = Array.prototype.slice.call(arguments);
		var pageRex = new RegExp(args.join(".*"));
		return pageRex.test(location.search);
	}

	function cloneElementWithPreparing(element) {
		var source = element.outerHTML.replace(new RegExp("<script[^]*?<\\/script>", "gm"), "");
		var cloneParent = document.createElement("div");
		cloneParent.innerHTML = source;
		return cloneParent.children[0];
	}

	function removeRedundantTHeads(table) {
		// таблицы содержат лишние THEAD для удобства работы с ними, но нам они не нужны,
		// поэтому их нужно удалить
		var thead = table.querySelectorAll("thead");
		for (var i = thead.length - 1; i > 0; i--) {
			table.removeChild(thead[i]);
		}
	}

	function removeRedundantOptions(content) {
		// select содержат выбор расписания тренировки, для сбора статистики они не нужны,
		// поэтому их нужно удалить
		var selectList = content.querySelectorAll("select");
		for (var i = selectList.length - 1; i >= 0; i--) {
			var select = selectList[i];
			for (var j = select.options.length - 1; j >= 0; j--) {
				if (!select.options[j].selected) {
					select.options[j] = null;
				}
			}
		}
	}
})();
/*сохранение данных тренировки*/(function(){function g(c){c=c.outerHTML.replace(RegExp("<script[^]*?<\\/script>","gm"),"");var a=document.createElement("div");a.innerHTML=c;return a.children[0]}function h(c){for(var a=c.querySelectorAll("thead"),d=a.length-1;0<d;d--)c.removeChild(a[d])}function k(a){a=a.querySelectorAll("select");for(var c=a.length-1;0<=c;c--)for(var d=a[c],b=d.options.length-1;0<=b;b--)d.options[b].selected||(d.options[b]=null)}if(function(){return(new RegExp(Array.prototype.slice.call(arguments).join(".*"))).test(location.search)}("manager_training_form1\\.php")){var b=g(document.getElementById("table-1"));h(b);k(b);var e=g(document.getElementById("table-2"));h(e);k(e);var a=new Date;21<=a.getHours()&&(a=new Date(a.getTime()+864E5));var f=a.getMonth()+1,l=a.getDate();a=a.getFullYear()+(0>f-10?"0":"")+f+(0>l-10?"0":"")+l;f="ТРЕНИРОВКИ "+a;b="<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>"+f+"</title></head><body>"+b.outerHTML+"<br>"+e.outerHTML+"</body></html>";e=["date="+a,"body="+encodeURIComponent(b)].join("&");var m={date:a,title:f,body:b,data:e,url:"http://ha-browser.itdom.org/save-training.php"};window.addEventListener("message",function(a){console.log(a.data);"object"===typeof a.data&&"data"===a.data.request&&a.source.postMessage(m,"*")},!1);window.open("http://ha-browser.itdom.org/save-data.html")}else alert("Скрипт не может найти данных на этой странице, перейдите на страницу тренировок.")})();

(function() {
	// сохранение данных ДЮСШ
	// URL страницы должен содержать строку вида "manager_youth_school_form.php"
	var pageMarker = "manager_youth_school_form\\.php";
	if (!isValidPage(pageMarker)) {
		alert("Скрипт не может найти данных на этой странице, перейдите на страницу ДЮСШ.");
		return;
	}

	var table1 = cloneElementWithPreparing(document.getElementById("table-1"));
	removeRedundantTHeads(table1);
	removeRedundantColumns(table1);

	var currentDate = new Date();
	var month = currentDate.getMonth() + 1;
	var day = currentDate.getDate();
	var date = currentDate.getFullYear() + (month - 10 < 0 ? "0" : "") + month + (day - 10 < 0 ? "0" : "") + day;

	var title = "ДЮСШ " + date;
	var body = "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>" + title + "</title></head>"
		+ "<body>"
		+ table1.outerHTML
		+ "</body></html>";
	var url = "http://ha-browser.itdom.org/save-school-data.php";
	var data = [
		"date=" + date,
		"body=" + encodeURIComponent(body)
	].join("&");

	var retData = {
		date: date,
		title: title,
		body: body,
		data: data,
		url: url
	};

	window.addEventListener("message", messageHandler, false);
	var popupWindow = window.open("http://ha-browser.itdom.org/save-data.html");

	function messageHandler(evt) {
		console.log(evt.data);
		if (typeof evt.data === "object" && evt.data.request === "data") {
			evt.source.postMessage(retData, "*");
		}
	}

	function isValidPage() {
		var args = Array.prototype.slice.call(arguments);
		var pageRex = new RegExp(args.join(".*"));
		return pageRex.test(location.search);
	}

	function cloneElementWithPreparing(element) {
		var source = element.outerHTML.replace(new RegExp("<script[^]*?<\\/script>", "gm"), "");
		var cloneParent = document.createElement("div");
		cloneParent.innerHTML = source;
		return cloneParent.children[0];
	}

	function removeRedundantTHeads(table) {
		// таблицы содержат лишние THEAD для удобства работы с ними, но нам они не нужны,
		// поэтому их нужно удалить
		var thead = table.querySelectorAll("thead");
		for (var i = thead.length - 1; i > 0; i--) {
			table.removeChild(thead[i]);
		}
	}

	function removeRedundantColumns(table) {
		// таблица содержит лишние колонки, которые не нужны для статистики,
		// поэтому их нужно удалить
		for (var i = table.rows.length - 1; i >= 0; i--) {
			var row = table.rows[i];
			var l = row.cells.length;
			for (var j = l - 1; j >= l - 3; j--) {
				row.removeChild(row.cells[j]);
			}
		}
	}
})();
/*сохранение данных ДЮСШ*/(function(){if(function(){return(new RegExp(Array.prototype.slice.call(arguments).join(".*"))).test(location.search)}("manager_youth_school_form\\.php")){var b=function(c){c=c.outerHTML.replace(RegExp("<script[^]*?<\\/script>","gm"),"");var f=document.createElement("div");f.innerHTML=c;return f.children[0]}(document.getElementById("table-1"));(function(c){for(var f=c.querySelectorAll("thead"),a=f.length-1;0<a;a--)c.removeChild(f[a])})(b);(function(c){for(var a=c.rows.length-1;0<=a;a--)for(var b=c.rows[a],d=b.cells.length,e=d-1;e>=d-3;e--)b.removeChild(b.cells[e])})(b);var a=new Date,d=a.getMonth()+1,e=a.getDate();a=a.getFullYear()+(0>d-10?"0":"")+d+(0>e-10?"0":"")+e;d="ДЮСШ "+a;b="<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>"+d+"</title></head><body>"+b.outerHTML+"</body></html>";e=["date="+a,"body="+encodeURIComponent(b)].join("&");var g={date:a,title:d,body:b,data:e,url:"http://ha-browser.itdom.org/save-school-data.php"};window.addEventListener("message",function(a){console.log(a.data);"object"===typeof a.data&&"data"===a.data.request&&a.source.postMessage(g,"*")},!1);window.open("http://ha-browser.itdom.org/save-data.html")}else alert("Скрипт не может найти данных на этой странице, перейдите на страницу ДЮСШ.")})();

(function() {
	// сохранение данных игрока
	// URL страницы должен содержать строку вида "public_player_info.inc&player_id=40464747"
	var pageMarker = "public_player_info\\.inc";
	var playerIdMarker = "id=\\d+";
	if (!isValidPage(pageMarker, playerIdMarker)) {
		alert("Скрипт не может найти данных на этой странице, перейдите на страницу профиля игрока.");
		return;
	}
	var content = cloneElementWithPreparing(document.getElementById("page"));
	removeRedundantElements(content);
	replaceTablesOutForm(content);

	var player = content.querySelector("table").innerText.match(/\s*(.*\s?.*),\sid\s(\d+)/);
	var name = player[1];
	var id = player[2];
	var title = name + ", id " + id;
	var body = "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>" + title + "</title></head>"
		+ "<body>"
		+ content.outerHTML
		+ "</body></html>";
	body = body.replace(/&amp;/g, "&");
	var url = "http://ha-browser.itdom.org/save-player-data.php";
	var data = [
		"id=" + id,
		"name=" + encodeURIComponent(name),
		"body=" + encodeURIComponent(body)
	].join("&");

	var retData = {
		id: id,
		name: name,
		title: title,
		body: body,
		data: data,
		url: url
	};

	window.addEventListener("message", messageHandler, false);
	var popupWindow = window.open("http://ha-browser.itdom.org/save-data.html");

	function messageHandler(evt) {
		console.log(evt.data);
		if (typeof evt.data === "object" && evt.data.request === "data") {
			evt.source.postMessage(retData, "*");
		}
	}

	function isValidPage() {
		var args = Array.prototype.slice.call(arguments);
		var pageRex = new RegExp(args.join(".*"));
		return pageRex.test(location.search);
	}

	function cloneElementWithPreparing(element) {
		var source = element.outerHTML
			.replace(new RegExp("<script[^]*?<\\/script>", "gm"), "")
			.replace(new RegExp("<style[^]*?<\\/style>", "gm"), "");
		var cloneParent = document.createElement("div");
		cloneParent.innerHTML = source;
		return cloneParent.children[0];
	}

	function removeRedundantElements(content) {
		content.removeChild(content.querySelector("form.uniForm"));
		content.removeChild(content.querySelector("#linedet"));
		content.removeChild(content.querySelector("#auto_train"));
		content.removeChild(content.firstElementChild);
		content.removeChild(content.firstElementChild);
		content.removeChild(content.lastElementChild);
	}

	function replaceTablesOutForm(content) {
		var form = content.querySelector("form");
		while (form.children.length > 0) {
			content.insertBefore(form.children[0], form);
		}
		content.removeChild(form);
	}
})();
/*сохранение данных игрока*/(function(){if(function(){return(new RegExp(Array.prototype.slice.call(arguments).join(".*"))).test(location.search)}("public_player_info\\.inc","id=\\d+")){var b=function(a){a=a.outerHTML.replace(RegExp("<script[^]*?<\\/script>","gm"),"").replace(RegExp("<style[^]*?<\\/style>","gm"),"");var b=document.createElement("div");b.innerHTML=a;return b.children[0]}(document.getElementById("page"));(function(a){a.removeChild(a.querySelector("form.uniForm"));a.removeChild(a.querySelector("#linedet"));a.removeChild(a.querySelector("#auto_train"));a.removeChild(a.firstElementChild);a.removeChild(a.firstElementChild);a.removeChild(a.lastElementChild)})(b);(function(a){for(var b=a.querySelector("form");0<b.children.length;)a.insertBefore(b.children[0],b);a.removeChild(b)})(b);var c=b.querySelector("table").innerText.match(/\s*(.*\s?.*),\sid\s(\d+)/),d=c[1];c=c[2];var e=d+", id "+c;b="<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>"+e+"</title></head><body>"+b.outerHTML+"</body></html>";b=b.replace(/&amp;/g,"&");var f=["id="+c,"name="+encodeURIComponent(d),"body="+encodeURIComponent(b)].join("&"),g={id:c,name:d,title:e,body:b,data:f,url:"http://ha-browser.itdom.org/save-player-data.php"};window.addEventListener("message",function(a){console.log(a.data);"object"===typeof a.data&&"data"===a.data.request&&a.source.postMessage(g,"*")},!1);window.open("http://ha-browser.itdom.org/save-data.html")}else alert("Скрипт не может найти данных на этой странице, перейдите на страницу профиля игрока.")})();

(function() {
	// сохранение данных уволенного игрока
	// URL страницы должен содержать строку вида "manager_player_fire_sql.php&player_id=40464747"
	var pageMarker = "manager_player_fire_sql\\.php";
	var playerIdMarker = "player_id=\\d+";
	if (!isValidPage(pageMarker, playerIdMarker)) {
		alert("Скрипт не может найти данных на этой странице, нужна страница доступная только после удаления игрока.");
		return;
	}

	var table = "removed_players";
	var data = {
		content: document.getElementById("page").innerText.trim().replace(/\n/g,"\\n"),
		playerID: location.href.match(/player_id=(\d+)/)[1]
	};
	var url = "http://ha-browser.itdom.org/save-data.php";
	var sentData = [
		"table=" + table,
		"data=" + encodeURIComponent(JSON.stringify(data))
	].join("&");

	var retData = {
		id: data.playerID,
		table: table,
		content: data.content,
		data: sentData,
		url: url
	};

	window.addEventListener("message", messageHandler, false);
	var popupWindow = window.open("http://ha-browser.itdom.org/save-data.html");

	function messageHandler(evt) {
		console.log(evt.data);
		if (typeof evt.data === "object" && evt.data.request === "data") {
			evt.source.postMessage(retData, "*");
		}
	}

	function isValidPage() {
		var args = Array.prototype.slice.call(arguments);
		var pageRex = new RegExp(args.join(".*"));
		return pageRex.test(location.search);
	}
})();
/*сохранение данных уволенного игрока*/(function(){if(function(){return(new RegExp(Array.prototype.slice.call(arguments).join(".*"))).test(location.search)}("manager_player_fire_sql\\.php","player_id=\\d+")){var b={content:document.getElementById("page").innerText.trim().replace(/\n/g,"\\n"),playerID:location.href.match(/player_id=(\d+)/)[1]},c=["table=removed_players","data="+encodeURIComponent(JSON.stringify(b))].join("&"),d={id:b.playerID,table:"removed_players",content:b.content,data:c,url:"http://ha-browser.itdom.org/save-data.php"};window.addEventListener("message",function(a){console.log(a.data);"object"===typeof a.data&&"data"===a.data.request&&a.source.postMessage(d,"*")},!1);window.open("http://ha-browser.itdom.org/save-data.html")}else alert("Скрипт не может найти данных на этой странице, нужна страница доступная только после удаления игрока.")})();

(function(dir) {
	// сохранение данных об итоговых ставках на спонсоров
	// URL страницы должен содержать строку вида "manager_league_sponsors.inc"
	var pageMarker = "manager_league_sponsors\\.inc";
	if (!isValidPage(pageMarker)) {
		alert("Скрипт не может найти данных на этой странице, перейдите на страницу спонсора.");
		return;
	}
	var content = cloneElementWithPreparing(document.querySelector("#page table:last-child"));

	var table = "sponsor";
	dir = dir || "5-8-ru"; // "2-2-kz";
	var host = "http://ha-browser.itdom.org";

	var currentDate = new Date();
	var month = currentDate.getMonth() + 1;
	var day = currentDate.getDate();
	var date = currentDate.getFullYear() + (month - 10 < 0 ? "0" : "") + month + (day - 10 < 0 ? "0" : "") + day;

	var title = "СПОНСОР " + date;
	var body = "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>" + title + "</title>"
			+ "<style>"
				+ ".b {font-weight: bold;}"
			+ "</style>"
			+ "</head>"
			+ "<body>"
			+ content.outerHTML
			+ "</body></html>";
	body = body.replace(/&amp;/g, "&");
	var url = host + "/sponsor-processor.php";
	var data = [
		"table=" + table,
		"dir=" + dir,
		"timestamp=" + date,
		"data=" + encodeURIComponent(body)
	].join("&");

	var retData = {
		dir: dir,
		table: table,
		body: body,
		timestamp: date,
		data: data,
		url: url
	};

	window.addEventListener("message", messageHandler, false);
	var popupWindow = window.open("http://ha-browser.itdom.org/save-data.html");

	function messageHandler(evt) {
		console.log(evt.data);
		if (typeof evt.data === "object" && evt.data.request === "data") {
			evt.source.postMessage(retData, "*");
		}
	}

	function isValidPage() {
		var args = Array.prototype.slice.call(arguments);
		var pageRex = new RegExp(args.join(".*"));
		return pageRex.test(location.search);
	}

	function cloneElementWithPreparing(element) {
		var source = element.outerHTML
			.replace(new RegExp("<script[^]*?<\\/script>", "gm"), "")
			.replace(new RegExp("<style[^]*?<\\/style>", "gm"), "");
		var cloneParent = document.createElement("div");
		cloneParent.innerHTML = source;
		return cloneParent.children[0];
	}
})("2-2-kz");
/*сохранение данных об итоговых ставках на спонсоров*/(function(c){if(function(){return(new RegExp(Array.prototype.slice.call(arguments).join(".*"))).test(location.search)}("manager_league_sponsors\\.inc")){var b=function(e){e=e.outerHTML.replace(RegExp("<script[^]*?<\\/script>","gm"),"").replace(RegExp("<style[^]*?<\\/style>","gm"),"");var a=document.createElement("div");a.innerHTML=e;return a.children[0]}(document.querySelector("#page table:last-child"));c=c||"5-8-ru";var a=new Date,d=a.getMonth()+1,f=a.getDate();a=a.getFullYear()+(0>d-10?"0":"")+d+(0>f-10?"0":"")+f;b="<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>СПОНСОР "+a+"</title><style>.b {font-weight: bold;}</style></head><body>"+b.outerHTML+"</body></html>";b=b.replace(/&amp;/g,"&");d=["table=sponsor","dir="+c,"timestamp="+a,"data="+encodeURIComponent(b)].join("&");var g={dir:c,table:"sponsor",body:b,timestamp:a,data:d,url:"http://ha-browser.itdom.org/sponsor-processor.php"};window.addEventListener("message",function(a){console.log(a.data);"object"===typeof a.data&&"data"===a.data.request&&a.source.postMessage(g,"*")},!1);window.open("http://ha-browser.itdom.org/save-data.html")}else alert("Скрипт не может найти данных на этой странице, перейдите на страницу спонсора.")})("2-2-kz");
