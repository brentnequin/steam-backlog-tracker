import prisma from '../../lib/prisma'
import { syncAchievements } from '../../lib/syncAchievements'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  if (!user) throw createError({ statusCode: 401 })

  if (user.steamId !== process.env.NUXT_ADMIN_STEAM_ID) {
    throw createError({ statusCode: 403 })
  }

  const dbUser = await prisma.user.findUnique({
    where: { steamId: user.steamId }
  })
  if (!dbUser) throw createError({ statusCode: 404 })

  // find all backlog games with no achievement data yet
  const games = await prisma.userGame.findMany({
    where: {
      userId: dbUser.id,
      status: { not: null },
      achievementTotal: 0,
    }
  })

  let synced = 0
  for (const game of games) {
    await syncAchievements(user.steamId, dbUser.id, game.steamAppId)
    synced++
  }

  return { synced }
})