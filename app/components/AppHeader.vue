<script setup lang="ts">
const route = useRoute()
const { user, loggedIn, clear } = useUserSession()

async function signOut() {
    await clear()
    await navigateTo('/')
}

function isActive(path: string) {
  return route.path === path
}

</script>


<template>
    <header class="sticky top-0 z-10 bg-neutral-950 border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
      <h1 class="text-lg font-semibold tracking-tight text-white">Steam Backlogger</h1>

      <nav class="flex items-center gap-1">
          <NuxtLink
            to="/library"
            :class="['px-3 py-1.5 rounded-lg text-sm transition-colors', isActive('/library') ? 'text-white bg-neutral-800' : 'text-neutral-400 hover:text-white hover:bg-neutral-800']"
          >
            Library
          </NuxtLink>
          <NuxtLink
            to="/backlog"
            :class="['px-3 py-1.5 rounded-lg text-sm transition-colors', isActive('/backlog') ? 'text-white bg-neutral-800' : 'text-neutral-400 hover:text-white hover:bg-neutral-800']"
          >
            Backlog
          </NuxtLink>
          <NuxtLink
            to="/completionist"
            :class="['px-3 py-1.5 rounded-lg text-sm transition-colors', isActive('/completionist') ? 'text-white bg-neutral-800' : 'text-neutral-400 hover:text-white hover:bg-neutral-800']"
          >
            Completionist
          </NuxtLink>
        </nav>



      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <img :src="user?.avatar" class="w-7 h-7 rounded-full" />
          <span class="text-sm text-neutral-300">{{ user?.name }}</span>
        </div>
        <button
          @click="signOut"
          class="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          Sign out
        </button>
      </div>
    </header>
</template>