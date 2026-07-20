<!-- pages/admin.vue -->
<script setup lang="ts">
const { user, loggedIn } = useUserSession()
if (!loggedIn.value) await navigateTo('/')

const { data: stats, error } = await useFetch('/api/admin/stats')

if (error.value?.statusCode === 403) {
  await navigateTo('/')
}

function formatDate(date: string | null) {
  if (!date) return 'Never'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}

const backfilling = ref(false)
const backfillResult = ref<{ synced: number } | null>(null)

async function backfillAchievements() {
  backfilling.value = true
  backfillResult.value = null
  backfillResult.value = await $fetch('/api/admin/backfill-achievements', { method: 'POST' })
  backfilling.value = false
}
</script>

<template>
  <div class="text-white">
    <main class="max-w-4xl mx-auto px-6 py-8" v-if="stats">

      <div class="mb-8">
        <h1 class="text-xl font-semibold">Admin</h1>
        <p class="text-sm text-neutral-400 mt-1">Database stats and storage usage</p>
      </div>

      <!-- Overview stats -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div class="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
          <div class="text-xs text-neutral-500 mb-1">Total users</div>
          <div class="text-2xl font-semibold">{{ stats.overview.totalUsers }}</div>
        </div>
        <div class="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
          <div class="text-xs text-neutral-500 mb-1">Total games</div>
          <div class="text-2xl font-semibold">{{ stats.overview.totalGames }}</div>
        </div>
        <div class="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
          <div class="text-xs text-neutral-500 mb-1">Achievements stored</div>
          <div class="text-2xl font-semibold">{{ stats.overview.totalAchievements }}</div>
        </div>
        <div class="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
          <div class="text-xs text-neutral-500 mb-1">Total DB size</div>
          <div class="text-2xl font-semibold">{{ stats.overview.totalSize }}</div>
        </div>
      </div>

      <!-- Table sizes -->
      <div class="bg-neutral-900 rounded-xl border border-neutral-800 mb-8">
        <div class="px-4 py-3 border-b border-neutral-800">
          <h2 class="text-sm font-medium">Storage by table</h2>
        </div>
        <div class="divide-y divide-neutral-800">
          <div
            v-for="table in stats.tableSizes"
            :key="table.table"
            class="flex items-center justify-between px-4 py-3"
          >
            <span class="text-sm text-neutral-300 font-mono">{{ table.table }}</span>
            <span class="text-sm text-neutral-400">{{ table.size }}</span>
          </div>
        </div>
      </div>

      <!-- Per user breakdown -->
      <div class="bg-neutral-900 rounded-xl border border-neutral-800">
        <div class="px-4 py-3 border-b border-neutral-800">
          <h2 class="text-sm font-medium">Users</h2>
        </div>
        <div class="divide-y divide-neutral-800">
          <div
            v-for="u in stats.users"
            :key="u.id"
            class="flex items-center gap-4 px-4 py-3"
          >
            <img :src="u.avatarUrl" class="w-8 h-8 rounded-full flex-shrink-0" />
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium">{{ u.username }}</div>
              <div class="text-xs text-neutral-500">Last synced {{ formatDate(u.lastSyncedAt) }}</div>
            </div>
            <div class="flex items-center gap-6 text-right flex-shrink-0">
              <div>
                <div class="text-sm font-medium">{{ u.gameCount }}</div>
                <div class="text-xs text-neutral-500">games</div>
              </div>
              <div>
                <div class="text-sm font-medium">{{ u.achievementCount }}</div>
                <div class="text-xs text-neutral-500">achievements</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-neutral-900 rounded-xl border border-neutral-800 mt-8 p-4 flex items-center justify-between">
        <div>
            <div class="text-sm font-medium">Backfill achievements</div>
            <div class="text-xs text-neutral-500 mt-0.5">
            Sync achievement data for backlog games added before achievement tracking was implemented
            </div>
            <div v-if="backfillResult" class="text-xs text-green-400 mt-1">
            Synced {{ backfillResult.synced }} games
            </div>
        </div>
        <button
            @click="backfillAchievements"
            :disabled="backfilling"
            class="text-xs px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors disabled:opacity-50 flex-shrink-0"
        >
            {{ backfilling ? 'Backfilling...' : 'Run backfill' }}
        </button>
        </div>

    </main>
  </div>
</template>