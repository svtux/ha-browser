/**
 * Processor
 *
 * Предполагаемый домен: ha-browser.ru
 */

angular.module("haBrowser")
	.controller("PlayersController", function(DataStore, $locale) {
		var defaultData = {
			"name": {title: "", value: "Player Name", id: 0, rex: "(.*),\\sID\\s(\\d+)"},
			"skillsSum": {title: "Сумма умений", value: 1, rex: "(Сумма\\sумений)\\s(\\d+)"},
			"relativeSkillsSum": {title: "Отн. СУ", value: 0, id: 0, rex: "(Отн\\.\\sСУ)\\s(\\d+)"},
			"age": {title: "Возр.", value: 17, rex: "(Возр.)\\s(\\d+)"},
			"country": {title: "Страна", value: "", code: "", rex: "(Страна)\\s+(.+)$"},
			"contract": {title: "Контракт", value: 0, rex: "(Контракт)\\s(\\d+)"},
			"team": {title: "Команда", value: "", id: 0, rex: "(Команда)\\s(.+)$"},
			"injury": {title: "Травма (дни)", value: "Здоров", rex: "(Травма\\s\\(дни\\))\\s+(\\d+|[^\\s]+)"},
			"quality": {title: "Работоспособность", rex: "(Работоспособность)\\s+(\\d+)", value: 0, investigated: false, unknown: false},
			"salary": {title: "Зарплата", value: 0, rex: "(Зарплата)\\s+(\\d+\\s\\d+)"},
			"potential": {title: "Потенциал", rex: "(Потенциал)\\s+(\\d+)", value: 0, investigated: false, unknown: false, tips: ""},
			"satisfaction": {title: "Удовлетворенность", rex: "(Удовлетворенность)\\s+(\\d+)", value: 0},
			"loyalty": {title: "Лояльность", rex: "(Лояльность)\\s+.+([+-]\\d+)$", value: "", unknown: false},
			"goalieWeakSpot": {title: "Слабое место", rex: "", value: "Нет", unknown: false},
			"star": {title: "Звезда", rex: "(Звезда)\\s+(\\d+)", value: "", number: 0, unknown: false},
			"relativeSkillsSumLeague": {title: "Отн. СУ (лига)", rex: "(Отн\\.\\sСУ\\s\\(лига\\))\\s(\\d+)", value: 0},
			"cost": {title: "Затраты", rex: "", value: "?"},
			"attributes": {title: "Параметры", rex: ""},
			"goalie": {title: "Вратарь", rex: "(Вратарь)\\s(\\d+\\s\\(\\d+%\\))", value: "0 (0%)"},
			"speed": {title: "Скорость", rex: "(Скорость)\\s(\\d+\\s\\(\\d+%\\))", value: "0 (0%)"},
			"defense": {title: "Защита", rex: "(Защита)\\s(\\d+\\s\\(\\d+%\\))", value: "0 (0%)"},
			"strength": {title: "Сила", rex: "(Сила)\\s(\\d+\\s\\(\\d+%\\))", value: "0 (0%)"},
			"offense": {title: "Нападение", rex: "(Нападение)\\s(\\d+\\s\\(\\d+%\\))", value: "0 (0%)"},
			"selfControl": {title: "Самообладание", rex: "(Самообладание)\\s(\\d+\\s\\(\\d+%\\))", value: "0 (0%)"},
			"shooting": {title: "Бросок", rex: "(Бросок)\\s(\\d+\\s\\(\\d+%\\))", value: "0 (0%)"},
			"form": {title: "Форма", rex: "(Форма)\\s(\\d+\\s\\([+-]?\\d+\\))", value: "0 (0)"},
			"passing": {title: "Пас", rex: "(Пас)\\s(\\d+\\s\\(\\d+%\\))", value: "0 (0%)"},
			"experience": {title: "Опыт", rex: "(Опыт)\\s(\\d+\\s\\(\\d+%\\))", value: "0 (0%)"},
			"energy": {title: "Энергия", rex: "(Энергия)\\s+(\\d+)", value: 0},
			"training": {title: "Тренировки", rex: "(Тренировки)\\s+(\\d+)", value: 0},
			"trainingSchedule": {title: "Тренировочное расписание", rex: ""},
			"statistics": {title: "Статистика", rex: ""},
			"goals": {title: "Голы", rex: "(Голы)\\s+(\\d+)", value: 0},
			"assists": {title: "Передачи", rex: "(Передачи)\\s+(\\d+)", value: 0},
			"shots": {title: "Броски", rex: "(Броски)\\s+(\\d+)", value: 0},
			"games": {title: "Матчи", rex: "(Матчи)\\s+(\\d+)", value: 0},
			"shootingPercentage": {title: "Результативность бросков", rex: "(Результативность\\sбросков)\\s+(\\d+\\.\\d+)", value: 0},
			"timeOnIce": {title: "Время на льду (минуты)", rex: "(Время\\sна\\sльду\\s\\(минуты\\))\\s+(\\d+)", value: 0},
			"penalties": {title: "Штрафные минуты", rex: "(Штрафные\\sминуты)\\s+(\\d+)", value: 0},
			"plus_minus": {title: "+/-", rex: "(\\+\\/-)\\s+(-?\\d+)", value: 0},
			"rating": {title: "Оценка", rex: "(Оценка)\\s+(\\d+\\.\\d+)", value: "0.0"},
			"weeksInTeam": {title: "Недель в команде (дней)", rex: "(Недель\\sв\\sкоманде\\s\\(дней\\))\\s+(\\d+\\s\\(\\d+\\))", value: "0 (0)"}
		};
		var potentialList = [106, 100, 94, 88, 82, 76, 71, 65, 59, 53, 47, 41, 35, 29, 24, 18, 12, 6, 0];

		this.lang = $locale.id;
		this.inputData = "";
		this.playerData = angular.copy(defaultData);

		this.minimized = true;
		this.changed = false;

		this.parseInputData = function() {
			this.playerData = angular.copy(defaultData);

			for (var key in defaultData) {
				var rex = new RegExp(defaultData[key].rex, "m");
				var itemData = this.inputData.match(rex);
				if (itemData && itemData.length) {
					if (key == "name") {
						this.playerData[key].value = itemData[1];
						this.playerData[key].id = itemData[2];
					} else {
						this.playerData[key].title = itemData[1];
						this.playerData[key].value = itemData[2];
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