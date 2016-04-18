/**
 * Processor
 *
 * Предполагаемый домен: ha-browser.ru
 */

angular.module("haBrowser")
	.controller("PlayersController", function(DataStore, $locale) {
		var defaultData = {
			"name": {title: "", value: "Player Name", id: 1234567},
			"skillsSum": {title: "Сумма умений", value: 1},
			"relativeSkillsSum": {title: "Отн. СУ", value: 0, id: 0},
			"age": {title: "Возр.", value: 17},
			"country": {title: "Страна", value: "", code: ""},
			"contract": {title: "Контракт", value: 0},
			"team": {title: "Команда", value: ""},
			"injury": {title: "Травма (дни)", value: "Здоров"},
			"quality": {title: "Работоспособность", value: 0, investigated: false, unknown: false},
			"salary": {title: "Зарплата", value: 0},
			"potential": {title: "Потенциал", value: 0, investigated: false, unknown: false, tips: ""},
			"satisfaction": {title: "Удовлетворенность", value: 0},
			"loyalty": {title: "Лояльность", value: "", unknown: false},
			"goalieWeakSpot": {title: "Слабое место", value: "Нет", unknown: false},
			"star": {title: "Звезда", value: "", number: 0, unknown: false},
			"relativeSkillsSumLeague": {title: "Отн. СУ (лига)", value: 0},
			"cost": {title: "Затраты", value: "?"},
			"attributes": {title: "Параметры"},
			"goalie": {title: "Вратарь", value: "0 (0%)"},
			"speed": {title: "Скорость", value: "0 (0%)"},
			"defense": {title: "Защита", value: "0 (0%)"},
			"strength": {title: "Сила", value: "0 (0%)"},
			"offense": {title: "Нападение", value: "0 (0%)"},
			"selfControl": {title: "Самообладание", value: "0 (0%)"},
			"shooting": {title: "Бросок", value: "0 (0%)"},
			"form": {title: "Форма", value: "0 (0)"},
			"passing": {title: "Пас", value: "0 (0%)"},
			"experience": {title: "Опыт", value: "0 (0%)"},
			"energy": {title: "Энергия", value: 0},
			"training": {title: "Тренировки", value: 0},
			"trainingSchedule": {title: "Тренировочное расписание"},
			"statistics": {title: "Статистика"},
			"goals": {title: "Голы", value: 0},
			"assists": {title: "Передачи", value: 0},
			"shots": {title: "Броски", value: 0},
			"games": {title: "Матчи", value: 0},
			"shootingPercentage": {title: "Результативность бросков", value: 0},
			"timeOnIce": {title: "Время на льду (минуты)", value: 0},
			"penalties": {title: "Штрафные минуты", value: 0},
			"plus_minus": {title: "+/-", value: 0},
			"rating": {title: "Оценка", value: "0.0"},
			"weeksInTeam": {title: "Недель в команде (дней)", value: "0 (0)"}
		};
		var rexMap = {
			"name": "(.*),\\sID\\s(\\d+)",
			"skillsSum": "(Сумма\\sумений)\\s(\\d+)",
			"relativeSkillsSum": "(Отн\\.\\sСУ)\\s(\\d+)",
			"age": "(Возр.)\\s(\\d+)",
			"country": "(Страна)\\s+(.+)$",
			"contract": "(Контракт)\\s(\\d+)",
			"team": "(Команда)\\s(.+)$",
			"injury": "(Травма\\s\\(дни\\))\\s+(\\d+|[^\\s]+)",
			"quality": "(Работоспособность)\\s+(\\d+)",
			"salary": "(Зарплата)\\s+(\\d+\\s\\d+)",
			"potential": "(Потенциал)\\s+(\\d+)",
			"satisfaction": "(Удовлетворенность)\\s+(\\d+)",
			"loyalty": "(Лояльность)\\s+.+([+-]\\d+)$",
			"goalieWeakSpot": "",
			"star": "(Звезда)\\s+(\\d+)",
			"relativeSkillsSumLeague": "(Отн\\.\\sСУ\\s\\(лига\\))\\s(\\d+)",
			"cost": "",
			"attributes": "",
			"goalie": "(Вратарь)\\s(\\d+\\s\\(\\d+%\\))",
			"speed": "(Скорость)\\s(\\d+\\s\\(\\d+%\\))",
			"defense": "(Защита)\\s(\\d+\\s\\(\\d+%\\))",
			"strength": "(Сила)\\s(\\d+\\s\\(\\d+%\\))",
			"offense": "(Нападение)\\s(\\d+\\s\\(\\d+%\\))",
			"selfControl": "(Самообладание)\\s(\\d+\\s\\(\\d+%\\))",
			"shooting": "(Бросок)\\s(\\d+\\s\\(\\d+%\\))",
			"form": "(Форма)\\s(\\d+\\s\\([+-]?\\d+\\))",
			"passing": "(Пас)\\s(\\d+\\s\\(\\d+%\\))",
			"experience": "(Опыт)\\s(\\d+\\s\\(\\d+%\\))",
			"energy": "(Энергия)\\s+(\\d+)",
			"training": "(Тренировки)\\s+(\\d+)",
			"trainingSchedule": "",
			"statistics": "",
			"goals": "(Голы)\\s+(\\d+)",
			"assists": "(Передачи)\\s+(\\d+)",
			"shots": "(Броски)\\s+(\\d+)",
			"games": "(Матчи)\\s+(\\d+)",
			"shootingPercentage": "(Результативность\\sбросков)\\s+(\\d+\\.\\d+)",
			"timeOnIce": "(Время\\sна\\sльду\\s\\(минуты\\))\\s+(\\d+)",
			"penalties": "(Штрафные\\sминуты)\\s+(\\d+)",
			"plus_minus": "(\\+\\/-)\\s+(-?\\d+)",
			"rating": "(Оценка)\\s+(\\d+\\.\\d+)",
			"weeksInTeam": "(Недель\\sв\\sкоманде\\s\\(дней\\))\\s+(\\d+\\s\\(\\d+\\))"
		};
		var potentialList = [106, 100, 94, 88, 82, 76, 71, 65, 59, 53, 47, 41, 35, 29, 24, 18, 12, 6, 0];

		this.inputData = "";
		this.playerData = angular.copy(defaultData);
		this.dataMap = {
			0: "name",
			2: "skillsSum",
			3: "relativeSkillsSum",
			4: "age",
			5: "country",
			6: "contract",
			7: "team",
			8: "injury",
			9: "quality",
			10: "salary",
			11: "potential",
			12: "satisfaction",
			13: "loyalty",
			// 14: "goalieWeakSpot",
			14: "star",
			15: "relativeSkillsSumLeague",
			// 16: "cost",
			// 17: "attributes",
			18: "goalie",
			19: "speed",
			20: "defense",
			21: "strength",
			22: "offense",
			23: "selfControl",
			24: "shooting",
			25: "form",
			26: "passing",
			27: "experience",
			28: "energy",
			29: "training",
			// 30: "trainingSchedule",
			// 32: "statistics",
			33: "goals",
			34: "assists",
			35: "shots",
			36: "games",
			37: "shootingPercentage",
			38: "timeOnIce",
			39: "penalties",
			40: "plus_minus",
			41: "rating",
			42: "weeksInTeam"
		};

		this.minimized = true;
		this.changed = false;

		var delimiter = "\n";
		// var player1 = " DONALD BAK \"A\", ID 33914483;; 	Сумма умений	371	 	Отн. СУ	67%;Возр.	29	 	Страна	 Дания;Контракт	20 дн.	 	Команда	Омские Следопыты;Травма (дни)	Здоров	 	Работоспособность	 90%;Зарплата	229 379	 	Потенциал	 12%;Удовлетворенность	100%	 	Лояльность	Повысить лояльность  -2; 	Звезда	;Отн. СУ (лига)	93%	 	Затраты	?;  ПАРАМЕТРЫ;Вратарь	0 (0%)	 	Скорость	32 (39%);Защита	157 (68%)	 	Сила	71 (4%);Нападение	4 (74%)	 	Самообладание	25 (88%);Бросок	25 (6%)	 	Форма	55 (-5);Пас	57 (61%)	 	Опыт	265 (30%);Энергия	100	 	Тренировки	10%;Тренировочное расписание	;Пятерки	  2-1-2	Автосмена расписаний	;  СТАТИСТИКА;Голы	3	 	Передачи	35;Броски	55	 	Матчи	37;Результативность бросков	5.5%	 	Время на льду (минуты)	728;Штрафные минуты	14	 	+/-	52;Оценка	4.6	 	Недель в команде (дней)	119 (834)";
		// this.inputData = player1.split(";").join("\n");

		//var player_proc = player1.replace(/\s/g," ").replace(/\s+/g," ").replace(/([0-9%)\sа-я])(?=[А-Я])(.)/g, "$1;$2");
		//player1.replace(/\s/g," ").replace(/\s+/g," ").replace(/([0-9%)])(?=[^0-9.%)\s])(.)/g, "$1;$2");

		this.parseInputData = function() {
			this.playerData = angular.copy(defaultData);

			var list = this.inputData.split(delimiter);

			for (var i = 0, n = 0; i < list.length; i++, n++) {
				var tmpList = list[i].split("\t \t");
				for (var j = 0; j < tmpList.length; j++) {
					n += j;

					var key = this.dataMap[n];
					if (!key) {
						continue;
					}

					var rex = new RegExp(rexMap[key], "m");
					// var item = tmpList[j].trim().split("\t");
					var itemData = tmpList[j].trim().match(rex);

					/*
					for (var k = 0; k < item.length; k++) {
						if (item[k]) {
							var value = item[k].trim();

							if (n == 12 && k == 1) { // лояльность
								var loyal = /([+-]\d)|([+-])$/.exec(value);
								value = loyal ? loyal[0] : "";
							} else if (n == 13) {
								if (!~value.indexOf("врат")) {
									n++;
								}
							} else if (n == 31 && k == 2) {
								n++;
								continue;
							}
							itemData[k] = value;
						}
					}
					*/

					if (itemData && itemData.length) {
						if (n == 0) {
							this.playerData[key].value = itemData[1];
							this.playerData[key].id = itemData[2];
						} else {
							this.playerData[key].title = itemData[1];
							this.playerData[key].value = itemData[2];
						}
					}
				}
			}

			this.chooseFlagByName();
			this.setPotentialTip();
		};

		this.chooseFlagByName = function() {
			switch(this.playerData.country.value) {
				case "Дания":
					this.playerData.country.code = "denmark";
					break;
				default:
					this.playerData.country.code = "";
			}
		};

		this.setPotentialTip = function() {
			if (this.playerData.potential.value <= 0) {
				this.playerData.potential.tips = "0% .. -5% .. -12% .. -18% .. -24% .. -30% .. -36%";
			} else {
				var minAge = 15;
				var i = this.playerData.age.value - minAge;
				var tip = "MAX";
				for (var j = i; j < potentialList.length; j++) {
					if (potentialList[j] == this.playerData.potential.value) {
						var diff = i - j;
						this.playerData.potential.tips = tip + (diff || "");
						break;
					}
				}
			}
		};
		
		this.savePlayerData = function() {
			this.changed = false;
			console.log(JSON.stringify(this.playerData));
		};

		this.openInputField = function() {
			this.changed = true;
		};

		this.fold = function() {
			this.minimized = true;
		};

		this.unfold = function() {
			this.minimized = false;
		};
	});