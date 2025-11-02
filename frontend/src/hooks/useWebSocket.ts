import { useState, useEffect, useCallback, useRef } from 'react';
import type { AnalysisResult } from '../types';

export const useWebSocket = (
  exerciseType: string,
  isActive: boolean
) => {
  const [isConnected, setIsConnected] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (!isActive || wsRef.current) return;

    const wsUrl = `ws://localhost:8000/ws/exercise/${exerciseType}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'analysis') {
          setAnalysisData(data);
        }
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      wsRef.current = null;
    };

    wsRef.current = ws;
  }, [exerciseType, isActive]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const sendFrame = useCallback((frameData: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'frame',
          data: frameData,
        })
      );
    }
  }, []);

  const resetCounter = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'reset',
        })
      );
    }
  }, []);

  useEffect(() => {
    if (isActive) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isActive, connect, disconnect]);

  return {
    isConnected,
    analysisData,
    sendFrame,
    resetCounter,
  };
};
