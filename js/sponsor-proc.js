/**
 * Обработка списка спонсоров
 */
var wrapperElement = document.getElementById("wrapper");
var inputElement = document.getElementById("input");
var outputElement = document.getElementById("output");
var button = document.getElementById("parseData");
button.addEventListener("click", parseInputData, false);

var delimiter = "\n";

function parseInputData() {
    var data = inputElement.value;
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
		sendToServer(value);
	} else {
		// если данных нет или они не полные, то сразу переходим к обработке данных, уже имеющихся в базе
		getData();
	}
}

function sendToServer(data, table) {
    data = "data=" + data;
    table = table || "5-8";
    var host = "http://ha-browser.itdom.org";
    var xhr = new XMLHttpRequest();
    xhr.open("POST", host + "/save-data.php", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function() {
        if (xhr.readyState != 4) return;
        if (xhr.status == 200) {
            if (xhr.responseText == 0) {
                alert("Ошибка обработки данных. Код ответа: " + xhr.responseText + "\nПовторите отправку.");
            } else {
                inputElement.placeholder = "Данные сохранены";
                inputElement.value = "";
                setTimeout(function(){
                    inputElement.placeholder = "";
                }, 5000);
                console.log("Ответ сервера: " + xhr.responseText);

				getData();
            }
        } else {
            alert("Ошибка отправки данных. Код ответа: " + xhr.status + " (" + xhr.statusText + ")" + " Повторите отправку.");
        }
    };
    xhr.send(["table=" + table, "data=" + encodeURIComponent(JSON.stringify(data))].join("&"));
}

function getData(table) {
	table = table || "5-8";
	var host = "http://ha-browser.itdom.org";
	var xhr = new XMLHttpRequest();
	xhr.open("GET", host + "/db/" + table + ".txt", true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4 && xhr.status == 200) {
			dataProcessor(xhr.responseText);
		}
	};
	xhr.send();
}

function dataProcessor(data) {
	wrapperElement.classList.remove("hidden");

	data = data.split("\n");

	var sortedData = {};
	var list1 = [];
	var list2 = [];
	for (var i = 0; i < data.length; i++) {
		if (data[i] == "") continue;
		
		if (list1.indexOf(data[i]) == -1) {
			list1.push(data[i]);
			list2.push(JSON.parse(data[i]));
		}
	}

	for (var i = 0; i < list2.length; i++) {
		for (var j = 0; j < list2[i].length; j++) {
			if (!sortedData[list2[i][j][0]]) {
				sortedData[list2[i][j][0]] = [];
			}
			sortedData[list2[i][j][0]].push([
				list2[i][j][3],
				list2[i][j][4],
				list2[i][j][1] // максимальная ставка спонсора
			])
		}
	}

	for (var k in sortedData) {
		var row = k + " (min): ";
		var list = "";
		var payCollection = [];
		for (var i = 1; i < sortedData[k].length; i++) {
			var n1 = sortedData[k][i - 1][0];
			var n2 = sortedData[k][i][0];
			var n = n2 - n1;
			if (n != 0) {
				var pay1 = n1 * sortedData[k][i - 1][1];
				var pay2 = n2 * sortedData[k][i][1];
				payCollection.push((pay2 - pay1) / n);
			}
		}

		for (var i = 0; i < payCollection.length; i++) {
			if (!isNaN(payCollection[i])) {
				if (payCollection[i] > sortedData[k][0][2]) {
					// здесь нужно добавить расчёт при ошибке округления среднего значения
					list += sortedData[k][0][2];
				} else {
					list += payCollection[i];
				}
			} else {
				list += "-";
			}
			if (i < payCollection.length - 1) {
				list += ", ";
			}
		}
		
		payCollection.sort(function(a, b) {return a - b});
		
		for (var i = 0; i < payCollection.length; i++) {
			if (!isNaN(payCollection[i])) {
				var minValue = payCollection[i];
				break;
			}
		}
		
		addDataRow(row + minValue + " (список: " + list + ")");
	}
}

function addDataRow(row) {
	outputElement.value += row + "\n";
}