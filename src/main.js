import { joinRoom, selfId } from 'trystero';
// Конфигурация для инициализации библиотеки
const config = {
  appId: 'your-app-id', // Замените 'your-app-id' на ваш реальный appId
};
// Инициализация и присоединение к комнате
const room = joinRoom(config, 'room-id'); // Замените 'room-id' на ваш реальный roomId
// Получаем имя игрока из localStorage
let playerName = localStorage.getItem('name'); 

// Если имени нет, используем selfId как fallback
if (!playerName) {
  playerName = `Player ${selfId.substring(0, 4)}`;
  localStorage.setItem('name', playerName);
}
// Отправка имени другим игрокам
const [sendName, getName] = room.makeAction('playerName');  
// Отправляем имя при подключении
room.onPeerJoin(peerId => {
  console.log(`${peerId} joined`);
  sendName(playerName); // Отправляем свое имя
  displayMessage(message);
});


room.onPeerLeave(peerId => {
  console.log(`${peerId} left`)
  displayMessage(message);
});

// Получение имени других игроков
getName((name, peerId) => {
  console.log(`${name} joined the game (ID: ${peerId})`);
  displayMessage(message);
});
// Пример использования selfId
console.log(`My peer ID is ${selfId}, my name is ${playerName}`);

// Функция для отображения сообщений на экране
const displayMessage = (message) => {
  const messageContainer = document.querySelector('.messageContainer');
  const messageElement = document.createElement('p');
  messageElement.textContent = message;
  messageContainer.appendChild(messageElement);

  // Опционально: через время удалять сообщения, чтобы не перегружать экран
  setTimeout(() => {
    messageElement.remove();
  }, 5000); // Удаление через 5 секунд
};