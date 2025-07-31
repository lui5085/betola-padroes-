'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api/client';
import { inviteUserByUsername } from '@/lib/api/leagues';
import { Settings, Save, X, Lock, Unlock, Users, UserPlus, Send } from 'lucide-react';

interface LeagueDetails {
  id: string;
  name: string;
  description: string;
  code: string;
  memberCount: number;
  maxMembers: number;
  isPrivate: boolean;
  isOwner?: boolean;
  userRole?: string;
  createdAt: string | Date;
}

interface LeagueSettingsProps {
  league: LeagueDetails;
  onLeagueUpdated: (updatedLeague: LeagueDetails) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function LeagueSettings({ league, onLeagueUpdated, isOpen, onClose }: LeagueSettingsProps) {
  const [formData, setFormData] = useState({
    name: league.name,
    description: league.description,
    isPrivate: league.isPrivate,
    maxMembers: league.maxMembers
  });
  const [loading, setLoading] = useState(false);
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);

  const handleUpdateLeague = async () => {
    setLoading(true);
    try {
      const response = await apiClient.put(`/leagues/${league.id}`, formData);
      
      const updatedLeague = {
        ...league,
        ...formData
      };
      
      onLeagueUpdated(updatedLeague);
      alert('Liga atualizada com sucesso!');
      onClose();
    } catch (error: any) {
      console.error('Erro ao atualizar liga:', error);
      alert(`Erro ao atualizar liga: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };


  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInviteUser = async () => {
    if (!inviteUsername.trim()) {
      alert('Digite um nome de usuário');
      return;
    }

    setInviteLoading(true);
    try {
      await inviteUserByUsername(league.id, inviteUsername.trim());
      alert(`Convite enviado para ${inviteUsername} com sucesso!`);
      setInviteUsername('');
    } catch (error: any) {
      console.error('Erro ao enviar convite:', error);
      alert(`Erro ao enviar convite: ${error.response?.data?.message || error.message}`);
    } finally {
      setInviteLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configurações da Liga">
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações Gerais
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Liga
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nome da liga"
                maxLength={50}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <Input
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descrição da liga (opcional)"
                maxLength={200}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Máximo de Membros
              </label>
              <Input
                type="number"
                value={formData.maxMembers}
                onChange={(e) => handleInputChange('maxMembers', parseInt(e.target.value) || 2)}
                min={2}
                max={1000}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="flex items-center gap-2">
                  {formData.isPrivate ? (
                    <Lock className="h-4 w-4 text-red-500" />
                  ) : (
                    <Unlock className="h-4 w-4 text-green-500" />
                  )}
                  <span className="font-medium">
                    Liga {formData.isPrivate ? 'Privada' : 'Pública'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {formData.isPrivate 
                    ? 'Apenas usuários convidados podem entrar'
                    : 'Qualquer usuário pode entrar com o código'
                  }
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleInputChange('isPrivate', !formData.isPrivate)}
              >
                {formData.isPrivate ? 'Tornar Pública' : 'Tornar Privada'}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4 border-t pt-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-green-500" />
            Convidar Usuários
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome de Usuário
              </label>
              <div className="flex gap-2">
                <Input
                  value={inviteUsername}
                  onChange={(e) => setInviteUsername(e.target.value)}
                  placeholder="Digite o nome de usuário..."
                  disabled={inviteLoading}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleInviteUser();
                    }
                  }}
                />
                <Button
                  onClick={handleInviteUser}
                  disabled={inviteLoading || !inviteUsername.trim()}
                  size="sm"
                >
                  {inviteLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Digite o nome exato do usuário que você quer convidar
              </p>
            </div>

            {!formData.isPrivate && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Código da Liga</span>
                </div>
                <p className="text-sm text-blue-700">
                  Ou compartilhe o código: <span className="font-mono font-bold">{league.code}</span>
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button
            onClick={handleUpdateLeague}
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Salvando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Salvar Alterações
              </div>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </div>
      </div>
    </Modal>
  );
}