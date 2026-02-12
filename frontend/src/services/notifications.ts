import { notificationsAPI } from '../services/api';

export const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    return false;
};

export const subscribeToNotifications = async (): Promise<boolean> => {
    try {
        const permission = await requestNotificationPermission();
        if (!permission) {
            return false;
        }

        const registration = await navigator.serviceWorker.ready;
        
        // Subscribe to push notifications
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(
                'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQmuoWU6p8cYfM'
            )
        });

        // Send subscription to backend
        await notificationsAPI.subscribe(subscription);
        
        // Schedule local notifications
        scheduleLocalNotifications();
        
        return true;
    } catch (error) {
        console.error('Failed to subscribe to notifications:', error);
        return false;
    }
};

export const unsubscribeFromNotifications = async (): Promise<boolean> => {
    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
            await subscription.unsubscribe();
            await notificationsAPI.unsubscribe();
        }
        
        return true;
    } catch (error) {
        console.error('Failed to unsubscribe from notifications:', error);
        return false;
    }
};

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

// Schedule local notifications at specific times
const scheduleLocalNotifications = () => {
    const times = [
        { hour: 7, minute: 0, message: '🌅 Good morning! Time to log your breakfast and plan your day!' },
        { hour: 12, minute: 0, message: '🍽️ Lunch time! Don\'t forget to log your meal and stay hydrated!' },
        { hour: 20, minute: 0, message: '💪 Evening check-in! Log your dinner and review your workout progress!' }
    ];

    times.forEach(({ hour, minute, message }) => {
        const now = new Date();
        const scheduledTime = new Date();
        scheduledTime.setHours(hour, minute, 0, 0);

        // If time has passed today, schedule for tomorrow
        if (scheduledTime <= now) {
            scheduledTime.setDate(scheduledTime.getDate() + 1);
        }

        const timeUntilNotification = scheduledTime.getTime() - now.getTime();

        setTimeout(() => {
            if (Notification.permission === 'granted') {
                new Notification('ObeCure Reminder', {
                    body: message,
                    icon: '/logo.svg',
                    badge: '/logo.svg',
                    vibrate: [200, 100, 200],
                    tag: `obecure-${hour}`,
                });
            }
            // Reschedule for next day
            setTimeout(() => scheduleLocalNotifications(), 24 * 60 * 60 * 1000);
        }, timeUntilNotification);
    });
};

export const checkNotificationStatus = (): 'granted' | 'denied' | 'default' => {
    if (!('Notification' in window)) {
        return 'denied';
    }
    return Notification.permission;
};
