import { useState, useEffect, useRef } from 'react';
import { WSMessage } from '../types';

export function useWebSocket(taskId: string | null) {
  const [messages, setMessages] = useState<WSMessage[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!taskId) {
      setIsConnected(false);
      return;
    }

    const apiUrl = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:8000';
    const wsBase = apiUrl.replace(/^http/, 'ws');
    const wsUrl = `${wsBase}/ws/${taskId}`;
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const parsed: WSMessage = JSON.parse(event.data);
        setMessages((prev) => [...prev, parsed]);
      } catch (e) {
        console.error('Failed to parse WS message:', e);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
      setIsConnected(false);
    };

    return () => {
      ws.close();
      socketRef.current = null;
    };
  }, [taskId]);

  return { messages, isConnected };
}
