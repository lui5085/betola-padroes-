import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function seedBettingData() {
  console.log('🌱 Seeding betting data...');

  try {
    // Create teams if they don't exist
    const teams = [
      { name: 'Palmeiras', shortName: 'PAL', externalId: '121' },
      { name: 'Flamengo', shortName: 'FLA', externalId: '127' },
      { name: 'Atlético-MG', shortName: 'CAM', externalId: '1062' },
      { name: 'Fluminense', shortName: 'FLU', externalId: '124' },
      { name: 'Corinthians', shortName: 'COR', externalId: '131' },
      { name: 'Internacional', shortName: 'INT', externalId: '119' },
      { name: 'São Paulo', shortName: 'SPO', externalId: '126' },
      { name: 'Santos', shortName: 'SAN', externalId: '128' },
      { name: 'Fortaleza', shortName: 'FOR', externalId: '154' },
      { name: 'Botafogo', shortName: 'BOT', externalId: '120' },
      { name: 'Red Bull Bragantino', shortName: 'RBB', externalId: '794' },
      { name: 'Grêmio', shortName: 'GRE', externalId: '130' },
      { name: 'Bahia', shortName: 'BAH', externalId: '118' },
      { name: 'Ceará', shortName: 'CEA', externalId: '105' },
      { name: 'Atlético-GO', shortName: 'AGO', externalId: '1035' },
      { name: 'Sport Recife', shortName: 'SPT', externalId: '771' },
      { name: 'Juventude', shortName: 'JUV', externalId: '132' },
      { name: 'Cruzeiro', shortName: 'CRU', externalId: '123' },
      { name: 'Vasco da Gama', shortName: 'VAS', externalId: '129' },
      { name: 'Vitória', shortName: 'VIT', externalId: '2384' }
    ];

    console.log('Creating teams...');
    for (const team of teams) {
      await prisma.team.upsert({
        where: { externalId: team.externalId },
        update: {},
        create: {
          id: randomUUID(),
          ...team,
          logoUrl: `https://media.api-sports.io/football/teams/${team.externalId}.png`
        }
      });
    }

    // Create sample matches for the next 7 days
    const createdTeams = await prisma.team.findMany();
    const now = new Date();
    
    console.log('Creating sample matches...');
    const matchFixtures = [
      { home: 'Palmeiras', away: 'Flamengo', daysFromNow: 1, hour: 16 },
      { home: 'São Paulo', away: 'Corinthians', daysFromNow: 1, hour: 19 },
      { home: 'Atlético-MG', away: 'Cruzeiro', daysFromNow: 2, hour: 21 },
      { home: 'Botafogo', away: 'Fluminense', daysFromNow: 2, hour: 19 },
      { home: 'Internacional', away: 'Grêmio', daysFromNow: 3, hour: 16 },
      { home: 'Fortaleza', away: 'Ceará', daysFromNow: 3, hour: 19 },
      { home: 'Santos', away: 'Red Bull Bragantino', daysFromNow: 4, hour: 20 },
      { home: 'Bahia', away: 'Vitória', daysFromNow: 5, hour: 16 },
      { home: 'Vasco da Gama', away: 'Atlético-GO', daysFromNow: 6, hour: 19 },
      { home: 'Sport Recife', away: 'Juventude', daysFromNow: 7, hour: 16 }
    ];

    for (const fixture of matchFixtures) {
      const homeTeam = createdTeams.find(t => t.name === fixture.home);
      const awayTeam = createdTeams.find(t => t.name === fixture.away);
      
      if (!homeTeam || !awayTeam) continue;

      const kickoffTime = new Date(now);
      kickoffTime.setDate(kickoffTime.getDate() + fixture.daysFromNow);
      kickoffTime.setHours(fixture.hour, 0, 0, 0);

      const match = await prisma.match.create({
        data: {
          id: randomUUID(),
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
          kickoffTime,
          status: 'SCHEDULED',
          round: 1,
          season: '2025'
        }
      });

      // Create markets for each match
      console.log(`Creating markets for ${homeTeam.name} vs ${awayTeam.name}...`);
      
      // Match Winner (1X2)
      await prisma.market.create({
        data: {
          id: randomUUID(),
          matchId: match.id,
          type: 'MATCH_WINNER',
          name: 'Resultado Final',
          options: JSON.stringify([
            { name: 'Home', odds: 2.10 + Math.random() * 0.5, isSuspended: false },
            { name: 'Draw', odds: 3.20 + Math.random() * 0.3, isSuspended: false },
            { name: 'Away', odds: 3.50 + Math.random() * 0.5, isSuspended: false }
          ]),
          isActive: true
        }
      });

      // Both Teams Score
      await prisma.market.create({
        data: {
          id: randomUUID(),
          matchId: match.id,
          type: 'BOTH_TEAMS_SCORE',
          name: 'Ambos Marcam',
          options: JSON.stringify([
            { name: 'Yes', odds: 1.80 + Math.random() * 0.2, isSuspended: false },
            { name: 'No', odds: 1.95 + Math.random() * 0.2, isSuspended: false }
          ]),
          isActive: true
        }
      });

      // Over/Under 2.5 Goals
      await prisma.market.create({
        data: {
          id: randomUUID(),
          matchId: match.id,
          type: 'OVER_UNDER_GOALS',
          name: 'Acima/Abaixo 2.5 Gols',
          options: JSON.stringify([
            { name: 'Over 2.5', odds: 1.85 + Math.random() * 0.3, isSuspended: false },
            { name: 'Under 2.5', odds: 1.90 + Math.random() * 0.3, isSuspended: false }
          ]),
          isActive: true
        }
      });

      // Double Chance
      await prisma.market.create({
        data: {
          id: randomUUID(),
          matchId: match.id,
          type: 'DOUBLE_CHANCE',
          name: 'Dupla Chance',
          options: JSON.stringify([
            { name: 'Home or Draw', odds: 1.30 + Math.random() * 0.2, isSuspended: false },
            { name: 'Away or Draw', odds: 1.45 + Math.random() * 0.2, isSuspended: false },
            { name: 'Home or Away', odds: 1.25 + Math.random() * 0.1, isSuspended: false }
          ]),
          isActive: true
        }
      });
    }

    // Create wallets for existing users
    console.log('Creating wallets for users...');
    const users = await prisma.user.findMany();
    
    for (const user of users) {
      await prisma.wallet.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          id: randomUUID(),
          userId: user.id,
          balance: 100, // Starting balance of R$ 100
          bonusBalance: 50, // Bonus of R$ 50
          currency: 'BRL'
        }
      });
    }

    console.log('✅ Betting data seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding betting data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedBettingData()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });