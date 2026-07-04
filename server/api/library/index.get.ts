import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  if (!user) throw createError({ statusCode: 401 })

  const dbUser = await prisma.user.findUnique({
    where: { steamId: user.steamId }
  })
  if (!dbUser) throw createError({ statusCode: 404, message: 'User not found' })

  const userGames = await prisma.userGame.findMany({
    where: { userId: dbUser.id },
    include: { game: true },
    orderBy: { playtime: 'desc' },
  })

  return userGames
})