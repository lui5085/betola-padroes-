// prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create test user
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'test@betola.com' },
    update: {},
    create: {
      email: 'test@betola.com',
      username: 'testuser',
      passwordHash: hashedPassword,
      isEmailVerified: true,
      profile: {
        create: {
          displayName: 'Test User',
          bio: 'Apostador profissional'
        }
      },
      wallet: {
        create: {
          balance: 1000,
          totalWon: 0,
          totalLost: 0
        }
      }
    }
  });

  console.log('✅ Created test user:', user.email);

  // Create admin user
  const adminPassword = await bcrypt.hash('admin', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {},
    create: {
      email: 'admin@gmail.com',
      username: 'admin',
      passwordHash: adminPassword,
      isEmailVerified: true,
      isAdmin: true,
      profile: {
        create: {
          displayName: 'Administrator',
          bio: 'Administrador do sistema'
        }
      },
      wallet: {
        create: {
          balance: 10000,
          totalWon: 0,
          totalLost: 0
        }
      }
    }
  });

  console.log('✅ Created admin user:', admin.email);

  // Create teams
  const teams = [
    { name: 'Flamengo', shortName: 'FLA', externalId: 'flamengo' },
    { name: 'Palmeiras', shortName: 'PAL', externalId: 'palmeiras' },
    { name: 'Santos', shortName: 'SAN', externalId: 'santos' },
    { name: 'São Paulo', shortName: 'SPO', externalId: 'sao-paulo' },
    { name: 'Corinthians', shortName: 'COR', externalId: 'corinthians' },
    { name: 'Internacional', shortName: 'INT', externalId: 'internacional' },
    { name: 'Grêmio', shortName: 'GRE', externalId: 'gremio' },
    { name: 'Atlético-MG', shortName: 'CAM', externalId: 'atletico-mg' },
    { name: 'Botafogo', shortName: 'BOT', externalId: 'botafogo' },
    { name: 'Fluminense', shortName: 'FLU', externalId: 'fluminense' },
  ];

  for (const team of teams) {
    await prisma.team.upsert({
      where: { externalId: team.externalId },
      update: {},
      create: team
    });
  }

  console.log('✅ Created teams');

  // Get all teams
  const allTeams = await prisma.team.findMany();

  // Create matches for the next 7 days
  const now = new Date();
  const matches = [];
  
  for (let i = 0; i < 10; i++) {
    const kickoffTime = new Date(now);
    kickoffTime.setDate(kickoffTime.getDate() + Math.floor(i / 2));
    kickoffTime.setHours(16 + (i % 2) * 3, 0, 0, 0);
    
    const homeIndex = i % allTeams.length;
    const awayIndex = (i + 5) % allTeams.length;
    
    const match = await prisma.match.create({
      data: {
        homeTeamId: allTeams[homeIndex].id,
        awayTeamId: allTeams[awayIndex].id,
        kickoffTime,
        status: 'SCHEDULED',
        round: Math.floor(i / 5) + 1,
        season: '2025',
        externalId: `match-${i}`
      }
    });
    
    matches.push(match);
    
    // Create markets for each match
    const marketTypes = [
      {
        type: 'MATCH_WINNER',
        name: 'Resultado Final',
        options: [
          { name: allTeams[homeIndex].name, odds: 2.10, isSuspended: false },
          { name: 'Empate', odds: 3.20, isSuspended: false },
          { name: allTeams[awayIndex].name, odds: 3.50, isSuspended: false }
        ]
      },
      {
        type: 'BOTH_TEAMS_SCORE',
        name: 'Ambos Marcam',
        options: [
          { name: 'Sim', odds: 1.85, isSuspended: false },
          { name: 'Não', odds: 1.95, isSuspended: false }
        ]
      },
      {
        type: 'OVER_UNDER_GOALS',
        name: 'Acima/Abaixo 2.5 Gols',
        options: [
          { name: 'Acima 2.5', odds: 2.00, isSuspended: false },
          { name: 'Abaixo 2.5', odds: 1.80, isSuspended: false }
        ]
      },
      {
        type: 'DOUBLE_CHANCE',
        name: 'Dupla Chance',
        options: [
          { name: `${allTeams[homeIndex].name} ou Empate`, odds: 1.35, isSuspended: false },
          { name: `${allTeams[awayIndex].name} ou Empate`, odds: 1.60, isSuspended: false },
          { name: `${allTeams[homeIndex].name} ou ${allTeams[awayIndex].name}`, odds: 1.25, isSuspended: false }
        ]
      }
    ];
    
    for (const marketData of marketTypes) {
      await prisma.market.create({
        data: {
          matchId: match.id,
          type: marketData.type,
          name: marketData.name,
          options: JSON.stringify(marketData.options),
          isActive: true
        }
      });
    }
  }

  console.log('✅ Created matches and markets');

  // Create some finished matches for testing bet settlement
  const finishedMatch = await prisma.match.create({
    data: {
      homeTeamId: allTeams[0].id,
      awayTeamId: allTeams[1].id,
      kickoffTime: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      status: 'FINISHED',
      homeScore: 2,
      awayScore: 1,
      round: 1,
      season: '2025',
      externalId: 'finished-match-1'
    }
  });

  // Create markets for finished match
  await prisma.market.create({
    data: {
      matchId: finishedMatch.id,
      type: 'MATCH_WINNER',
      name: 'Resultado Final',
      options: JSON.stringify([
        { name: allTeams[0].name, odds: 1.90, isSuspended: false },
        { name: 'Empate', odds: 3.40, isSuspended: false },
        { name: allTeams[1].name, odds: 4.00, isSuspended: false }
      ]),
      isActive: false
    }
  });

  console.log('✅ Created finished match for testing');

  // Create sample league
  const league = await prisma.league.create({
    data: {
      name: 'Liga dos Campeões',
      description: 'Liga principal do Betola',
      code: 'BETOLA2025',
      isPrivate: false,
      createdById: user.id,
      members: {
        create: {
          userId: user.id,
          role: 'ADMIN',
          score: 0
        }
      }
    }
  });

  console.log('✅ Created sample league');

  console.log('🌱 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });