
export function selectRole(role, peerId, message, updateState, sendRoleChoice, showNotification){
    sendRoleChoice({ role, peerId})
    showNotification(message, '.roleNotificationContainer', 'role-notification')
    updateState()
}

// Обработка выбора ролей
export function handleRoleSelection(selfId, gameState, showNotification, sendRoleChoice) {
    const catImage = document.querySelector('.role-cat');
    const asteroidImage = document.querySelector('.role-asteroid');
  
    // Обработка выбора роли "Кот"
    catImage.addEventListener('click', () => {
      if (gameState.roles.cat !== selfId) {
        if (!gameState.roles.cat) {
          // Игрок выбирает роль кота
          selectRole('cat', selfId, 'Вы выбрали кота', () => {
            gameState.roles.cat = selfId
          }, sendRoleChoice, showNotification)
          console.log(`Игрок ${selfId} выбрал роль кота`);
        } else {
          // Роль кота уже занята
          console.warn('Роль кота уже занята');
          showNotification('Роль кота уже занята, выберите другую роль', '.roleNotificationContainer', 'role-notification');
        }
      }
    });
    // Обработка выбора роли "Астероид"
  asteroidImage.addEventListener('click', () => {
    if (gameState.roles.cat === selfId) {
      // Если игрок был котом, но хочет стать астероидом
      console.log('Игрок отказался быть котом и стал астероидом');
      selectRole('asteroid', selfId, 'Вы отказались от роли кота и стали астероидом', () => {
        gameState.roles.cat = null
        gameState.roles[selfId] = 'asteroid'
      }, sendRoleChoice, showNotification)
    }  else if (gameState.roles[selfId] !== 'asteroid') {
      // Игрок становится астероидом (если еще не был астероидом)
      selectRole('asteroid', selfId, 'Вы выбрали роль астероида', () => {
        gameState.roles[selfId] = 'asteroid'
      }, sendRoleChoice, showNotification)
      console.log(`Игрок ${selfId} выбрал роль астероида`);
    }
  });
}

// Обработка получения выбора ролей от других участников
export function handleReceiveRoleChoice(data, gameState, showNotification, peers) {
    const { role, peerId } = data;
    const playerName = peers[peerId]
  
    if (role === 'cat') {
      gameState.roles.cat = peerId;
      console.log(`Игрок ${peerId} выбрал роль кота`);
      showNotification(`Игрок ${playerName} выбрал роль кота`, '.roleNotificationContainer', 'role-notification');
    } else if (role === 'leaveCat') {
      gameState.roles.cat = null;
      console.log(`Игрок ${peerId} отказался от роли кота`);
      showNotification(`Игрок ${playerName} отказался от роли кота. Роль кота теперь свободна`, '.roleNotificationContainer', 'role-notification');
    } else if (role === 'asteroid') {
      gameState.roles[peerId] = 'asteroid';
      console.log(`Игрок ${peerId} выбрал роль астероида`);
      showNotification(`Игрок ${playerName} выбрал роль астероида`, '.roleNotificationContainer', 'role-notification');
    }
}