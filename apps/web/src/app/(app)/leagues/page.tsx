'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Modal } from '@/components/ui/modal';
import { getUserLeagues, createLeague, joinLeague, type League } from '@/lib/api/leagues';
import { Plus, Users, Trophy, Code, Crown, Shield } from 'lucide-react';

export default function LeaguesPage() {
  const router = useRouter();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    imageUrl: '',
    maxMembers: 100,
    isPrivate: false
  });
  
  const [joinCode, setJoinCode] = useState('');
  
  useEffect(() => {
    loadLeagues();
  }, []);
  
  const loadLeagues = async () => {
    try {
      const data = await getUserLeagues();
      setLeagues(data);
    } catch (error: any) {
      console.error('Erro ao carregar ligas:', error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateLeague = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createForm.name.trim()) {
      alert('Por favor, insira um nome para a liga.');
      return;
    }
    
    try {
      const newLeague = await createLeague({
        name: createForm.name,
        description: createForm.description || undefined,
        imageUrl: createForm.imageUrl || undefined,
        maxMembers: createForm.maxMembers,
        isPrivate: createForm.isPrivate
      });
      
      setLeagues(prev => [newLeague, ...prev]);
      setCreateModalOpen(false);
      setCreateForm({ name: '', description: '', imageUrl: '', maxMembers: 100, isPrivate: false });
      
      alert(`Liga "${newLeague.name}" criada com sucesso!`);
    } catch (error: any) {
      alert(`Erro ao criar liga: ${error.message}`);
    }
  };
  
  const handleJoinLeague = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!joinCode.trim()) {
      alert('Por favor, insira o código da liga.');
      return;
    }
    
    try {
      const result = await joinLeague({ code: joinCode.toUpperCase() });
      
      await loadLeagues();
      
      setJoinModalOpen(false);
      setJoinCode('');
      
      alert(`Você entrou na liga "${result.league.name}" com sucesso!`);
    } catch (error: any) {
      alert(`Erro ao entrar na liga: ${error.message}`);
    }
  };
  
  const getRoleIcon = (role?: string, isOwner?: boolean) => {
    if (isOwner) return <Crown className="h-4 w-4 text-yellow-500" />;
    if (role === 'ADMIN') return <Shield className="h-4 w-4 text-blue-500" />;
    return <Users className="h-4 w-4 text-gray-500" />;
  };
  
  const getRoleText = (role?: string, isOwner?: boolean) => {
    if (isOwner) return 'Dono';
    if (role === 'ADMIN') return 'Admin';
    return 'Membro';
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-40 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <img
              src="/logo.svg"
              alt="Logo Betola"
              className="h-12 w-auto"
            />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
              Minhas Ligas
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Compete com seus amigos em ligas privadas e mostre suas habilidades de apostador! 
            Crie sua própria liga ou entre em uma existente usando o código de convite.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button 
              size="lg"
              onClick={() => setCreateModalOpen(true)}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-5 w-5 mr-2" />
              Criar Nova Liga
            </Button>
            
            <Button 
              size="lg"
              variant="outline"
              onClick={() => setJoinModalOpen(true)}
              className="border-2 border-green-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200"
            >
              <Code className="h-5 w-5 mr-2" />
              Entrar com Código
            </Button>
          </div>
        </div>
      
        {leagues.length === 0 ? (
          <Card className="text-center py-16 border-2 border-dashed border-gray-200 bg-white/50 backdrop-blur-sm">
            <CardContent>
              <div className="space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-2xl"></div>
                  <Trophy className="relative mx-auto h-16 w-16 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-3 text-gray-800">Suas ligas aparecerão aqui</h3>
                  <p className="text-gray-600 text-lg max-w-md mx-auto">
                    Comece criando sua primeira liga ou use um código para entrar em uma liga existente.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                  <Button 
                    onClick={() => setCreateModalOpen(true)}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeira Liga
                  </Button>
                  <Button variant="outline" onClick={() => setJoinModalOpen(true)}>
                    <Code className="h-4 w-4 mr-2" />
                    Entrar com Código
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {leagues.map((league) => (
            <Card 
              key={league.id} 
              className="group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-white/70 backdrop-blur-sm border-0 shadow-lg overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <CardHeader className="relative">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {league.name}
                      </CardTitle>
                      {league.isPrivate && (
                        <Badge variant="secondary" className="text-xs">
                          Privada
                        </Badge>
                      )}
                    </div>
                    {league.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                        {league.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <div className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1">
                      {getRoleIcon(league.userRole, league.isOwner)}
                      <span className="text-xs font-medium text-gray-700">
                        {getRoleText(league.userRole, league.isOwner)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4 relative">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-800 font-mono">
                      {league.code}
                    </div>
                    <div className="text-xs text-gray-600 font-medium">CÓDIGO</div>
                  </div>
                  
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-800">
                      {league.memberCount}/{league.maxMembers}
                    </div>
                    <div className="text-xs text-gray-600 font-medium">MEMBROS</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <div className="text-center flex-1">
                    {league.userPosition ? (
                      <div>
                        <Badge 
                          variant={league.userPosition <= 3 ? "default" : "outline"}
                          className="text-sm font-bold"
                        >
                          #{league.userPosition}
                        </Badge>
                        <div className="text-xs text-gray-600 mt-1">POSIÇÃO</div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">Sem ranking</div>
                    )}
                  </div>
                  
                  <div className="text-center flex-1 border-l border-gray-200 pl-4">
                    <div className="text-lg font-bold text-gray-800 font-mono">
                      {league.userPoints?.toLocaleString() || 0}
                    </div>
                    <div className="text-xs text-gray-600">PONTOS</div>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={() => router.push(`/leagues/${league.id}`)}
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Ver Liga
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        )}

      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Criar Nova Liga"
      >
        <form onSubmit={handleCreateLeague} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome da Liga *</Label>
            <Input
              id="name"
              value={createForm.name}
              onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Amigos do Futebol"
              maxLength={100}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={createForm.description}
              onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva sua liga..."
              maxLength={500}
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="maxMembers">Máximo de Membros</Label>
            <Input
              id="maxMembers"
              type="number"
              value={createForm.maxMembers}
              onChange={(e) => setCreateForm(prev => ({ ...prev, maxMembers: Number(e.target.value) }))}
              min={2}
              max={500}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              id="isPrivate"
              type="checkbox"
              checked={createForm.isPrivate}
              onChange={(e) => setCreateForm(prev => ({ ...prev, isPrivate: e.target.checked }))}
            />
            <Label htmlFor="isPrivate">Liga Privada</Label>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Criar Liga
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setCreateModalOpen(false)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        title="Entrar em uma Liga"
      >
        <form onSubmit={handleJoinLeague} className="space-y-4">
          <div>
            <Label htmlFor="joinCode">Código da Liga</Label>
            <Input
              id="joinCode"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Ex: ABC123"
              maxLength={6}
              className="font-mono"
            />
            <p className="text-sm text-gray-600 mt-1">
              Digite o código de 6 caracteres da liga
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              Entrar na Liga
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setJoinModalOpen(false)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>
      </div>
    </div>
  );
}