'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth-store';
import { apiClient } from '@/lib/api/client';
import { 
  Bell, 
  Clock, 
  Users, 
  Trophy,
  TrendingUp,
  Gift,
  CheckCircle,
  X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Notification {
  id: string;
  type: 'LEAGUE_INVITE' | 'BET_SETTLED' | 'LEAGUE_JOINED' | 'BET_WON' | 'BET_LOST';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await apiClient.get<NotificationsResponse>('/notifications?limit=20');
      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await apiClient.put(`/notifications/${notificationId}/read`);
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'LEAGUE_INVITE':
        return <Users className="h-5 w-5 text-blue-500" />;
      case 'BET_WON':
        return <Trophy className="h-5 w-5 text-green-500" />;
      case 'BET_LOST':
        return <X className="h-5 w-5 text-red-500" />;
      case 'BET_SETTLED':
        return <TrendingUp className="h-5 w-5 text-purple-500" />;
      case 'LEAGUE_JOINED':
        return <Gift className="h-5 w-5 text-orange-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'LEAGUE_INVITE':
        return 'border-l-blue-500';
      case 'BET_WON':
        return 'border-l-green-500';
      case 'BET_LOST':
        return 'border-l-red-500';
      case 'BET_SETTLED':
        return 'border-l-purple-500';
      case 'LEAGUE_JOINED':
        return 'border-l-orange-500';
      default:
        return 'border-l-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Bem-vindo, {user?.username}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Aqui está um resumo das suas atividades recentes.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline" size="sm">
            <CheckCircle className="h-4 w-4 mr-2" />
            Marcar todas como lidas
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações
            </div>
            {unreadCount > 0 && (
              <Badge variant="destructive">
                {unreadCount} {unreadCount === 1 ? 'nova' : 'novas'}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma notificação ainda</p>
              <p className="text-sm text-gray-400">
                Suas notificações aparecerão aqui quando houver atividade.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border-l-4 ${getNotificationColor(notification.type)} ${
                    notification.isRead 
                      ? 'bg-gray-50 border-gray-200' 
                      : 'bg-white border-gray-300 shadow-sm'
                  } transition-all hover:shadow-md cursor-pointer`}
                  onClick={() => !notification.isRead && markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-medium ${
                          notification.isRead ? 'text-gray-700' : 'text-gray-900'
                        }`}>
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                      <p className={`text-sm mt-1 ${
                        notification.isRead ? 'text-gray-500' : 'text-gray-700'
                      }`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">Minhas Apostas</h3>
            <p className="text-sm text-gray-600 mt-1">Ver histórico de apostas</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">Minhas Ligas</h3>
            <p className="text-sm text-gray-600 mt-1">Gerenciar ligas</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">Jogos Hoje</h3>
            <p className="text-sm text-gray-600 mt-1">Ver partidas disponíveis</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}