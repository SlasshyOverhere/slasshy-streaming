import { useState, useEffect } from 'react';

interface NotificationConfig {
  text: string;
  icon?: React.ReactNode;
}

export const useNotification = (): NotificationConfig | null => {
  const [notification, setNotification] = useState<NotificationConfig | null>(null);

  useEffect(() => {
    // Get notification text from environment variables
    const activeNotificationIndex = process.env.VITE_ACTIVE_NOTIFICATION || '1';

    let notificationText = '';

    switch(activeNotificationIndex) {
      case '1':
        notificationText = process.env.VITE_NOTIFICATION_1 || '';
        break;
      case '2':
        notificationText = process.env.VITE_NOTIFICATION_2 || '';
        break;
      case '3':
        notificationText = process.env.VITE_NOTIFICATION_3 || '';
        break;
      case '4':
        notificationText = process.env.VITE_NOTIFICATION_4 || '';
        break;
      default:
        notificationText = process.env.VITE_NOTIFICATION_1 || '';
    }

    // Only set notification if it has content
    if (notificationText && notificationText.trim() !== '') {
      setNotification({
        text: notificationText
      });
    } else {
      setNotification(null);
    }
  }, []);

  return notification;
};