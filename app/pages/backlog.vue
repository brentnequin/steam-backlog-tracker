<script setup>
const { user, loggedIn, clear } = useUserSession()

if (!loggedIn.value) {
  await navigateTo('/')
}

const { data: backlog, refresh } = await useFetch('/api/backlog')

const hideCompleted = ref(true) // on by default

const statusStyles = {
  not_started: 'bg-neutral-800 text-neutral-400',
  playing:     'bg-blue-950 text-blue-400',
  completed:   'bg-green-950 text-green-400',
  dropped:     'bg-red-950 text-red-400',
  on_hold:     'bg-yellow-950 text-yellow-400',
}

const statusLabel = {
  not_started: 'Not started',
  playing:     'Playing',
  completed:   'Completed',
  dropped:     'Dropped',
  on_hold:     'On hold',
}

const statuses = Object.keys(statusLabel)

function coverUrl(appId) {
  return `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/library_600x900.jpg`
}

async function updateStatus(appId, status) {
  await $fetch(`/api/backlog/${appId}`, {
    method: 'PATCH',
    body: { status }
  })
  await refresh()
}

const filtered = computed(() => {
  if (!backlog.value) return []
  let list = backlog.value

  if (hideCompleted.value) {
    list = list.filter(g => g.status !== 'completed')
  }

  return [...list].sort((a, b) => a.game.title.localeCompare(b.game.title))
})
</script>

<template>
  <div class="text-white">

    <main class="max-w-6xl mx-auto px-6 py-8">

      <!-- Stats -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div class="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
          <div class="text-xs text-neutral-500 mb-1">Total</div>
          <div class="text-2xl font-semibold">{{ filtered?.length ?? 0 }}</div>
        </div>
        <div class="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
          <div class="text-xs text-neutral-500 mb-1">Not started</div>
          <div class="text-2xl font-semibold text-neutral-400">
            {{ filtered?.filter(g => g.status === 'not_started').length ?? 0 }}
          </div>
        </div>
        <div class="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
          <div class="text-xs text-neutral-500 mb-1">Playing</div>
          <div class="text-2xl font-semibold text-blue-400">
            {{ filtered?.filter(g => g.status === 'playing').length ?? 0 }}
          </div>
        </div>
        <div class="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
          <div class="text-xs text-neutral-500 mb-1">Completed</div>
          <div class="text-2xl font-semibold text-green-400">
            {{ backlog?.filter(g => g.status === 'completed').length ?? 0 }}
          </div>
        </div>
      </div>

       <!-- Toolbar -->
        <div class="flex items-center justify-between mb-6">
            <span class="text-sm text-neutral-400">{{ filtered.length }} games</span>
            <div class="flex items-center gap-2">
            <input
                type="checkbox"
                id="hide-completed"
                v-model="hideCompleted"
                class="rounded border-neutral-700 bg-neutral-900"
            />
            <label for="hide-completed" class="text-sm text-neutral-400 cursor-pointer select-none">
                Hide completed
            </label>
            </div>
        </div>

      <!-- Empty state -->
      <div
        v-if="!filtered?.length"
        class="flex flex-col items-center justify-center py-24 gap-3"
      >
        <p class="text-neutral-400 text-sm">Your backlog is empty.</p>
        <NuxtLink
          to="/library"
          class="text-sm text-white bg-neutral-800 hover:bg-neutral-700 transition-colors px-4 py-2 rounded-lg"
        >
          Browse your library
        </NuxtLink>
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
            <!-- Status selector -->
            <select
              :value="entry.status"
              @change="updateStatus(entry.steamAppId, $event.target.value)"
              :class="['text-xs px-2 py-1 rounded-lg w-full font-medium border-0 cursor-pointer focus:outline-none', statusStyles[entry.status]]"
            >
              <option v-for="s in statuses" :key="s" :value="s">
                {{ statusLabel[s] }}
              </option>
            </select>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>