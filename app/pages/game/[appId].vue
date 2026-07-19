<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const appId = route.params.appId as string

const activeTab = computed(() => route.query.tab ?? 'overview')

function setTab(tab: string) {
  router.replace({ query: { tab } })
}

const { data: entry, refresh } = await useFetch(`/api/game/${appId}`)
const { data: achievementData } = useLazyFetch(`/api/game/${appId}/achievements`)

const statusStyles: Record<string, string> = {
  not_started: 'bg-neutral-800 text-neutral-400',
  playing:     'bg-blue-950 text-blue-400',
  completed:   'bg-green-950 text-green-400',
  dropped:     'bg-red-950 text-red-400',
  on_hold:     'bg-yellow-950 text-yellow-400',
}

const statusLabel: Record<string, string> = {
  not_started: 'Not started',
  playing:     'Playing',
  completed:   'Completed',
  dropped:     'Dropped',
  on_hold:     'On hold',
}

const statuses = Object.keys(statusLabel)
const notes = ref(entry.value?.notes ?? '')
const saving = ref(false)

async function updateStatus(status: string) {
  await $fetch(`/api/game/${appId}`, {
    method: 'PATCH',
    body: { status }
  })
  await refresh()
}

async function saveNotes() {
  saving.value = true
  await $fetch(`/api/game/${appId}`, {
    method: 'PATCH',
    body: { notes: notes.value }
  })
  saving.value = false
}

async function removeFromBacklog() {
  await $fetch(`/api/backlog/${appId}`, { method: 'DELETE' })
  await navigateTo('/backlog')
}

function coverUrl(appId: number) {
  return `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`
}

function formatPlaytime(minutes: number) {
  if (minutes < 60) return `${minutes}m`
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`
}

function formatDate(date: string | null) {
  if (!date) return 'Never'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}

function formatUnlockDate(date: string | null) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}
</script>

<template>
  <div class="text-white">
    <main class="max-w-3xl mx-auto px-6 py-8" v-if="entry">

      <!-- Back button -->
      <NuxtLink
        to="/backlog"
        class="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors mb-8"
      >
        ← Back to backlog
      </NuxtLink>

      <!-- Hero -->
      <div class="flex gap-6 mb-8">
        <img
          :src="coverUrl(entry.steamAppId)"
          :alt="entry.game.title"
          class="w-48 rounded-xl border border-neutral-800 object-cover flex-shrink-0"
        />
        <div class="flex flex-col gap-4 justify-center">
          <h1 class="text-2xl font-semibold">{{ entry.game.title }}</h1>
          <div>
            <div class="text-xs text-neutral-500 mb-2">Status</div>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="s in statuses"
                :key="s"
                @click="updateStatus(s)"
                :class="[
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  entry.status === s
                    ? statusStyles[s]
                    : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                ]"
              >
                {{ statusLabel[s] }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex items-center gap-1 border-b border-neutral-800 mb-6">
        <button
          @click="setTab('overview')"
          :class="[
            'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
            activeTab === 'overview'
              ? 'text-white border-white'
              : 'text-neutral-400 border-transparent hover:text-white'
          ]"
        >
          Overview
        </button>
        <button
          @click="setTab('achievements')"
          :class="[
            'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
            activeTab === 'achievements'
              ? 'text-white border-white'
              : 'text-neutral-400 border-transparent hover:text-white'
          ]"
        >
          Achievements
          <span v-if="achievementData?.total" class="ml-1.5 text-xs text-neutral-500">
            {{ achievementData.unlocked }}/{{ achievementData.total }}
          </span>
        </button>
      </div>

      <!-- Overview tab -->
      <div v-if="activeTab === 'overview'">
        <div class="grid grid-cols-2 gap-3 mb-8">
          <div class="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
            <div class="text-xs text-neutral-500 mb-1">Time played</div>
            <div class="text-2xl font-semibold">{{ formatPlaytime(entry.playtime) }}</div>
          </div>
          <div class="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
            <div class="text-xs text-neutral-500 mb-1">Last played</div>
            <div class="text-xl font-semibold">{{ formatDate(entry.lastPlayedAt) }}</div>
          </div>
        </div>

        <!-- Notes -->
        <div class="bg-neutral-900 rounded-xl p-4 border border-neutral-800 mb-8">
          <div class="text-xs text-neutral-500 mb-3">Notes</div>
          <textarea
            v-model="notes"
            placeholder="Add notes about this game..."
            class="w-full bg-transparent text-sm text-white placeholder-neutral-600 resize-none focus:outline-none min-h-24"
            rows="4"
          />
          <div class="flex justify-end mt-2">
            <button
              @click="saveNotes"
              :disabled="saving"
              class="text-xs px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors disabled:opacity-50"
            >
              {{ saving ? 'Saving...' : 'Save notes' }}
            </button>
          </div>
        </div>

        <!-- Remove from backlog -->
        <div class="pt-6 border-t border-neutral-800 flex justify-between items-center">
          <div>
            <div class="text-sm font-medium text-white">Remove from backlog</div>
            <div class="text-xs text-neutral-500 mt-0.5">This game will stay in your library but won't be tracked</div>
          </div>
          <button
            @click="removeFromBacklog"
            class="text-xs px-3 py-1.5 rounded-lg border border-red-900 text-red-400 hover:bg-red-950 transition-colors"
          >
            Remove
          </button>
        </div>
      </div>

      <!-- Achievements tab -->
      <div v-else-if="activeTab === 'achievements'">
        <div v-if="achievementData?.hasAchievements">
          <div class="flex items-center justify-between mb-4">
            <span class="text-xs text-neutral-400">
              {{ achievementData.unlocked }} / {{ achievementData.total }} unlocked
            </span>
          </div>

          <!-- Progress bar -->
          <div class="w-full bg-neutral-800 rounded-full h-1.5 mb-6">
            <div
              class="bg-white h-1.5 rounded-full transition-all"
              :style="{ width: `${(achievementData.unlocked / achievementData.total) * 100}%` }"
            />
          </div>

          <!-- Achievement list -->
          <div class="flex flex-col gap-2">
            <div
              v-for="achievement in achievementData.achievements"
              :key="achievement.apiName"
              :class="[
                'flex items-center gap-3 p-3 rounded-xl border',
                achievement.unlocked
                  ? 'bg-neutral-900 border-neutral-800'
                  : 'bg-neutral-950 border-neutral-900 opacity-50'
              ]"
            >
              <img
                :src="achievement.iconUrl"
                :alt="achievement.displayName"
                class="w-10 h-10 rounded-lg flex-shrink-0"
              />
              <div class="min-w-0 flex-1">
                <div class="text-sm font-medium text-white">{{ achievement.displayName }}</div>
                <div class="text-xs text-neutral-500 truncate">{{ achievement.description }}</div>
              </div>
              <div v-if="achievement.unlocked" class="text-xs text-neutral-500 flex-shrink-0">
                {{ formatUnlockDate(achievement.unlockedAt) }}
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="achievementData && !achievementData.hasAchievements"
          class="text-sm text-neutral-600 text-center py-12 bg-neutral-900 rounded-xl border border-neutral-800"
        >
          This game has no achievements
        </div>

        <div v-else class="flex justify-center py-12">
          <div class="text-sm text-neutral-600">Loading achievements...</div>
        </div>
      </div>

    </main>
  </div>
</template>