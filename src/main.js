import { joinRoom, selfId } from 'trystero';

// Конфигурация для инициализации библиотеки
const config = {
  appId: 'your-app-id', // Замените 'your-app-id' на ваш реальный appId
};

// Функция для отображения сообщений на экране и их удаления через 5 секунд
function addMessage(message) {
  const messageBox = document.querySelector('.messages');
  const newMessage = document.createElement('div');
  newMessage.textContent = message;
  messageBox.appendChild(newMessage);

  // Удаляем сообщение через 5 секунд
  setTimeout(() => {
    messageBox.removeChild(newMessage);
  }, 5000);
}

// Проверяем наличие имени в localStorage и запрашиваем, если его нет
let playerName = localStorage.getItem('name');
const playerNameContainer = document.getElementById('playerNameContainer');
const playerInput = document.getElementById('playerInput');

if (!playerName) {
  playerNameContainer.style.display = 'flex';

  // Обрабатываем ввод имени
  playerInput.addEventListener('change', (event) => {
    playerName = event.target.value;
    localStorage.setItem('name', playerName);
  });
}

// Инициализация и присоединение к комнате
const room = joinRoom(config, 'room-id'); // Замените 'room-id' на ваш реальный roomId

// Отправка имени другим игрокам
const [sendName, getName] = room.makeAction('playerName');
const [sendCursor, getCursor] = room.makeAction('playerCursor');
const cursors = {};

// Обработка новых игроков
room.onPeerJoin(peerId => {
  console.log(`${peerId} joined`);
  sendName(playerName); // Отправляем свое имя
  
});

// Обработка выхода игроков
room.onPeerLeave(peerId => {
  const player = players[peerId]; // Находим игрока по peerId
  if (player) {
    console.log(`${player.name} left`); // Показываем имя игрока, который вышел
    addMessage(`${player.name} left the game`); // Показываем сообщение с именем игрока
    removeCursor(peerId); // Удаляем курсор игрока
    delete players[peerId]; // Удаляем игрока из списка
  }
}); 

// Получение имени других игроков
const players = {};

getName((name, peerId) => {
  if (!players[peerId]) {
    players[peerId] = { name }; // Сохраняем имя игрока
    console.log(`${name} joined`); // Показываем имя игрока в консоли
    addMessage(`${name} joined the game`); // Выводим сообщение о входе игрока
    createCursor(peerId, name); // Создаем курсор для нового игрока
  }
});
// Пример использования selfId
console.log(`My information (${playerName}, ${selfId})`);

// Создаем курсор для каждого игрока
function createCursor(peerId, name) {
  const cursor = document.createElement('div');
  cursor.classList.add('cursor');
  cursor.id = `cursor-${peerId}`;

  const nameTag = document.createElement('div');
  nameTag.classList.add('cursor-name');
  nameTag.textContent = name;

  cursor.appendChild(nameTag);
  document.body.appendChild(cursor);
  cursors[peerId] = cursor; // Сохраняем курсор в объект cursors
  console.log(`Creating cursor for ${name} (ID: ${peerId})`);
}




// Обновляем позицию курсора
function updateCursor(peerId, x, y) {
  const cursor = cursors[peerId];
  if (cursor) {
    cursor.style.left = `${x}px`;
    cursor.style.top = `${y}px`;
  }
}

// Отправляем текущие координаты курсора
document.addEventListener('mousemove', (event) => {
  const { clientX: x, clientY: y } = event;
  sendCursor({ x, y });
  updateCursor(selfId, x, y); // Обновляем только свой курсор
});

// Получаем координаты курсоров других игроков
getCursor(({ x, y }, peerId) => {
  updateCursor(peerId, x, y); // Обновляем курсоры других игроков
}); 

// Создаем свой курсор при наличии имени
if (playerName) {
  createCursor(selfId, playerName); // Создаем курсор для текущего игрока
} 
// Удалить этот блок, так как он не нужен
addEventListener('mousemove', ({ clientX, clientY }) => {
  const mouseX = clientX / innerWidth;
  const mouseY = clientY / innerHeight;
  createCursor([mouseX, mouseY], playerName); // Лишнее создание
});



function addCursor(id, isSelf) {
  const el = document.createElement('div')
  const img = document.createElement('img')
  const txt = document.createElement('p')

  el.className = `cursor${isSelf ? ' self' : ''}`
  el.style.left = el.style.top = '-99px'
  img.src = 'img/hand.png'
  txt.innerText = isSelf ? 'you' : id.slice(0, 4)
  el.appendChild(img)
  el.appendChild(txt)

  cursors[id] = el

  if (!isSelf) {
    sendMove([Math.random() * 0.93, Math.random() * 0.93], id)
    updatePeerInfo()
  }


  return el
  
}



