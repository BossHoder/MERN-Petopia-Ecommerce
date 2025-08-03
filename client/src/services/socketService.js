// ===========================================
// SOCKET.IO CLIENT SERVICE
// ===========================================
// Real-time notification service using Socket.io

import { io } from 'socket.io-client';
import { store } from '../store';
import { receiveNotification } from '../store/actions/notificationActions';

class SocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
    }

    // ===========================================
    // CONNECTION MANAGEMENT
    // ===========================================

    connect() {
        if (this.socket && this.isConnected) {
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            console.warn('No authentication token found. Skipping socket connection.');
            return;
        }

        try {
            this.socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
                auth: {
                    token: token
                },
                transports: ['websocket', 'polling'],
                timeout: 20000,
                reconnection: true,
                reconnectionAttempts: this.maxReconnectAttempts,
                reconnectionDelay: this.reconnectDelay,
                reconnectionDelayMax: 5000,
            });

            this.setupEventListeners();
        } catch (error) {
            console.error('Failed to initialize socket connection:', error);
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            this.reconnectAttempts = 0;
        }
    }

    // ===========================================
    // EVENT LISTENERS
    // ===========================================

    setupEventListeners() {
        if (!this.socket) return;

        // Connection events
        this.socket.on('connect', () => {
            console.log('Socket connected successfully');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            
            // Join user's notification room
            const state = store.getState();
            const userId = state.auth?.user?._id;
            if (userId) {
                this.socket.emit('join-notification-room', userId);
            }
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            this.isConnected = false;
            
            // Attempt to reconnect if disconnection was unexpected
            if (reason === 'io server disconnect') {
                // Server initiated disconnect, don't reconnect automatically
                return;
            }
            
            this.handleReconnection();
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            this.isConnected = false;
            this.handleReconnection();
        });

        // Notification events
        this.socket.on('notification', (notification) => {
            console.log('Real-time notification received:', notification);
            
            // Dispatch to Redux store
            store.dispatch(receiveNotification(notification));
            
            // Show browser notification if permission granted
            this.showBrowserNotification(notification);
        });

        this.socket.on('notification-read', (notificationId) => {
            console.log('Notification marked as read:', notificationId);
            // Could update local state here if needed
        });

        this.socket.on('bulk-notifications', (notifications) => {
            console.log('Bulk notifications received:', notifications);
            
            notifications.forEach(notification => {
                store.dispatch(receiveNotification(notification));
            });
        });

        // Admin events (for admin users)
        this.socket.on('admin-notification-stats', (stats) => {
            console.log('Admin notification stats updated:', stats);
            // Could dispatch to admin reducer if needed
        });
    }

    // ===========================================
    // RECONNECTION HANDLING
    // ===========================================

    handleReconnection() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            return;
        }

        this.reconnectAttempts++;
        const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts), 30000);
        
        console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        
        setTimeout(() => {
            if (!this.isConnected) {
                this.connect();
            }
        }, delay);
    }

    // ===========================================
    // BROWSER NOTIFICATIONS
    // ===========================================

    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            console.warn('This browser does not support notifications');
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        if (Notification.permission === 'denied') {
            return false;
        }

        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    showBrowserNotification(notification) {
        if (!('Notification' in window) || Notification.permission !== 'granted') {
            return;
        }

        const options = {
            body: notification.message,
            icon: '/logo192.png',
            badge: '/logo192.png',
            tag: `notification-${notification._id}`,
            requireInteraction: notification.priority === 'urgent',
            silent: notification.priority === 'low',
            timestamp: new Date(notification.createdAt).getTime(),
        };

        // Add action buttons for important notifications
        if (notification.type === 'order_status' && notification.metadata?.orderId) {
            options.actions = [
                {
                    action: 'view-order',
                    title: 'View Order',
                    icon: '/logo192.png'
                }
            ];
        }

        const browserNotification = new Notification(notification.title, options);

        // Handle notification click
        browserNotification.onclick = () => {
            window.focus();
            
            // Navigate to relevant page based on notification type
            if (notification.type === 'order_status' && notification.metadata?.orderId) {
                window.location.href = `/order/${notification.metadata.orderId}`;
            } else {
                window.location.href = '/notifications';
            }
            
            browserNotification.close();
        };

        // Auto-close after 5 seconds for non-urgent notifications
        if (notification.priority !== 'urgent') {
            setTimeout(() => {
                browserNotification.close();
            }, 5000);
        }
    }

    // ===========================================
    // UTILITY METHODS
    // ===========================================

    emit(event, data) {
        if (this.socket && this.isConnected) {
            this.socket.emit(event, data);
        } else {
            console.warn('Socket not connected. Event not sent:', event);
        }
    }

    on(event, callback) {
        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    off(event, callback) {
        if (this.socket) {
            this.socket.off(event, callback);
        }
    }

    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            reconnectAttempts: this.reconnectAttempts,
            socketId: this.socket?.id || null,
        };
    }

    // ===========================================
    // USER PRESENCE
    // ===========================================

    updateUserPresence(isOnline = true) {
        this.emit('user-presence', {
            isOnline,
            lastSeen: new Date().toISOString(),
        });
    }

    // ===========================================
    // NOTIFICATION ACTIONS
    // ===========================================

    markNotificationAsRead(notificationId) {
        this.emit('mark-notification-read', { notificationId });
    }

    joinNotificationRoom(userId) {
        this.emit('join-notification-room', userId);
    }

    leaveNotificationRoom(userId) {
        this.emit('leave-notification-room', userId);
    }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
