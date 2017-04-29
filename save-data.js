(function() {
// сохранение данных матча на сервер
	var body = document.getElementById("page").outerHTML.replace(/<script[^]*?<\/script>/gm,"").replace(/<link[^]*?>/g,"").replace(/color:#ffffff/g,"");
	var matchDate = body.match(/(\d\d\.\d\d\.\d\d\d\d)/m)[0];
	var date = matchDate.split(".").join("");
	var title = body.match(new RegExp("МАТЧ[^]*" + matchDate,"gm"))[0].replace(/<.*?>/gm, "").replace(/\s\s*/gm," ");
	var url = 'http://ha-browser.itdom.org/save-game.php';

	var xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xhr.onreadystatechange = function(){
		if (xhr.readyState != 4) return;
		if (xhr.status != 200) {
			alert('ERROR: ' + xhr.status + ': ' + xhr.statusText);
		} else {
			alert('OK: ' + xhr.responseText);
		}
	};
	xhr.send(["date=" + date, "title=" + title, "body=" + encodeURIComponent(body)].join("&"));

// javascript:var script = document.createElement("script"); script.src="http://ha-browser.itdom.org/save-data.js"; script.onload=function(){document.body.removeChild(script)}; document.body.appendChild(script);
})();