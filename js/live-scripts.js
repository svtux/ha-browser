/**
 * Created by sv on 11.2.17.
 */

// список выбора в аналитике
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

(function(type, min, max, evenness) {
// ставка на спонсора
// index.php?p=manager_league_sponsors.inc&spo_id=4636545&action=offer_sql
// type=1 - центр
// type=2 - бортик
// sum=123 - сумма ставки из элемента #max (td #1)
// min - минимальный размер ставки
// max - максимальный потолок ставки
// evenness - чётность
	type = type || 1; // 1 - center, 2 - board
	min = min || 0;
	max = max || 0;
	/** @type {{id: string, sum: number}[]} */
	var betList = processList();

	sendToHAServer(0, type, betList);

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

	function sendToHAServer(i, type, betList) {
		if (i >= betList.length) {
			console.log("Bet list ended");
			return;
		}

		var id = betList[i].id;
		var sum = betList[i].sum;

		if (sum >= min && (max == 0 || sum <= max)) {
			console.log("Bet: #", id, (type == 1 ? "center" : "board"), sum);
			var host = "http://www.hockeyarena.net/ru/";
			var path = "index.php?p=manager_league_sponsors.inc&spo_id={id}&action=offer_sql";
			var url = host + path.replace("{id}", id);
			var data = ["type=" + type, "sum=" + sum];

			var xhr = new XMLHttpRequest();
			xhr.open("POST", url, true);
			xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			xhr.onreadystatechange = function () {
				if (xhr.readyState != 4) return;
				if (xhr.status == 200) {
					if (xhr.responseText == 0) {
						alert("Ошибка обработки данных. Код ответа: " + xhr.responseText + "\nПовторите отправку.");
					} else {
						//console.log("Ответ сервера: " + xhr.responseText);
						var delay = Math.random() * 3000 ^ 0; // случайная задержка до 3000мс.
						setTimeout(function(){
							sendToHAServer(i + 1, type, betList);
						}, delay);
					}
				} else {
					alert("Ошибка отправки данных. Код ответа: " + xhr.status + " (" + xhr.statusText + ")" + " Повторите отправку.");
				}
			};
			xhr.send(data.join("&"));
		} else {
			console.log("Bet is MISSED: #", id, (type == 1 ? "center" : "board"), sum);
			sendToHAServer(i + 1, type, betList);
		}
	}
})(1, 0);

(function(type, homeDress, awayDress) {
	// type - тип матча, дома или в гостях, 1 или 0
	// homeDress - id формы дома
	// awayDress - id формы в гостях
	// возможные пары:
	// 164, 408 (347) // 383, 407 // 404, 405, 125 // 415, 416
	var host = "http://www.hockeyarena.net/ru/";
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
	var body = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + title + '</title></head>'
		+ '<body>'
		+ table1.outerHTML
		+ '<br>'
		+ table2.outerHTML
		+ '</body></html>';
	var url = 'http://ha-browser.itdom.org/save-training.php';

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
	xhr.send(["date=" + date, "body=" + encodeURIComponent(body)].join("&"));

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

	// (function(){function f(c){c=c.outerHTML.replace(RegExp("<script[^]*?<\\/script>","gm"),"");var a=document.createElement("div");a.innerHTML=c;return a.children[0]}function g(a){for(var b=a.querySelectorAll("thead"),c=b.length-1;0<c;c--)a.removeChild(b[c])}function h(a){a=a.querySelectorAll("select");for(var b=a.length-1;0<=b;b--)for(var c=a[b],d=c.options.length-1;0<=d;d--)c.options[d].selected||(c.options[d]=null)}var d=f(document.getElementById("table-1"));g(d);h(d);var e=f(document.getElementById("table-2"));g(e);h(e);var a=new Date;21<=a.getHours()&&(a=new Date(a.getTime()+864E5));var k=a.getMonth()+1,l=a.getDate(),a=a.getFullYear()+(0>k-10?"0":"")+k+(0>l-10?"0":"")+l,d='<!DOCTYPE html><html><head><meta charset="utf-8"><title>\u0422\u0420\u0415\u041d\u0418\u0420\u041e\u0412\u041a\u0418 '+a+"</title></head><body>"+d.outerHTML+"<br>"+e.outerHTML+"</body></html>",b=new XMLHttpRequest;b.open("POST","http://ha-browser.itdom.org/save-training.php",!0);b.setRequestHeader("Content-Type","application/x-www-form-urlencoded");b.onreadystatechange=function(){4==b.readyState&&(200!=b.status?alert("ERROR: "+b.status+": "+b.statusText):alert("OK: "+b.responseText))};b.send(["date="+a,"body="+encodeURIComponent(d)].join("&"))})();
})();

(function() {
// сохранение данных ДЮСШ
	var table1 = cloneElementWithPreparing(document.getElementById("table-1"));
	removeRedundantTHeads(table1);
	removeRedundantColumns(table1);

	var currentDate = new Date();
	var month = currentDate.getMonth() + 1;
	var day = currentDate.getDate();
	var date = currentDate.getFullYear() + (month - 10 < 0 ? "0" : "") + month + (day - 10 < 0 ? "0" : "") + day;

	var title = "ДЮСШ " + date;
	var body = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + title + '</title></head>'
		+ '<body>'
		+ table1.outerHTML
		+ '</body></html>';
	var url = 'http://ha-browser.itdom.org/save-school-data.php';

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
	xhr.send(["date=" + date, "body=" + encodeURIComponent(body)].join("&"));

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

	// (function(){var c=function(a){a=a.outerHTML.replace(RegExp("<script[^]*?<\\/script>","gm"),"");var b=document.createElement("div");b.innerHTML=a;return b.children[0]}(document.getElementById("table-1"));(function(a){for(var b=a.querySelectorAll("thead"),e=b.length-1;0<e;e--)a.removeChild(b[e])})(c);(function(a){for(var b=a.rows.length-1;0<=b;b--)for(var e=a.rows[b],d=e.cells.length,c=d-1;c>=d-3;c--)e.removeChild(e.cells[c])})(c);var d=new Date,f=d.getMonth()+1,g=d.getDate(),d=d.getFullYear()+(0>f-10?"0":"")+f+(0>g-10?"0":"")+g,c='<!DOCTYPE html><html><head><meta charset="utf-8"><title>\u0414\u042e\u0421\u0428 '+d+"</title></head><body>"+c.outerHTML+"</body></html>",a=new XMLHttpRequest;a.open("POST","http://ha-browser.itdom.org/save-school-data.php",!0);a.setRequestHeader("Content-Type","application/x-www-form-urlencoded");a.onreadystatechange=function(){4==a.readyState&&(200!=a.status?alert("ERROR: "+a.status+": "+a.statusText):alert("OK: "+a.responseText))};a.send(["date="+d,"body="+encodeURIComponent(c)].join("&"))})();
})();

(function() {
// сохранение данных игрока
	var content = cloneElementWithPreparing(document.getElementById("page"));
	removeRedundantElements(content);
	replaceTablesOutForm(content);

	var player = content.querySelector("table").innerText.match(/\s*(.*\s?.*),\sid\s(\d+)/);
	var name = player[1];
	var id = player[2];
	var title = name + ", id " + id;
	var body = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + title + '</title></head>'
		+ '<body>'
		+ content.outerHTML
		+ '</body></html>';
	body = body.replace(/&amp;/g, "&");
	var url = 'http://ha-browser.itdom.org/save-player-data.php';

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
	xhr.send(["id=" + id, "name=" + encodeURIComponent(name), "body=" + encodeURIComponent(body)].join("&"));

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

	// (function(){var c=function(a){a=a.outerHTML.replace(RegExp("<script[^]*?<\\/script>","gm"),"").replace(RegExp("<style[^]*?<\\/style>","gm"),"");var b=document.createElement("div");b.innerHTML=a;return b.children[0]}(document.getElementById("page"));(function(a){a.removeChild(a.querySelector("form.uniForm"));a.removeChild(a.querySelector("#linedet"));a.removeChild(a.querySelector("#auto_train"));a.removeChild(a.firstElementChild);a.removeChild(a.firstElementChild);a.removeChild(a.lastElementChild)})(c);(function(a){for(var b=a.querySelector("form");0<b.children.length;)a.insertBefore(b.children[0],b);a.removeChild(b)})(c);var d=c.querySelector("table").innerText.match(/\s*(.*\s?.*),\sid\s(\d+)/),e=d[1],d=d[2],c='<!DOCTYPE html><html><head><meta charset="utf-8"><title>'+(e+", id "+d)+"</title></head><body>"+c.outerHTML+"</body></html>",c=c.replace(/&amp;/g,"&"),b=new XMLHttpRequest;b.open("POST","http://ha-browser.itdom.org/save-player-data.php",!0);b.setRequestHeader("Content-Type","application/x-www-form-urlencoded");b.onreadystatechange=function(){4==b.readyState&&(200!=b.status?alert("ERROR: "+b.status+": "+b.statusText):alert("OK: "+b.responseText))};b.send(["id="+d,"name="+encodeURIComponent(e),"body="+encodeURIComponent(c)].join("&"))})();
})();

(function() {
// сохранение данных уволенного игрока
	var table = "removed_players";
	var data = {
		content: document.getElementById("page").innerText.trim().replace(/\n/g,"\\n"),
		playerID: location.href.match(/player_id=(\d+)/)[1]
	};
	var url = 'http://ha-browser.itdom.org/save-data.php';

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
	xhr.send(["table=" + table, "data=" + encodeURIComponent(JSON.stringify(data))].join("&"));

	// (function(){var b={content:document.getElementById("page").innerText.trim().replace(/\n/g,"\\n"),playerID:location.href.match(/player_id=(\d+)/)[1]},a=new XMLHttpRequest;a.open("POST","http://ha-browser.itdom.org/save-data.php",!0);a.setRequestHeader("Content-Type","application/x-www-form-urlencoded");a.onreadystatechange=function(){4==a.readyState&&(200!=a.status?alert("ERROR: "+a.status+": "+a.statusText):alert("OK: "+a.responseText))};a.send(["table=removed_players","data="+encodeURIComponent(JSON.stringify(b))].join("&"))})();
})();

(function() {
// сохранение данных об итоговых ставках на спонсоров
	var content = cloneElementWithPreparing(document.querySelector("#page table:last-child"));


	var table = "sponsor";
	// var dir = "5-8-ru";
	var dir = "2-2-kz";
	var host = "http://ha-browser.itdom.org";

	var currentDate = new Date();
	var month = currentDate.getMonth() + 1;
	var day = currentDate.getDate();
	var date = currentDate.getFullYear() + (month - 10 < 0 ? "0" : "") + month + (day - 10 < 0 ? "0" : "") + day;

	var title = "СПОНСОР " + date;
	var body = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + title + '</title>'
			+ '<style>'
				+ '.b {font-weight: bold;}'
			+ '</style>'
			+ '</head>'
			+ '<body>'
			+ content.outerHTML
			+ '</body></html>';
	body = body.replace(/&amp;/g, "&");
	var url = host + '/sponsor-processor.php';

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
	xhr.send(["table=" + table, "dir=" + dir,  "timestamp=" + date, "data=" + encodeURIComponent(body)].join("&"));

	function cloneElementWithPreparing(element) {
		var source = element.outerHTML
			.replace(new RegExp("<script[^]*?<\\/script>", "gm"), "")
			.replace(new RegExp("<style[^]*?<\\/style>", "gm"), "");
		var cloneParent = document.createElement("div");
		cloneParent.innerHTML = source;
		return cloneParent.children[0];
	}

	// (function(dir){var c=function(a){a=a.outerHTML.replace(RegExp("<script[^]*?<\\/script>","gm"),"").replace(RegExp("<style[^]*?<\\/style>","gm"),"");var b=document.createElement("div");b.innerHTML=a;return b.children[0]}(document.querySelector("#page table:last-child")),b=new Date,d=b.getMonth()+1,e=b.getDate(),b=b.getFullYear()+(0>d-10?"0":"")+d+(0>e-10?"0":"")+e,c='<!DOCTYPE html><html><head><meta charset="utf-8"><title>\u0421\u041f\u041e\u041d\u0421\u041e\u0420 '+b+"</title><style>.b {font-weight: bold;}</style></head><body>"+c.outerHTML+"</body></html>",c=c.replace(/&amp;/g,"&"),a=new XMLHttpRequest;a.open("POST","http://ha-browser.itdom.org/sponsor-processor.php",!0);a.setRequestHeader("Content-Type","application/x-www-form-urlencoded");a.onreadystatechange=function(){4==a.readyState&&(200!=a.status?alert("ERROR: "+a.status+": "+a.statusText):alert("OK: "+a.responseText))};a.send(["table=sponsor&dir="+dir,"timestamp="+b,"data="+encodeURIComponent(c)].join("&"))})("5-8-ru");//2-2-kz
})();
