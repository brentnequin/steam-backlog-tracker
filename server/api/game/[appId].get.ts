import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  if (!user) throw createError({ statusCode: 401 })

  const appId = parseInt(getRouterParam(event, 'appId') ?? '')
  if (isNaN(appId)) throw createError({ statusCode: 400 })

  const dbUser = await prisma.user.findUnique({
    where: { steamId: user.steamId }
  })
  if (!dbUser) throw createError({ statusCode: 404 })

  const entry = await prisma.userGame.findUnique({
    where: {
      userId_steamAppId: {
        userId: dbUser.id,
        steamAppId: appId,
      }
    },
    include: { game: true }
  })

  if (!entry) throw createError({ statusCode: 404 })

  return entry
})