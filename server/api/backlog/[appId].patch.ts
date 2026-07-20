// server/api/backlog/[appId].patch.ts
import prisma from '../../lib/prisma'
import { syncAchievements } from '../../lib/syncAchievements'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  if (!user) throw createError({ statusCode: 401 })

  const appId = parseInt(getRouterParam(event, 'appId') ?? '')
  if (isNaN(appId)) throw createError({ statusCode: 400 })

  const body = await readBody(event)
  const { status } = body

  const validStatuses = ['not_started', 'playing', 'completed', 'dropped', 'on_hold']
  if (!validStatuses.includes(status)) {
    throw createError({ statusCode: 400, message: 'Invalid status' })
  }

  const dbUser = await prisma.user.findUnique({
    where: { steamId: user.steamId }
  })
  if (!dbUser) throw createError({ statusCode: 404 })

  const updated = await prisma.userGame.update({
    where: {
      userId_steamAppId: {
        userId: dbUser.id,
        steamAppId: appId,
      }
    },
    data: { status },
    include: { game: true }
  })

  // sync achievements in background, don't await so it doesn't block the response
  syncAchievements(user.steamId, dbUser.id, appId).catch(console.error)

  return updated
})