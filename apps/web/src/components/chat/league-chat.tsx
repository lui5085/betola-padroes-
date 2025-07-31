'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useChat, ChatMessage } from '@/hooks/use-chat';
import { useAuthStore } from '@/stores/auth-store';
import { 
  MessageCircle, 
  Send, 
  Users, 
  Wifi, 
  WifiOff,
  Clock,
  AlertCircle 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LeagueChatProps {
  leagueId: string;
  className?: string;
}

export function LeagueChat({ leagueId, className = '' }: LeagueChatProps) {
  const [messageInput, setMessageInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useAuthStore();
  
  const {
    messages,
    isConnected,
    isJoinedToLeague,
    typingUsers,
    error,
    sendMessage,
    handleTyping,
    stopTyping,
  } = useChat({ 
    leagueId, 
    enabled: true 
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (messageInput.trim() && isJoinedToLeague) {
      sendMessage(messageInput.trim());
      setMessageInput('');
      stopTyping();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    handleTyping();
  };

  const formatMessageTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: ptBR 
      });
    } catch {
      return 'há pouco';
    }
  };

  const getMessageUserDisplay = (message: ChatMessage) => {
    if (message.type === 'SYSTEM') {
      return 'Sistema';
    }
    return message.user.profile?.displayName || message.user.username;
  };

  const isOwnMessage = (message: ChatMessage) => {
    return message.user.id === user?.id;
  };

  if (!isExpanded) {
    return (
      <Card className={`fixed bottom-4 right-4 w-80 shadow-lg ${className}`}>
        <CardHeader 
          className="cursor-pointer bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg"
          onClick={() => setIsExpanded(true)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageCircle className="h-5 w-5" />
              Chat da Liga
            </CardTitle>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Wifi className="h-4 w-4" />
              ) : (
                <WifiOff className="h-4 w-4" />
              )}
              {messages.length > 0 && (
                <Badge variant="secondary" className="bg-white/20">
                  {messages.length}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={`fixed bottom-4 right-4 w-96 h-[500px] shadow-xl flex flex-col ${className}`}>
      <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="h-5 w-5" />
            Chat da Liga
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {isConnected && isJoinedToLeague ? (
                <Wifi className="h-4 w-4" />
              ) : (
                <WifiOff className="h-4 w-4" />
              )}
              <span className="text-xs">
                {isConnected && isJoinedToLeague ? 'Online' : 'Offline'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 p-1 h-auto"
              onClick={() => setIsExpanded(false)}
            >
              ×
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
        {error && (
          <div className="p-3 bg-red-50 border-b flex items-center gap-2 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {!isJoinedToLeague && (
          <div className="p-4 text-center text-gray-500">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Conectando ao chat...</p>
          </div>
        )}

        {isJoinedToLeague && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma mensagem ainda.</p>
                <p className="text-xs">Seja o primeiro a falar!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage(message) ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-lg px-3 py-2 ${
                      message.type === 'SYSTEM'
                        ? 'bg-blue-100 text-blue-800 mx-auto text-center text-sm'
                        : isOwnMessage(message)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.type !== 'SYSTEM' && !isOwnMessage(message) && (
                      <div className="text-xs font-semibold mb-1 opacity-75">
                        {getMessageUserDisplay(message)}
                      </div>
                    )}
                    <div className="break-words">{message.content}</div>
                    <div 
                      className={`text-xs mt-1 opacity-75 ${
                        message.type === 'SYSTEM' ? 'text-center' : 'text-right'
                      }`}
                    >
                      <Clock className="h-3 w-3 inline mr-1" />
                      {formatMessageTime(message.createdAt)}
                    </div>
                  </div>
                </div>
              ))
            )}

            {typingUsers.length > 0 && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="ml-2">
                      {typingUsers.map(u => u.username).join(', ')} digitando...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {isJoinedToLeague && (
          <div className="border-t p-3">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={messageInput}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                onBlur={stopTyping}
                placeholder="Digite sua mensagem..."
                className="flex-1"
                maxLength={1000}
                disabled={!isConnected || !isJoinedToLeague}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!messageInput.trim() || !isConnected || !isJoinedToLeague}
                className="bg-green-500 hover:bg-green-600"
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {messageInput.length > 900 && (
              <div className="text-xs text-gray-500 mt-1">
                {messageInput.length}/1000 caracteres
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}