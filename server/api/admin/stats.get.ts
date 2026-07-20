import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  if (!user) throw createError({ statusCode: 401 })

  if (user.steamId !== process.env.NUXT_ADMIN_STEAM_ID) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  const [
    totalUsers,
    totalGames,
    totalUserGames,
    totalAchievements,
    users,
    tableSizes,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.game.count(),
    prisma.userGame.count(),
    prisma.userAchievement.count(),
    prisma.user.findMany({
      include: {
        _count: {
          select: {
            games: true,
            achievements: true,
          }
        }
      }
    }),
    prisma.$queryRaw`
      SELECT
        relname AS table,
        pg_size_pretty(pg_total_relation_size(relid)) AS size,
        CAST(pg_total_relation_size(relid) AS INTEGER) AS size_bytes
      FROM pg_catalog.pg_statio_user_tables
      ORDER BY pg_total_relation_size(relid) DESC
    ` as any,
  ])

  // get achievement count per user
  const achievementCounts = await prisma.userAchievement.groupBy({
    by: ['userId'],
    _count: { id: true }
  })

  const userStats = users.map(u => {
    const achievements = achievementCounts.find(a => a.userId === u.id)
    return {
      id: u.id,
      steamId: u.steamId,
      username: u.username,
      avatarUrl: u.avatarUrl,
      createdAt: u.createdAt,
      lastSyncedAt: u.lastSyncedAt,
      gameCount: u._count.games,
      achievementCount: achievements?._count.id ?? 0,
    }
  })

  const totalSize = tableSizes.reduce((acc: number, t: any) => acc + Number(t.size_bytes), 0)

  return {
    overview: {
      totalUsers,
      totalGames,
      totalUserGames,
      totalAchievements,
      totalSize: formatBytes(totalSize),
    },
    tableSizes,
    users: userStats,
  }
})

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}