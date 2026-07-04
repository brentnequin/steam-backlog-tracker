<script setup>
const { user, loggedIn, clear } = useUserSession()

if (!loggedIn.value) {
  await navigateTo('/')
}

const { data: library, refresh } = await useFetch('/api/library')
const syncing = ref(false)
const search = ref('')

onMounted(async () => {
  syncing.value = true
  await $fetch('/api/library/sync', { method: 'POST' })
  await refresh()
  syncing.value = false
})

const filtered = computed(() => {
  if (!library.value) return []
  if (!search.value) return library.value
  return library.value.filter(g =>
    g.game.title.toLowerCase().includes(search.value.toLowerCase())
  )
})

function coverUrl(appId) {
  return `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/library_600x900.jpg`
}

async function addToBacklog(appId) {
  await $fetch(`/api/backlog/${appId}`, {
    method: 'PATCH',
    body: { status: 'not_started' }
  })
  await refresh()
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
        <div class="flex items-center gap-2 text-sm text-neutral-400">
          <span v-if="syncing" class="flex items-center gap-2">
            <svg class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Syncing...
          </span>
          <span v-else>{{ library?.length ?? 0 }} games</span>
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
            class="w-full aspect-[2/3] object-cover"
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