(function(){
	// Расчёт работоспособности и потенциала игрока по таблице "Рейтинг 16"
	// на основе полученных из неё данных по итоговой работоспособности и потенциала всей команды
	if (!correctPageURL("manager_team_players")) {
		alert("На этой странице скрипт не работает. Перейдите на страницу manager_team_players.");
		return;
	}

	var bgColor = "#7fb3d4";
	var mainTable = document.getElementById("table-2");
	var summaryTable = mainTable.previousElementSibling;
	mainTable.addEventListener("mouseover", overHandler, false);
	mainTable.addEventListener("mouseout", outHandler, false);

	var selectedRow;
	var inputData = addInputElements(summaryTable);
	inputData.totalQuality = getTotalQuality(mainTable);
	inputData.totalPotential = getTotalPotential(mainTable);

	function overHandler(e) {
		if (selectedRow) {
			return;
		}
		var row = e.target;
		while (row !== this) {
			if (row.tagName === "TR") {
				break;
			}
			row = row.parentNode;
		}
		if (row !== this && row.parentNode.tagName === "TBODY") {
			selectedRow = row;
			// устанавливаем новый стиль для ячеек
			fillRowBackground(selectedRow, bgColor);

			var quality = calcQuality(selectedRow);
			var potential = calcPotential(selectedRow);

			// значение не равно undefined только для вычисляемых ячеек,
			// то есть если нет quality или potential, значит, её значение не изменяем
			if (quality !== undefined) {
				// сохраняем значение работоспособности для восстановления
				selectedRow.quality = getQualityValue(selectedRow);
				setQualityValue(selectedRow, quality);
			}
			if (potential !== undefined) {
				// сохраняем значение потенциала для восстановления
				selectedRow.potential = getPotentialValue(selectedRow);
				setPotentialValue(selectedRow, potential);
				setPotentialTip(selectedRow);
			}
		}
	}
	function outHandler(e) {
		if (!selectedRow) {
			return;
		}
		var row = e.relatedTarget;
		if (row) {
			while (row) {
				if (row === selectedRow) {
					return;
				}
				row = row.parentNode;
			}
			// возвращаем исходный стиль
			fillRowBackground(selectedRow, "");
			// возвращаем исходные значения работоспособности и потенциала,
			// если они были изменены
			setQualityValue(selectedRow, selectedRow.quality);
			setPotentialValue(selectedRow, selectedRow.potential);
			selectedRow = null;
		}
	}
	function fillRowBackground(row, color) {
		for (var i = row.children.length - 1; i >= 0; i--) {
			row.children[i].style.backgroundColor = color;
		}
	}
	function calcQuality(row) {
		// значения работоспособности находятся во 2 колонке
		var cell = row.cells[2];
		if (isInvestigated(cell)) {
			return;
		}
		// формула вычисления неизвестного простая:
		// avgQuality * numPlayers - totalQuality
		// avgQuality - среднее значение работоспособности по команде;
		// numPlayers - количество игроков в команде;
		// totalQuality - сумма всех значений работоспособности игроков в команде,
		//                за исключением искомого игрока;
		var avgQuality = parseFloat(inputData.avgQuality.value);
		var numPlayers = mainTable.rows.length - 2;
		var totalQuality = inputData.totalQuality - getQualityValue(row);
		if (isNaN(avgQuality) || isNaN(numPlayers) || isNaN(totalQuality)) {
			return;
		} else {
			return avgQuality * numPlayers - totalQuality;
		}
	}
	function calcPotential(row) {
		// значения потенциала находятся в 3 колонке
		var cell = row.cells[3];
		if (isInvestigated(cell)) {
			return;
		}
		// формула вычисления неизвестного простая:
		// avgPotential * numPlayers - totalPotential
		// avgPotential - среднее значение потенциала по команде;
		// numPlayers - количество игроков в команде;
		// totalPotential - сумма всех значений потенциалов игроков в команде,
		//                  за исключением искомого игрока;
		var avgPotential = parseFloat(inputData.avgPotential.value);
		var numPlayers = mainTable.rows.length - 2;
		var totalPotential = inputData.totalPotential - getPotentialValue(row);
		if (isNaN(avgPotential) || isNaN(numPlayers) || isNaN(totalPotential)) {
			return;
		} else {
			return avgPotential * numPlayers - totalPotential;
		}
	}
	function setPotentialTip(row) {
		var potentialList = [106, 100, 94, 88, 82, 76, 71, 65, 59, 53, 47, 41, 35, 29, 24, 18, 12, 6, 0];
		var potential = alignPotential(getPotentialValue(row));
		var tips = "MAX";
		if (potential <= 0) {
			tips = "0% .. -5% .. -12% .. -18% .. -24% .. -30% .. -36%";
		} else {
			var minAge = 15;
			var i = getAgeValue(row) - minAge;
			for (var j = i; j < potentialList.length; j++) {
				if (potentialList[j] === potential) {
					var diff = i - j;
					if (diff < 0) {
						tips = tips + diff;
					}
					break;
				}
			}
		}

		// значения потенциала находятся в 3 колонке
		var cell = row.cells[3];
		var wrapper = document.createElement("span");
		wrapper.title = tips;
		while (cell.firstChild) {
			wrapper.appendChild(cell.firstChild);
		}
		cell.appendChild(wrapper);

		console.log("TIPS: " + tips);
		return tips;
	}
	function alignPotential(value) {
		var potentialList = [106, 100, 94, 88, 82, 76, 71, 65, 59, 53, 47, 41, 35, 29, 24, 18, 12, 6, 0];
		if (potentialList.indexOf(value) === -1) {
			if (isNaN(parseInt(value)) || value > potentialList[0] || value < 0) {
				throw "ERROR! Incorrect value: " + value;
			}
			for (var i = 0; i < potentialList.length; i++) {
				if (potentialList[i] < value) {
					var a = potentialList[i - 1] - value;
					var b = value - potentialList[i];
					if (a >= b) {
						return potentialList[i];
					} else {
						return potentialList[i - 1];
					}
				}
			}
		} else {
			return value;
		}
	}
	function addInputElements(table) {
		var row = table.rows[0];
		var inputQuality = document.createElement("input");
		inputQuality.id = "inputQuality";
		inputQuality.type = "text";
		inputQuality.style.width = "40px";
		var inputPotential = document.createElement("input");
		inputPotential.id = "inputPotential";
		inputPotential.type = "text";
		inputPotential.style.width = "40px";
		var newCell = document.createElement("th");
		newCell.innerHTML = "Раб:&nbsp;";
		newCell.appendChild(inputQuality);
		row.appendChild(newCell);
		newCell = document.createElement("th");
		newCell.innerHTML = "Пот:&nbsp;";
		newCell.appendChild(inputPotential);
		row.appendChild(newCell);
		return {
			avgQuality: inputQuality,
			avgPotential: inputPotential
		}
	}
	function getTotalQuality(table) {
		// первые 2 строки пропускаем, т.к. это заголовки таблицы thead
		var NUM_THEAD = 2;
		return getTotalValue(table, NUM_THEAD, getQualityValue);
	}
	function getTotalPotential(table) {
		// первые 2 строки пропускаем, т.к. это заголовки таблицы thead
		var NUM_THEAD = 2;
		return getTotalValue(table, NUM_THEAD, getPotentialValue);
	}
	function getTotalValue(table, skippedRows, getValue) {
		var total = 0;
		for (var i = table.rows.length - 1; i >= skippedRows; i--) {
			var value = getValue(table.rows[i]);
			if (isNaN(value)) {
				// если value равно NaN, значит, что-то пошло не так
				return 0;
			} else {
				total += value;
			}
		}
		return total;
	}
	function getAgeValue(row) {
		// значения возраста находятся в 1 колонке
		var CELL_ID = 1;
		return parseInt(row.cells[CELL_ID].innerHTML.match(/(\d+)/)[1]);
	}
	function getQualityValue(row) {
		// значения работоспособности находятся во 2 колонке
		var CELL_ID = 2;
		return parseInt(row.cells[CELL_ID].innerHTML.match(/(\d+)/)[1]);
	}
	function setQualityValue(row, value) {
		if (value !== undefined) {
			console.log("Qua: " + value);

			// значения работоспособности находятся во 2 колонке
			var cell = row.cells[2];
			var textNode = cell.childNodes[1];
			var text = textNode.nodeValue;
			if (text) {
				textNode.nodeValue = text.replace(/\d+/, value);
			}
		}
	}
	function getPotentialValue(row) {
		// значения потенциала находятся в 3 колонке
		var CELL_ID = 3;
		return parseInt(row.cells[CELL_ID].innerHTML.match(/(-?\d+)/)[1]);
	}
	function setPotentialValue(row, value) {
		if (value !== undefined) {
			console.log("Qua: " + value);

			// значения потенциала находятся в 3 колонке
			var cell = row.cells[3];
			if (cell.childNodes.length === 1) {
				// изменённая ячейка
				var wrapper = cell.childNodes[0];
				while (wrapper.firstChild) {
					wrapper.parentNode.appendChild(wrapper.firstChild);
				}
				wrapper.parentNode.removeChild(wrapper);
			}
			var textNode = cell.childNodes[1];
			var text = textNode.nodeValue;
			if (text) {
				textNode.nodeValue = text.replace(/\d+/, value);
			}
		}
	}
	function isInvestigated(cell) {
		// если ячейка содержит картинку target.gif, значит, в ней содержится точно значение,
		// в этом случае его не нужно вычислять заново
		return cell.innerHTML.indexOf("target.gif") !== -1;
	}
	function correctPageURL(searchString) {
		return location.href.indexOf(searchString) !== -1;
	}
})();