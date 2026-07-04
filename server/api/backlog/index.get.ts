import prisma from '../../lib/prisma'

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
      status: { not: null }
    },
    include: { game: true },
    orderBy: { updatedAt: 'desc' }
  })

  return games
})
