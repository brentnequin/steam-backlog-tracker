import prisma from './prisma'

export async function syncAchievements(steamId: string, userId: number, appId: number) {
  const apiKey = process.env.NUXT_OAUTH_STEAM_API_KEY

  try {
    const [playerData, schemaData] = await Promise.all([
      $fetch('https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/', {
        params: { key: apiKey, steamid: steamId, appid: appId, l: 'en' }
      }) as any,
      $fetch('https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/', {
        params: { key: apiKey, appid: appId, l: 'en' }
      }) as any
    ])

    const playerAchievements = playerData?.playerstats?.achievements ?? []
    const schemaAchievements = schemaData?.game?.availableGameStats?.achievements ?? []

    if (!schemaAchievements.length) return

    // upsert each achievement
    for (const schema of schemaAchievements) {
      const player = playerAchievements.find((p: any) => p.apiname === schema.name)
      await prisma.userAchievement.upsert({
        where: {
          userId_steamAppId_apiName: {
            userId,
            steamAppId: appId,
            apiName: schema.name,
          }
        },
        update: {
          unlocked: player?.achieved === 1,
          unlockedAt: player?.unlocktime ? new Date(player.unlocktime * 1000) : null,
        },
        create: {
          userId,
          steamAppId: appId,
          apiName: schema.name,
          displayName: schema.displayName,
          description: schema.description ?? '',
          iconUrl: schema.icon,
          iconGrayUrl: schema.icongray,
          unlocked: player?.achieved === 1,
          unlockedAt: player?.unlocktime ? new Date(player.unlocktime * 1000) : null,
        }
      })
    }

    // update completion counts on UserGame
    const unlocked = playerAchievements.filter((p: any) => p.achieved === 1).length
    await prisma.userGame.update({
      where: {
        userId_steamAppId: { userId, steamAppId: appId }
      },
      data: {
        achievementTotal: schemaAchievements.length,
        achievementUnlocked: unlocked,
      }
    })
  } catch (e) {
    // game has no achievements, silently ignore
  }
}