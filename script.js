//Объект модели. Следит за кораблями: где они находятся, попали ли в них и не утонули ли подстреленные корабли.
var model = {
  boardSize: 4,                                         //Эти три свойства помогают обойтись без жестко фиксированных значений: boardSize (размер игрового поля), numShips (количество кораблей в игре) и shipLength (длина корабля в клетках, 3).
  numShips: 2,
  shipLength: 3,
  shipsSunk: 0,                                         //Свойство shipsSunk (инициализируется значением 0 в начале игры) содержит текущее количество кораблей, потопленных игроком.
  ships: [],                                            //Свойство ships содержит массив объектов ship, содержащих массивы locations и hits для каждого из кораблей.
  gameIsStarted: false,
  gameIsFinished: false,

  fire: function (guess) {                               //Метод получает аргумент с координатами выстрела, перебирает все корабли и проверяет, пришлось ли попадание в очередной корабль.
    for (var i = 0; i < this.numShips; i++) {           //Перебираем массив ships, последовательно проверяя каждый корабль.
      var ship = this.ships[i];                         //Здесь мы получаем объект корабля. Необходимо проверить, совпадают ли координаты выстрела с координатами одной из занимаемых им клеток.
      var index = ship.locations.indexOf(guess);        //Получаем массив клеток, занимаемых кораблем. Это свойство корабля, в котором хранится массив. Если координаты клетки присутствуют в массиве locations, значит, выстрел попал в цель. Метод indexOf ищет в массиве указанное значение и возвращает его индекс (или -1, если значение отсутствует в массиве).

      if (ship.hits[index] === "hit") {                 // Улучшение. Проверяем, если судно уже поражено в данной клетке, сообщаем об этом пользователю пользователю, и возвращаем истину.
        view.displayMessage("Oops, you already hit that location!");
        return true;
      } else if (index >= 0) {                          //Если полученный индекс больше либо равен нулю, значит, указанная клетка присутствует в массиве location и выстрел попал в цель.
        ship.hits[index] = "hit";                       //Ставим отметку в массиве hits по тому же индексу.
        view.displayHit(guess);                         //Оповещаем представление о том, что в клетке guess следует вывести маркер попадания.
        view.displayMessage("HIT!");                    //И говорим представлению вывести сообщение “HIT!”.

        if (this.isSunk(ship)) {                        //Добавляем проверку здесь, после того как будем точно знать, что выстрел попал в корабль. Если корабль потоплен, то мы увеличиваем счетчик потопленных кораблей в свойстве shipsSunk модели.
          view.displayMessage("You sank my battleship!");   //Сообщаем игроку, что он потопил корабль!
          this.shipsSunk++;
        }
        return true;                                    //Возвращаем true, потому что выстрел оказался удачным.
      }
    }
    view.displayMiss(guess);                           //Сообщаем представлению, что в клетке guess следует вывести маркер промаха.
    view.displayMessage("You missed.");                //И приказываем представлению вывести сообщение о промахе.
    return false;                                      //Если же после перебора всех кораблей попадание так и не обнаружено, игрок промахнулся, а метод возвращает false
  },

  isSunk: function (ship) {                             //Получает объект корабля и возвращает true, если корабль потоплен, или false, если он еще держится на плаву.
    for (var i = 0; i < this.shipLength; i++) {
      if (ship.hits[i] !== "hit") {                    //Если есть хотя бы одна клетка, в которую еще не попал игрок, то корабль еще жив и метод возвращает false.
        return false;
      }
    }
    return true;                                     //А если нет — корабль потоплен! Метод возвращает true.
  },

  createBoard: function (boardSize) {
    var tableBox = document.getElementById('tableBox');
    var table = document.createElement('table');
    var row;
    var cell;
    var currentId;

    for (var i = 0; i < boardSize; i++) {
      row = document.createElement('tr');
      table.appendChild(row);
      for (var j = 0; j < boardSize; j++) {
        currentId = '' + i + j;
        cell = document.createElement('td');
        cell.setAttribute('id', currentId);
        cell.style.width = 100 / boardSize + '%';
        row.append(cell);
      }
    }
    tableBox.appendChild(table);
  },

  generateShipFrames: function () {                                 //Этот метод в цикле заполняет массив ships заготовками кораблей - пустыми массивами координат и попаданий
    for (var i = 0; i < this.numShips; i++) {                       //Свойство ships содержит массив объектов ship, содержащих массивы locations и hits для каждого из кораблей.
      this.ships.push({locations: [], hits: []});                   //В свойстве locations хранится массив всех клеток, занимаемых кораблем.
    }                                                               //Свойство hits содержит массив с информацией о попаданиях выстрелов в клетки. Изначально элементы массива инициализируются пустой строкой и заменяются строкой “hit" при попадании в соответствующую клетку.
  },                                                                //координаты представляются двумя цифрами (0 = A, 1 = B и т. д.).

  generateShipLocations: function () {                  //Этот метод в цикле создает корабли, пока массив ships модели не будет заполнен достаточным количеством кораблей.
    var locations;
    this.generateShipFrames();
    for (var i = 0; i < this.numShips; i++) {          //Для каждого корабля генерируется набор позиций, то есть занимаемых клеток.
      do {                                             //Цикл do while работает почти так же, как while, за одним исключением: он сначала выполняет команды в теле цикла, а потом проверяет условие.
        locations = this.generateShip();               //Генерируем новый набор позиций...
      } while (this.collision(locations));             //...и проверяем, перекрываются ли эти позиции с существующими кораблями на доске. Если есть перекрытия, нужна еще одна попытка. Новые позиции генерируются, пока не будут найдены варианты без перекрытий.
      this.ships[i].locations = locations;             //Полученные позиции без перекрытий сохраняются в свойстве locations объекта корабля в массиве model.ships.
    }
    console.log("Ships array: ");
    console.log(this.ships);
  },

  generateShip: function () {                           // Этот метод создает массив со случайными позициями корабля, не беспокоясь о возможных перекрытиях.
    var direction = Math.floor(Math.random() * 2);     //При помощи Math.random мы генерируем число от 0 до 1 и умножаем результат на 2, чтобы получить число в диапазоне от 0 до 2 (не включая 2). Затем Math.floor преобразует результат в 0 или 1.
    var row, col;

    if (direction === 1) {                                   //Если значение direction равно 1, создается горизонтальный корабль
      row = Math.floor(Math.random() * this.boardSize);      //Горизонтальный корабль может располагаться в любой строке, но при выборе первого столбца нужно оставить место для двух других клеток...
      col = Math.floor(Math.random() * (this.boardSize - this.shipLength + 1));    //...поэтому мы уменьшаем размер доски (7) на 3, чтобы начальный столбец всегда лежал в диапазоне от 0 до 4 (boardSize является свойством модели).
    } else { // vertical                                                           //Для значения 0 создается вертикальный корабль.
      row = Math.floor(Math.random() * (this.boardSize - this.shipLength + 1));    //Вертикальный корабль должен начинаться в строке 0–4, чтобы осталось место еще для двух клеток...
      col = Math.floor(Math.random() * this.boardSize);                            //...но при этом может располагаться в любом столбце.
    }                                                        //Сначала создается начальная позиция нового корабля (например, строка = 0 и столбец = 3). В зависимости от направления начальная позиция должна создаваться по разным правилам.

    var newShipLocations = [];                               //Набор позиций нового корабля начинается с пустого массива, в который последовательно добавляются элементы.
    for (var i = 0; i < this.shipLength; i++) {              //В цикле до количества позиций в корабле...
      if (direction === 1) {                                 //...при каждой итерации новая позиция добавляется в массив newShipLocations. И снова позиция будет генерироваться разным кодом в зависимости от направления корабля.
        newShipLocations.push(row + "" + (col + i));         //Новая позиция заносится в массив newShipLocations. Данные состоят из строки (начальной, вычисленной выше) и столбца + i. При первой итерации i равно 0, и сумма обозначает начальный столбец. При второй итерации происходит переход к следующему столбцу, а при третьей — к следующему за ним. Так в массиве генерируются серии элементов “01”, “02”, “03”. Круглые скобки гарантируют, что значение i будет прибавлено к col до преобразования результата в строку.
      } else {
        newShipLocations.push((row + i) + "" + col);         //При сложении строки с числом знак «+» выполняет конкатенацию, а не сложение, поэтому результат представляет собой строку. Для вертикального корабля в массиве создается серия вида “31”, “41”, “51”.
      }
    }
    return newShipLocations;                                 //Заполнив массив позициями нового корабля, мы возвращаем его вызывающему методу generateShipLocations.
  },

  collision: function (locations) {                           //Метод collision получает данные корабля и проверяет, перекрывается ли хотя бы одна клетка с клетками других кораблей, уже находящихся на поле. Получает locations — массив позиций нового корабля, который мы собираемся разместить на игровом поле.
    for (var i = 0; i < this.numShips; i++) {                //Для каждого корабля, уже находящегося на поле...
      var ship = this.ships[i];
      for (var j = 0; j < locations.length; j++) {           //...проверить, встречается ли какая-либо из позиций массива locations нового корабля в массиве locations существующих кораблей.
        if (ship.locations.indexOf(locations[j]) >= 0) {     //Метод indexOf проверяет, присутствует ли заданная позиция в массиве. Таким образом, если полученный индекс больше либо равен 0, мы знаем, что клетка уже занята, поэтому метод возвращает true (перекрытие обнаружено).
          return true;                                       //Возврат из цикла, выполняемого в другом цикле, немедленно прерывает оба цикла, функция немедленно завершается и возвращает true.
        }
      }
    }
    return false;                                            //Если выполнение дошло до этой точки, значит, ни одна из позиций не была обнаружена в других массивах, поэтому функция возвращает false (перекрытия отсутствуют).
  }

};

//Объект представления. Здесь обновляются изображения маркеров попаданий и промахов, а также отображаются сообщения для пользователя.
var view = {
  displayMessage: function (msg) {                                //Метод displayMessage получает один аргумент — текст сообщения.
    var messageArea = document.getElementById("messageArea");    //Мы получаем элемент messageArea из страницы...
    messageArea.innerHTML = msg;                                 //..и обновляем текст элемента messageArea, задавая его свойству innerHTML содержимое msg.
  },

  displayHit: function (location) {                               //значение location образуется из строки и столбца и совпадает с идентификатором элемента <td>.
    var cell = document.getElementById(location);                //Идентификатор, созданный по введенным пользователем координатам, используется для получения обновляемого элемента.
    cell.setAttribute("class", "hit");
  },

  displayMiss: function (location) {
    var cell = document.getElementById(location);
    cell.setAttribute("class", "miss");
  },

  updateGuesses: function (guesses) {
    var guessesArea = document.getElementById('guessesCount');
    guessesArea.textContent = guesses;
  }

};

//Объект контроллер. Связывает все вместе, включая получение данных от пользователя и выполнение игровой логики.
var controller = {
  guesses: 0,                                                    //Cвойство guesses(количество выстрелов) которое инициализируется нулем.
  timer: null,

  processGuess: function (guess) {                                //метод получающий координаты в формате “A0".
    var location = parseGuess(guess);
    var hit = model.fire(location);                               //Метод parseGuess используется для проверки введенных данных.

    if (location) {                                              //Если метод не возвращает null, значит, был получен действительный объект location.
      this.guesses++;                                            //Если пользователь ввел правильные координаты, счетчик выстрелов увеличивается на 1. При вводе недействительных координат мы не наказываем игрока и не включаем эту попытку в подсчет.
      view.updateGuesses(this.guesses);

      if (this.guesses === 1) {
        this.timer = setInterval(tick, 10);
      }
                                                                  //Затем комбинация строки и столбца передается методу fire. Напомним, что метод fire возвращает true при попадании в корабль.
      if (hit && model.shipsSunk === model.numShips) {           //Если выстрел попал в цель, а количество потопленных кораблей равно количеству кораблей в игре, выводится сообщение о том, что все корабли потоплены.
        model.gameIsFinished = true;
        clearInterval(this.timer);
        view.displayMessage("You sank all my battleships, in " + this.guesses + " guesses");    //Выводим общее количество выстрелов, которое потребовалось игроку для того, чтобы потопить корабли. Свойство guesses является свойством объекта this, то есть контроллера.
      }
    }
  }
}


// helper function to parse a guess from the user
function parseGuess(guess) {                                          //Здесь данные, введеные пользователем передаются в числовом формате. Данные передаются в параметре guess.
  var alphabet = ["A", "B", "C", "D", "E", "F", "G"];                 //Массив заполняется всеми буквами, которые могут присутствовать в действительных координатах.

  if (guess === null || guess.length !== 2) {                         //Проверяем данные на null и убеждаемся, что в строке два символа.
    alert("Oops, please enter a letter and a number on the board.");
  } else {
    var firstChar = guess.charAt(0);                                  //Извлекаем первый символ строки.
    var row;
    if (isNumeric(firstChar)) {                                       //Если мы произвели клик, то первым символом в переданных координатах будут число(т.к. передается id поля)
      row = parseInt(firstChar);                                      //Если выстрел был по клику, то были переданы сразу цифровые координаты, которые можно распарсить
    } else {
      row = alphabet.indexOf(firstChar);                                    //Если мы ввели координаты с клавиатуры, при помощи метода indexOf получаем цифру в диапазоне от 0 до 6, соответствующую букве.
    }

    var column = guess.charAt(1);                                     //Здесь добавляется код для получения второго символа, представляющего столбец игрового поля.

    if (isNaN(row) || isNaN(column)) {                                //А здесь функция isNaN выявляет строки и столбцы, которыене являются цифрами.
      alert("Oops, that isn't on the board.");
    } else if (row < 0 || row >= model.boardSize ||
      column < 0 || column >= model.boardSize) {             //Здесь применяются преобразования типов. Переменная column содержит строковое значение, и проверяя, что значение находится в диапазоне от 0 до 6, мы полагаемся на преобразование строки в число для выполнения сравнения.
      alert("Oops, that's off the board!");
    } else {
      return row + column;                                            //Строка и столбец объединяются, а результат возвращается методом. Здесь снова задействовано преобразование типа: row — число, а column — строка, поэтому результатом также является строка. В этой точке все проверки пройдены, поэтому метод может вернуть результат.
    }
  }
  return null;                                                        //Если управление передано в эту точку, значит, какая-то проверка не прошла, и метод возвращает null.
}

// Отслеживание нажатий и кликов обработчиками

function handleFireButton() {                                         //Эта функция будет вызываться при каждом нажатии кнопки Fire!.
  var guessInput = document.getElementById("guessInput");             //Получаем ссылку на элемент формы по идентификатору элемента, “guessInput”.
  var guess = guessInput.value.toUpperCase();                         //Затем извлекаем данные, введенные пользователем. Координаты хранятся в свойстве value элемента input.

  controller.processGuess(guess);                                     //Координаты выстрела передаются контроллеру.

  guessInput.value = "";                                              //Команда просто удаляет содержимое элемента input формы, заменяя его пустой строкой. Это делается для того, чтобы не приходилось многократно выделять текст и удалять его перед вводом следующего выстрела.
}

function handleKeyPress(e) {                                          //Вызывается при каждом нажатии клавиши в поле input страницы. Браузер передает объект события обработчику. Объект содержит информацию о том, какая клавиша была нажата.
  var fireButton = document.getElementById("fireButton");
  e = e || window.event;                                              // in IE9 and earlier, the event object doesn't get passed to the event handler correctly, so we use window.event instead.

  if (e.keyCode === 13) {                                             //Если нажата клавиша Enter, то свойство keyCode события равно 13. В таком случае кнопка Fire! должна сработать так, словно игрок щелкнул на ней. Для этого можно вызвать метод click кнопки fireButton (фактически этот вызов имитирует нажатие кнопки).
    fireButton.click();
    return false;                                                     //Возвращаем false, чтобы форма не делала ничего лишнего (например, не пыталась передать данные).
  }
}

function clickOnTheField(event) {
    var target = event.target;
    while (target != this) {
      if (target.tagName == 'TD' && !target.classList.contains('hit') && !target.classList.contains('miss')) {
        controller.processGuess(target.id);
        return;
      }
      target = target.parentNode;
    }
}

function handlerNewGameButton() {
  window.location.reload();
}

//Проверка на число
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function tick() {
  var timer = document.getElementById("timeCountArea");
  var time = timer.innerHTML;
  var arr = time.split(":");
  var m = arr[0];
  var s = arr[1];
	var ms = arr[2];

  ms++;
  if (ms < 10) ms = "0" + ms;
	if (ms == 100) {
		ms = "00";
		s++;
		if (s < 10) s = "0" + s;
	}
  if (s == 60) {
    s = "00";
    m++;
  }
  timer.innerHTML = m+":"+s+":"+ms;
}

window.onload = init;

function init() {
  //Вызовется только после полной загрузки страницы
  var fireButton = document.getElementById("fireButton");             //Получаем ссылку на кнопку Fire! по идентификатору кнопки
  var startNewGameBtn = document.getElementById("startNewGame");
  var guessInput = document.getElementById("guessInput");
  var tableBox = document.getElementById('tableBox');

  startNewGameBtn.onclick = handlerNewGameButton;
  fireButton.onclick = handleFireButton;                              //Кнопке назначаем обработчик события нажатия(клика мышью) — функцию handleFireButton.
  guessInput.onkeypress = handleKeyPress;                             //Добавляем новый обработчик — для обработки событий нажатия клавиш(в частности Enter) в поле ввода HTML.
  model.createBoard(model.boardSize);
  tableBox.onclick = clickOnTheField;
  model.generateShipLocations();                                      //Размещение кораблей на доске. Данный метод вызывается из функции init, чтобы это происходило во время загрузки игры (до ее начала). При таком вызове позиции всех кораблей будут определены к моменту начала игры.
}
