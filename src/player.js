// для создания курсора
export function createCursor(peerId, name, isSelf = false) {
  const cursorElement = document.createElement("div");
  cursorElement.className = isSelf ? "self-cursor" : "peer-cursor";
  cursorElement.id = isSelf ? "self-cursor" : `cursor-${peerId}`;
  cursorElement.innerHTML = `<div class="cursor-name">${name}</div>`;
  document.body.appendChild(cursorElement);
  return cursorElement;
}

export function createOrRemoveCursor(peerId, action, cursors, peers){
    if(action == 'create'){
      cursors[peerId] = createCursor(peerId, peers[peerId] || 'Unknown')
    } else if (action = 'remove'){
      if(cursors[peerId]){
        cursors[peerId].remove()
        delete cursors[peerId]
      }
      delete peers[peerId]
    }
  }

// Обработка подключения других пользователей
export function handlePeerJoin(peerId, cursors, peers, sendPlayerName) {
    console.log(`Peer joined: ${peerId}`);
    let nameStorage = localStorage.getItem('name');
  
    // Отправляем имя, если уже введено
    if (nameStorage) {
      console.log(`Отправляем имя: ${nameStorage} новому пользователю`);
      sendPlayerName(nameStorage);
    } else {
      console.warn('Имя пользователя отсутствует в localStorage');
    }
  
    // Создаем курсор для нового участника
    createOrRemoveCursor(peerId, 'create', cursors, peers)
  }

// Обработка отключения пользователей
export function handlePeerLeave(peerId, cursors, peers, showNotification) {
    let name = peers[peerId];
    if (name) {
      showNotification(`${name} вышел из игры`);
      console.log(`Пользователь ${peerId} (${name}) вышел`);
    }
    createOrRemoveCursor(peerId, 'remove', cursors, peers)
}
  