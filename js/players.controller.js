/**
 * Processor
 *
 * Предполагаемый домен: ha-browser.ru
 */

angular.module("haBrowser")
	.controller("PlayersController", function(DataStore) {
		this.playerData = {};
		var delimiter = "\n";
		var player1 = " DONALD BAK \"A\", ID 33914483;; 	Сумма умений	371	 	Отн. СУ	67%;Возр.	29	 	Страна	 Дания;Контракт	20 дн.	 	Команда	Омские Следопыты;Травма (дни)	Здоров	 	Работоспособность	 90%;Зарплата	229 379	 	Потенциал	 12%;Удовлетворенность	100%	 	Лояльность	Повысить лояльность  -2; 	Звезда	;Отн. СУ (лига)	93%	 	Затраты	?;  ПАРАМЕТРЫ;Вратарь	0 (0%)	 	Скорость	32 (39%);Защита	157 (68%)	 	Сила	71 (4%);Нападение	4 (74%)	 	Самообладание	25 (88%);Бросок	25 (6%)	 	Форма	55 (-5);Пас	57 (61%)	 	Опыт	265 (30%);Энергия	100	 	Тренировки	10%;Тренировочное расписание	;Пятерки	  2-1-2	Автосмена расписаний	;  СТАТИСТИКА;Голы	3	 	Передачи	35;Броски	55	 	Матчи	37;Результативность бросков	5.5%	 	Время на льду (минуты)	728;Штрафные минуты	14	 	+/-	52;Оценка	4.6	 	Недель в команде (дней)	119 (834)";

		this.inputData = player1.split(";").join("\n");

		//var player_proc = player1.replace(/\s/g," ").replace(/\s+/g," ").replace(/([0-9%)\sа-я])(?=[А-Я])(.)/g, "$1;$2");
		//player1.replace(/\s/g," ").replace(/\s+/g," ").replace(/([0-9%)])(?=[^0-9.%)\s])(.)/g, "$1;$2");

		this.parseInputData = function() {
			var list = this.inputData.split(delimiter);
			var tmpList;
			var item;
			var value;
			var loyal;

			for (var i = 0, n = 0; i < list.length; i++) {
				n++;
				tmpList = list[i].split("\t \t");
				for (var j = 0; j < tmpList.length; j++) {
					n += j;
					item = tmpList[j].trim().split("\t");
					var itemData = [];
					for (var k = 0; k < item.length; k++) {
						if (item[k]) {
							// console.log(n, element[k].trim());
							value = item[k].trim();
							if (n == 13 && k == 1) { // лояльность
								loyal = /([+-]\d)|([+-])$/.exec(value);
								value = loyal ? loyal[0] : "";
							} else if (n == 14) {
								if (!~value.indexOf("врат")) {
									n++;
								}
							} else if (n == 32 && k == 2) {
								n++;
								continue;
							}
							itemData[k + 1] = value;
						} else {
							n--;
						}
					}
					this.playerData["item" + n] = itemData;
				}
			}
		}
	});