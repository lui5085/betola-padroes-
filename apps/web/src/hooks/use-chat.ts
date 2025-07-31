import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/auth-store';

export interface ChatMessage {
  id: string;
  content: string;
  type: 'TEXT' | 'SYSTEM' | 'BET_SHARE';
  createdAt: string;
  metadata?: any;
  user: {
    id: string;
    username: string;
    profile?: {
      displayName?: string;
      avatarUrl?: string;
    } | null;
  };
}

export interface TypingUser {
  userId: string;
  username: string;
  isTyping: boolean;
}

interface UseChatProps {
  leagueId: string;
  enabled?: boolean;
}

export function useChat({ leagueId, enabled = true }: UseChatProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isJoinedToLeague, setIsJoinedToLeague] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const { token } = useAuthStore();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!enabled || !token || !leagueId) {
      console.log('Chat connection skipped:', { enabled, token: !!token, leagueId });
      return;
    }

    console.log('Initializing chat connection with token:', token?.substring(0, 20) + '...');

    const newSocket = io((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002') + '/chat', {
      auth: {
        token,
      },
      query: {
        token,
      },
    });

    newSocket.on('connect', () => {
      console.log('Connected to chat server');
      setIsConnected(true);
      setError(null);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from chat server');
      setIsConnected(false);
      setIsJoinedToLeague(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setError('Failed to connect to chat');
      setIsConnected(false);
    });

    newSocket.on('joinedLeague', (data: { leagueId: string; messages: ChatMessage[] }) => {
      console.log('Joined league chat:', data.leagueId);
      setIsJoinedToLeague(true);
      setMessages(data.messages);
    });

    newSocket.on('leftLeague', (data: { leagueId: string }) => {
      console.log('Left league chat:', data.leagueId);
      setIsJoinedToLeague(false);
      setMessages([]);
    });

    newSocket.on('newMessage', (message: ChatMessage) => {
      console.log('New message:', message);
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('userJoinedChat', (data: { userId: string; username: string }) => {
      console.log('User joined chat:', data.username);
    });

    newSocket.on('userLeftChat', (data: { userId: string; username: string }) => {
      console.log('User left chat:', data.username);
    });

    newSocket.on('userTyping', (data: { userId: string; username: string; isTyping: boolean }) => {
      setTypingUsers(prev => {
        const filtered = prev.filter(user => user.userId !== data.userId);
        if (data.isTyping) {
          return [...filtered, data];
        }
        return filtered;
      });
    });

    newSocket.on('error', (data: { message: string }) => {
      console.error('Chat error:', data.message);
      setError(data.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [enabled, token, leagueId]);

  useEffect(() => {
    if (socket && isConnected && leagueId && !isJoinedToLeague) {
      console.log('Joining league with delay:', leagueId);
      const timer = setTimeout(() => {
        console.log('Actually joining league:', leagueId);
        socket.emit('joinLeague', { leagueId });
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [socket, isConnected, leagueId, isJoinedToLeague]);

  const sendMessage = useCallback((content: string, type: 'TEXT' | 'BET_SHARE' = 'TEXT') => {
    if (socket && isJoinedToLeague && content.trim()) {
      socket.emit('sendMessage', {
        leagueId,
        content: content.trim(),
        type,
      });
    }
  }, [socket, isJoinedToLeague, leagueId]);

  const sendTyping = useCallback((isTyping: boolean) => {
    if (socket && isJoinedToLeague) {
      socket.emit('typing', {
        leagueId,
        isTyping,
      });
    }
  }, [socket, isJoinedToLeague, leagueId]);

  const handleTyping = useCallback(() => {
    sendTyping(true);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(false);
    }, 2000);
  }, [sendTyping]);

  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    sendTyping(false);
  }, [sendTyping]);

  const leaveLeague = useCallback(() => {
    if (socket && isJoinedToLeague) {
      socket.emit('leaveLeague', { leagueId });
    }
  }, [socket, isJoinedToLeague, leagueId]);


  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    messages,
    isConnected,
    isJoinedToLeague,
    typingUsers,
    error,
    sendMessage,
    handleTyping,
    stopTyping,
    leaveLeague,
  };
}