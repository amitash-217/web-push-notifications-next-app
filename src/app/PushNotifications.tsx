"use client"
import React, { useEffect } from 'react';

function urlBase64ToUint8Array(base64String : string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

const PushNotifications = () => {
  useEffect(() => {
    const subscribeUser = async () => {
      if ('serviceWorker' in navigator) {
        try {
          // Register service worker
          const register = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
          });

          // Ask for permission
          const permission = await Notification.requestPermission();
          if (permission !== 'granted') {
            alert('Notification permission denied');
            return;
          }

          // Subscribe to push
          const subscription = await register.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_PUBLIC_KEY ?? '')
          });

          // Send subscription to server
          await fetch('http://localhost:3001/subscribe', {
            method: 'POST',
            body: JSON.stringify(subscription),
            headers: {
              'Content-Type': 'application/json'
            }
          });

          console.log('User subscribed to push notifications');
        } catch (err) {
          console.error('Error subscribing to push', err);
        }
      }
    };

    subscribeUser();
  }, []);

  return null; // it's just logic
};

export default PushNotifications;