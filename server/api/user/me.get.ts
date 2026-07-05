import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  if (!user) throw createError({ statusCode: 401 })

  const dbUser = await prisma.user.findUnique({
    where: { steamId: user.steamId },
    select: { lastSyncedAt: true }
  })

  return dbUser
})
