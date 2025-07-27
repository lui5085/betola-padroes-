'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { getUserLeagues, createLeague, joinLeague, type League } from '@/lib/api/leagues';
import { Plus, Users, Trophy, Code, Crown, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const { toast } = useToast();
  
  // Create league form
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    maxMembers: 100,
    isPrivate: false
  });
  
  // Join league form
  const [joinCode, setJoinCode] = useState('');
  
  useEffect(() => {
    loadLeagues();
  }, []);
  
  const loadLeagues = async () => {
    try {
      const data = await getUserLeagues();
      setLeagues(data);
    } catch (error) {
      toast({
        title: 'Erro ao carregar ligas',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateLeague = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createForm.name.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Por favor, insira um nome para a liga.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      const newLeague = await createLeague({
        name: createForm.name,
        description: createForm.description || undefined,
        maxMembers: createForm.maxMembers,
        isPrivate: createForm.isPrivate
      });
      
      setLeagues(prev => [newLeague, ...prev]);
      setCreateModalOpen(false);
      setCreateForm({ name: '', description: '', maxMembers: 100, isPrivate: false });
      
      toast({
        title: 'Liga criada!',
        description: `Liga "${newLeague.name}" criada com sucesso. Código: ${newLeague.code}`,
      });
    } catch (error) {
      toast({
        title: 'Erro ao criar liga',
        description: error.message,
        variant: 'destructive'
      });
    }
  };
  
  const handleJoinLeague = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!joinCode.trim()) {
      toast({
        title: 'Código obrigatório',
        description: 'Por favor, insira o código da liga.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      const result = await joinLeague({ code: joinCode.toUpperCase() });
      
      // Reload leagues to get updated list
      await loadLeagues();
      
      setJoinModalOpen(false);
      setJoinCode('');
      
      toast({
        title: 'Liga entrou!',
        description: `Você entrou na liga "${result.league.name}" com sucesso.`,
      });
    } catch (error) {
      toast({
        title: 'Erro ao entrar na liga',
        description: error.message,
        variant: 'destructive'
      });
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
              <div className="h-40 bg-muted rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Minhas Ligas</h1>
          <p className="text-muted-foreground mt-2">
            Compete com seus amigos e mostre suas habilidades de apostador!
          </p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={joinModalOpen} onOpenChange={setJoinModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Code className="h-4 w-4 mr-2" />
                Entrar na Liga
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Entrar em uma Liga</DialogTitle>
              </DialogHeader>
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
                  <p className="text-sm text-muted-foreground mt-1">
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
            </DialogContent>
          </Dialog>
          
          <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Liga
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Nova Liga</DialogTitle>
              </DialogHeader>
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
                  <Switch
                    id="isPrivate"
                    checked={createForm.isPrivate}
                    onCheckedChange={(checked) => setCreateForm(prev => ({ ...prev, isPrivate: checked }))}
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
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {leagues.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma liga encontrada</h3>
            <p className="text-muted-foreground mb-6">
              Crie uma nova liga ou entre em uma existente para começar a competir!
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => setCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Liga
              </Button>
              <Button variant="outline" onClick={() => setJoinModalOpen(true)}>
                <Code className="h-4 w-4 mr-2" />
                Entrar na Liga
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {leagues.map((league) => (
            <Card key={league.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{league.name}</CardTitle>
                    {league.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {league.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    {getRoleIcon(league.userRole, league.isOwner)}
                    <span className="text-xs font-medium">
                      {getRoleText(league.userRole, league.isOwner)}
                    </span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Código:</span>
                  <Badge variant="secondary" className="font-mono">
                    {league.code}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Membros:</span>
                  <span className="font-medium">
                    {league.memberCount}/{league.maxMembers}
                  </span>
                </div>
                
                {league.userPosition && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Sua Posição:</span>
                    <Badge variant={league.userPosition <= 3 ? "default" : "outline"}>
                      #{league.userPosition}
                    </Badge>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Seus Pontos:</span>
                  <span className="font-mono font-semibold">
                    {league.userPoints?.toLocaleString() || 0}
                  </span>
                </div>
                
                <div className="pt-4">
                  <Link href={`/leagues/${league.id}`}>
                    <Button className="w-full">
                      Ver Liga
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}