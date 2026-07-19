export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  if (!user) throw createError({ statusCode: 401 })

  const appId = parseInt(getRouterParam(event, 'appId') ?? '')
  if (isNaN(appId)) throw createError({ statusCode: 400 })

  const apiKey = process.env.NUXT_OAUTH_STEAM_API_KEY

  try {
    const [playerData, schemaData] = await Promise.all([
      $fetch('https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/', {
        params: {
          key: apiKey,
          steamid: user.steamId,
          appid: appId,
          l: 'en'
        }
      }) as any,
      $fetch('https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/', {
        params: {
          key: apiKey,
          appid: appId,
          l: 'en'
        }
      }) as any
    ])

    const playerAchievements = playerData?.playerstats?.achievements ?? []
    const schemaAchievements = schemaData?.game?.availableGameStats?.achievements ?? []

    if (!schemaAchievements.length) {
      return { hasAchievements: false, achievements: [] }
    }

    // merge player unlock status with schema metadata
    const merged = schemaAchievements.map((schema: any) => {
      const player = playerAchievements.find((p: any) => p.apiname === schema.name)
      return {
        apiName: schema.name,
        displayName: schema.displayName,
        description: schema.description ?? '',
        iconUrl: player?.achieved ? schema.icon : schema.icongray,
        unlocked: player?.achieved === 1,
        unlockedAt: player?.unlocktime ? new Date(player.unlocktime * 1000) : null,
      }
    })

    // sort unlocked first
    merged.sort((a: any, b: any) => {
      if (a.unlocked && !b.unlocked) return -1
      if (!a.unlocked && b.unlocked) return 1
      if (a.unlockedAt && b.unlockedAt) return b.unlockedAt - a.unlockedAt
      return 0
    })

    return {
      hasAchievements: true,
      total: merged.length,
      unlocked: merged.filter((a: any) => a.unlocked).length,
      achievements: merged
    }
  } catch (e) {
    // game has no stats or achievements
    return { hasAchievements: false, achievements: [] }
  }
})