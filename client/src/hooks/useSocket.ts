import { useEffect, useCallback, useState } from "react";
import socketService, { SocketEvents } from "../services/socket";

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);

  // Initialiser la connexion au montage du composant
  useEffect(() => {
    socketService.connect();

    const unsubscribeConnect = socketService.on(SocketEvents.CONNECT, () => {
      setIsConnected(true);
    });

    const unsubscribeDisconnect = socketService.on(SocketEvents.DISCONNECT, () => {
      setIsConnected(false);
    });

    return () => {
      unsubscribeConnect();
      unsubscribeDisconnect();
    };
  }, []);

  // Hook pour écouter un événement spécifique
  const useSocketEvent = useCallback(
    <T>(event: SocketEvents, callback: (data: T) => void) => {
      useEffect(() => {
        const unsubscribe = socketService.on<T>(event, callback);
        return () => unsubscribe();
      }, [event, callback]);
    },
    []
  );

  return {
    isConnected,
    socketService,
    useSocketEvent,
  };
}
