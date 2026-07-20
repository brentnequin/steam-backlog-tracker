// server/api/completionist.get.ts
import prisma from '../lib/prisma'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  if (!user) throw createError({ statusCode: 401 })

  const dbUser = await prisma.user.findUnique({
    where: { steamId: user.steamId }
  })
  if (!dbUser) throw createError({ statusCode: 404 })

  const games = await prisma.userGame.findMany({
    where: {
      userId: dbUser.id,
      status: { not: null },
      achievementTotal: { gt: 0 }, // only games with achievements
    },
    include: { game: true },
    orderBy: { achievementUnlocked: 'desc' }
  })

  return games.map(g => ({
    steamAppId: g.steamAppId,
    title: g.game.title,
    status: g.status,
    achievementTotal: g.achievementTotal,
    achievementUnlocked: g.achievementUnlocked,
    completionPct: Math.round((g.achievementUnlocked / g.achievementTotal) * 100),
  })).sort((a, b) => b.completionPct - a.completionPct)
})