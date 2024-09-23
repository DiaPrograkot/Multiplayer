import { joinRoom, selfId } from 'trystero';

// Конфигурация для инициализации библиотеки
const config = {
  appId: 'your-app-id', // Замените 'your-app-id' на ваш реальный appId
};

// Функция для отображения сообщений на экране и их удаления через 5 секунд
function addMessage(message) {
  const messageBox = document.querySelector('.messages'); // Элемент с классом "messages"
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
if (!playerName) {
  playerNameContainer.style.display = 'flex';
// Обрабатываем ввод имени
  playerInput.addEventListener('change', (event) => {
    playerName = event.target.value;
  localStorage.setItem('name', playerName); // Сохраняем имя в localStorage
  })
}
// Инициализация и присоединение к комнате
const room = joinRoom(config, 'room-id'); // Замените 'room-id' на ваш реальный roomId

// Отправка имени другим игрокам
const [sendName, getName] = room.makeAction('playerName');

// Отправляем имя при подключении
room.onPeerJoin(peerId => {
  console.log(`${peerId} joined`);
  sendName(playerName); // Отправляем свое имя
  });

// Обработка выхода других игроков
room.onPeerLeave(peerId => {
  console.log(`${peerId} left`);
  addMessage(`${playerName} left the game`)
});

// Получение имени других игроков
getName((name, peerId) => {
  console.log(`${name} joined the game (ID: ${peerId})`);
  addMessage(`${name} joined the game)`);
})

// Пример использования selfId
console.log(`My information (${playerName},${selfId})`); 