"use client";

import { useState } from 'react';
import useSWR from 'swr';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiClient } from '@/lib/api/client';
import { User, Mail, Image, Heart, ArrowLeft, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const fetcher = () => apiClient.getProfile();

const schema = z.object({
  displayName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  bio: z.string().max(500, 'Bio deve ter no máximo 500 caracteres').optional(),
  favoriteTeam: z.string().optional(),
  avatarUrl: z.string().url('URL inválida').optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

export default function ProfileEditForm() {
  const router = useRouter();
  const { data: profile, isLoading, mutate } = useSWR('profile', fetcher);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      displayName: profile?.profile?.displayName ?? '',
      bio: profile?.profile?.bio ?? '',
      favoriteTeam: profile?.profile?.favoriteTeam ?? '',
      avatarUrl: profile?.profile?.avatarUrl ?? '',
    },
  });

  const watchedAvatarUrl = watch('avatarUrl');
  const watchedDisplayName = watch('displayName');

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '??';
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setError('');
      setSuccess(false);

      await apiClient.updateProfile(data);
      
      setSuccess(true);
      mutate();
      
      setTimeout(() => {
        router.push('/profile');
      }, 1500);
    } catch (e: any) {
      setError(e.message || 'Erro inesperado ao salvar perfil');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/profile">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Editar Perfil</h1>
          <p className="text-muted-foreground">Atualize suas informações pessoais</p>
        </div>
      </div>

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Perfil atualizado com sucesso! Redirecionando...
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Foto do Perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 border-4 border-muted">
                <AvatarImage src={watchedAvatarUrl} alt="Preview" />
                <AvatarFallback className="text-lg font-semibold">
                  {getInitials(watchedDisplayName || profile?.user?.username || '')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Label htmlFor="avatarUrl" className="text-sm font-medium">
                  URL da Imagem
                </Label>
                <Input
                  id="avatarUrl"
                  placeholder="https://exemplo.com/sua-foto.jpg"
                  {...register('avatarUrl')}
                  className="mt-1"
                />
                {errors.avatarUrl && (
                  <p className="text-sm text-destructive mt-1">{errors.avatarUrl.message}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Cole a URL de uma imagem para usar como foto do perfil
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="displayName" className="text-sm font-medium">
                Nome de Exibição
              </Label>
              <Input
                id="displayName"
                placeholder="Como você gostaria de ser chamado?"
                {...register('displayName')}
                className="mt-1"
              />
              {errors.displayName && (
                <p className="text-sm text-destructive mt-1">{errors.displayName.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="bio" className="text-sm font-medium">
                Bio
              </Label>
              <Textarea
                id="bio"
                placeholder="Conte um pouco sobre você, seus gostos, experiência com apostas..."
                rows={4}
                {...register('bio')}
                className="mt-1 resize-none"
              />
              {errors.bio && (
                <p className="text-sm text-destructive mt-1">{errors.bio.message}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {watch('bio')?.length || 0}/500 caracteres
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Preferências
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="favoriteTeam" className="text-sm font-medium">
                Time Favorito
              </Label>
              <Input
                id="favoriteTeam"
                placeholder="Qual é o seu time do coração?"
                {...register('favoriteTeam')}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Isso nos ajuda a personalizar sua experiência
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Informações da Conta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Email
              </Label>
              <Input
                value={profile?.user?.email || ''}
                disabled
                className="mt-1 bg-muted"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Username
              </Label>
              <Input
                value={`@${profile?.user?.username || ''}`}
                disabled
                className="mt-1 bg-muted"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Entre em contato com o suporte para alterar email ou username
            </p>
          </CardContent>
        </Card>

        <div className="flex gap-3 pt-4">
          <Link href="/profile" className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              Cancelar
            </Button>
          </Link>
          <Button 
            type="submit" 
            disabled={isSubmitting || !isDirty} 
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
} 