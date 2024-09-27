import { joinRoom, selfId } from 'trystero';

// Конфигурация для инициализации библиотеки
const config = {
  appId: 'your-app-id', // Замените 'your-app-id' на ваш реальный appId
};
 
const room = joinRoom(config, 'room-id'); // Замените 'room-id' на ваш реальный roomId 



let playerName = localStorage.getItem('name');
if (!playerName) {
  playerNameContainer.style.display = 'flex';
  playerInput.addEventListener('change', (event) => {
    playerName = event.target.value;
    localStorage.setItem('name', playerName); // Сохраняем имя в localStorage
  });
}



// Отправка и получение данных игрока
const [sendName, getName] = room.makeAction('playerName');


// Создание и отображение сообщений
function addMessage(message) {
  const newMessage = document.createElement('div');
  newMessage.textContent = message;
  messageBox.appendChild(newMessage); 
  setTimeout(() => {
    messageBox.removeChild(newMessage);
  }, 5000);
}

// Логика подключения и отключения игроков
room.onPeerJoin(peerId => {
  console.log(`${peerId} joined`);
  sendName(playerName); // Отправляем свое имя другим игрокам 
});

room.onPeerLeave(peerId => {
  console.log(`${peerId} left`);
  addMessage(`${playerName} left the game`);
  });

getName((name, peerId) => {
  console.log(`${name} joined the game (ID: ${peerId})`);
  addMessage(`${name} joined the game`);
});

// Пример использования selfId
console.log(`My information (${playerName}, ${selfId})`);

