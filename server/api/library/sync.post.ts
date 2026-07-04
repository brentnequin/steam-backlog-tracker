import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  if (!user) throw createError({ statusCode: 401 })

  // get the internal user id
  const dbUser = await prisma.user.findUnique({
    where: { steamId: user.steamId }
  })
  if (!dbUser) throw createError({ statusCode: 404, message: 'User not found' })

  const response = await $fetch(
    'https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/', {
      params: {
        key: process.env.NUXT_OAUTH_STEAM_API_KEY,
        steamid: user.steamId,
        include_appinfo: true,
        include_played_free_games: true,
        format: 'json',
      }
    }
  ) as any

  const games = response.response?.games ?? []
  if (!games.length) return { synced: 0 }

  for (const game of games) {
    await prisma.game.upsert({
      where: { steamAppId: game.appid },
      update: { title: game.name },
      create: { steamAppId: game.appid, title: game.name },
    })

    await prisma.userGame.upsert({
  where: {
    userId_steamAppId: {
      userId: dbUser.id,
      steamAppId: game.appid,
    }
  },
  update: {
    playtime: game.playtime_forever ?? 0,
    lastPlayedAt: game.rtime_last_played
      ? new Date(game.rtime_last_played * 1000)
      : null,
  },
  create: {
    userId: dbUser.id,
    steamAppId: game.appid,
    playtime: game.playtime_forever ?? 0,
    lastPlayedAt: game.rtime_last_played
      ? new Date(game.rtime_last_played * 1000)
      : null,
  }
})
  }

  await prisma.user.update({
    where: { steamId: user.steamId },
    data: { lastSyncedAt: new Date() }
  })

  return { synced: games.length }
})