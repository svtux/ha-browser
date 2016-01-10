/**
 * Обработка списка спонсоров
 */
var inputElement = document.getElementById("input");
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
    sendToServer(JSON.stringify(value));
}

function sendToServer(data) {
    data = "data=" + data;
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/sponsor-processor.php", true);
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
            }
        } else {
            alert("Ошибка отправки данных. Код ответа: " + xhr.status + " (" + xhr.statusText + ")" + " Повторите отправку.");
        }
    };
    xhr.send(data);
}