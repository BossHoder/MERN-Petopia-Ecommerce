// ===========================================
// SOCKET CONTEXT PROVIDER
// ===========================================
// React context for socket service with connection status

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import socketService from '../services/socketService';

// Create context
const SocketContext = createContext({
    socket: null,
    isConnected: false,
    connectionStatus: null,
});

// Socket provider component
export const SocketProvider = ({ children }) => {
    const [connectionStatus, setConnectionStatus] = useState(null);
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    useEffect(() => {
        // Update connection status periodically
        const updateStatus = () => {
            setConnectionStatus(socketService.getConnectionStatus());
        };

        updateStatus(); // Initial update
        const interval = setInterval(updateStatus, 5000); // Update every 5 seconds

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (isAuthenticated && user) {
            socketService.connect();
            socketService.requestNotificationPermission();
        } else {
            socketService.disconnect();
        }
    }, [isAuthenticated, user]);

    const contextValue = {
        socket: socketService.socket,
        isConnected: connectionStatus?.isConnected || false,
        connectionStatus,
        socketService,
    };

    return (
        <SocketContext.Provider value={contextValue}>
            {children}
        </SocketContext.Provider>
    );
};

// Custom hook to use socket context
export const useSocket = () => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export default SocketContext;
