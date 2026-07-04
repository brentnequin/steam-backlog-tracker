import prisma from '../../../server/lib/prisma'

export default defineOAuthSteamEventHandler({
    async onSuccess(event, { user }) {
    // upsert user in DB
    await prisma.user.upsert({
      where: { steamId: user.steamid },
      update: { username: user.personaname, avatarUrl: user.avatarfull },
      create: {
        steamId: user.steamid,
        username: user.personaname,
        avatarUrl: user.avatarfull,
      }
    })

    await setUserSession(event, {
      user: {
        steamId: user.steamid,
        name: user.personaname,
        avatar: user.avatarfull,
      }
    })

    return sendRedirect(event, '/library')
  }
})