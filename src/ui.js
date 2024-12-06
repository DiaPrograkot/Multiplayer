// Функция для показа уведомлений
export function showNotification(message, containerClass = '.notificationContainer', notificationClass = 'notification') {
    const container = document.querySelector(containerClass);
    if (container) {
      const notification = document.createElement('div');
      notification.className = notificationClass;
      notification.textContent = message;
      container.appendChild(notification);
  
      // Удаляем уведомление через 3 секунды
      setTimeout(() => {
        notification.remove();
      }, 3000);
    }
}

