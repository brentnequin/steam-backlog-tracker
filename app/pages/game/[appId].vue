<script setup lang="ts">
const route = useRoute()
const appId = route.params.appId as string

const { data: entry, refresh } = await useFetch(`/api/game/${appId}`)

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

async function removeFromBacklog() {
  await $fetch(`/api/backlog/${appId}`, { method: 'DELETE' })
  await navigateTo('/backlog')
}

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

          <!-- Status selector -->
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

      <!-- Stats -->
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
      <div class="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
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

      <!-- Bottom of the page, after the notes section -->
      <div class="mt-8 pt-6 border-t border-neutral-800 flex justify-between items-center">
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

    </main>
  </div>
</template>