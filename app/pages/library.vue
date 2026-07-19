<script setup lang="ts">
const { user, loggedIn, clear } = useUserSession()

if (!loggedIn.value) {
  await navigateTo('/')
}

const { data: library, refresh } = await useFetch('/api/library')
const { data: me, refresh: refreshMe } = await useFetch('/api/user/me')

const syncing = ref(false)
const search = ref('')
const hideInBacklog = ref(true) // on by default

onMounted(async () => {
  // only auto-sync if never synced before
  if (!me.value?.lastSyncedAt) {
    await syncLibrary()
  }
})

async function syncLibrary() {
  syncing.value = true
  await $fetch('/api/library/sync', { method: 'POST' })
  await Promise.all([refresh(), refreshMe()])
  syncing.value = false
}

const filtered = computed(() => {
  if (!library.value) return []
  let list = library.value

  if (hideInBacklog.value) {
    list = list.filter(g => !g.status)
  }

  if (search.value) {
    list = list.filter(g =>
      g.game.title.toLowerCase().includes(search.value.toLowerCase())
    )
  }

  list = [...list].sort((a, b) => a.game.title.localeCompare(b.game.title))

  return list
})

function coverUrl(appId: number) {
  return `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/library_600x900.jpg`
}

function fallbackUrl(appId: number) {
  return `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`
}

function onImageError(e: Event, appId: number) {
  const img = e.target as HTMLImageElement
  
  if (img.dataset.fallback === '1') {
    // fallback also failed, stop and show placeholder
    img.removeEventListener('error', () => {})
    img.style.display = 'none'
    const placeholder = img.nextElementSibling as HTMLElement
    if (placeholder) placeholder.style.display = 'flex'
    return
  }

  img.dataset.fallback = '1'
  img.src = fallbackUrl(appId)
}

async function addToBacklog(appId: number) {
  await $fetch(`/api/backlog/${appId}`, {
    method: 'PATCH',
    body: { status: 'not_started' }
  })
  await navigateTo(`/game/${appId}`)
}

function timeAgo(date: string | null) {
  if (!date) return null
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}
</script>

<template>
  <div class="min-h-screen bg-neutral-950 text-white">

    <main class="max-w-6xl mx-auto px-6 py-8">

      <!-- Toolbar -->
      <div class="flex items-center justify-between mb-6 gap-4">
        <div class="relative flex-1 max-w-sm">
          <input
            v-model="search"
            type="text"
            placeholder="Search library..."
            class="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
          />
        </div>
        <div class="flex items-center gap-2">
          <input
            type="checkbox"
            id="hide-backlog"
            v-model="hideInBacklog"
            class="rounded border-neutral-700 bg-neutral-900 text-white"
          />
          <label for="hide-backlog" class="text-sm text-neutral-400 cursor-pointer select-none whitespace-nowrap">
            Hide games in backlog
          </label>
        </div>
        <div class="flex items-center gap-3">
          <span v-if="me?.lastSyncedAt" class="text-xs text-neutral-500">
            Synced {{ timeAgo(me.lastSyncedAt) }}
          </span>
          <button
            @click="syncLibrary"
            :disabled="syncing"
            class="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              :class="['w-4 h-4', syncing && 'animate-spin']"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            >
              <path d="M21 12a9 9 0 11-6.219-8.56" stroke-linecap="round"/>
            </svg>
            {{ syncing ? 'Syncing...' : 'Sync library' }}
          </button>
          <span class="text-sm text-neutral-400">{{ library?.length ?? 0 }} games</span>
        </div>
      </div>

      <!-- Skeleton loading -->
      <div v-if="syncing" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        <div
          v-for="i in 18"
          :key="i"
          class="rounded-xl aspect-[2/3] bg-neutral-900 border border-neutral-800 animate-pulse"
        />
      </div>

      <!-- Game grid -->
      <div v-else class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        <div
          v-for="entry in filtered"
          :key="entry.steamAppId"
          class="group relative rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900 hover:border-neutral-600 transition-colors"
        >
          <img
            :src="coverUrl(entry.steamAppId)"
            :alt="entry.game.title"
            loading="lazy"
            class="w-full aspect-[2/3] object-cover"
            @error="e => onImageError(e, entry.steamAppId)"
          />
          <!-- Hover overlay -->
          <div class="absolute inset-0 bg-neutral-950/85 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 gap-2">
            <p class="text-xs font-medium leading-tight">{{ entry.game.title }}</p>
            <button
              v-if="!entry.status"
              @click="addToBacklog(entry.steamAppId)"
              class="text-xs bg-white text-neutral-950 font-medium px-2 py-1 rounded-lg hover:bg-neutral-200 transition-colors"
            >
              + Add to backlog
            </button>
            <span
              v-else
              class="text-xs px-2 py-0.5 rounded-full w-fit font-medium bg-blue-950 text-blue-400"
            >
              In backlog
            </span>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>