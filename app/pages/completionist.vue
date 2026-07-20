<script setup lang="ts">
const { loggedIn } = useUserSession()
if (!loggedIn.value) await navigateTo('/')

const { data: games } = await useFetch('/api/completionist')

const hideCompleted = ref(true)

const filtered = computed(() => {
  if (!games.value) return []
  let list = games.value
  if (hideCompleted.value) {
    list = list.filter(g => g.completionPct < 100)
  }
  return list
})

function coverUrl(appId: number) {
  return `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`
}
</script>

<template>
  <div class="text-white">
    <main class="max-w-3xl mx-auto px-6 py-8">

      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-xl font-semibold">Completionist</h1>
          <p class="text-sm text-neutral-400 mt-1">Track your achievement progress across your backlog</p>
        </div>
        <div class="flex items-center gap-2">
          <input
            type="checkbox"
            id="hide-completed"
            v-model="hideCompleted"
            class="rounded border-neutral-700 bg-neutral-900"
          />
          <label for="hide-completed" class="text-sm text-neutral-400 cursor-pointer select-none">
            Hide 100%
          </label>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-if="!filtered?.length"
        class="text-center py-24 bg-neutral-900 rounded-xl border border-neutral-800"
      >
        <p class="text-neutral-400 text-sm">No games with achievements in your backlog yet.</p>
        <NuxtLink
          to="/library"
          class="inline-block mt-4 text-sm text-white bg-neutral-800 hover:bg-neutral-700 transition-colors px-4 py-2 rounded-lg"
        >
          Browse your library
        </NuxtLink>
      </div>

      <!-- Game list -->
      <div v-else class="flex flex-col gap-3">
        <NuxtLink
          v-for="game in filtered"
          :key="game.steamAppId"
          :to="`/game/${game.steamAppId}`"
          class="flex gap-4 items-center bg-neutral-900 border border-neutral-800 rounded-xl p-4 hover:border-neutral-600 transition-colors"
        >
          <img
            :src="coverUrl(game.steamAppId)"
            :alt="game.title"
            class="w-16 h-9 rounded-lg object-cover flex-shrink-0"
          />
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium truncate">{{ game.title }}</span>
              <span class="text-sm font-semibold ml-4 flex-shrink-0" :class="game.completionPct === 100 ? 'text-green-400' : 'text-white'">
                {{ game.completionPct }}%
              </span>
            </div>
            <div class="w-full bg-neutral-800 rounded-full h-1.5">
              <div
                class="h-1.5 rounded-full transition-all"
                :class="game.completionPct === 100 ? 'bg-green-400' : 'bg-white'"
                :style="{ width: `${game.completionPct}%` }"
              />
            </div>
            <div class="text-xs text-neutral-500 mt-1.5">
              {{ game.achievementUnlocked }} / {{ game.achievementTotal }} achievements
            </div>
          </div>
        </NuxtLink>
      </div>

    </main>
  </div>
</template>