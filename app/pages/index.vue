<script setup>
definePageMeta({
  layout: 'blank'
})

const { loggedIn } = useUserSession()
if (loggedIn.value) {
  await navigateTo('/backlog')
}
</script>

<template>
  <div class="min-h-screen bg-neutral-950 flex flex-col items-center justify-center relative">
    <div class="flex flex-col items-center gap-8">
      <div class="flex flex-col items-center gap-3">
        <h1 class="text-4xl font-semibold text-white tracking-tight">Backlog</h1>
        <p class="text-neutral-400 text-sm">Track every game you own. Actually finish some of them.</p>
      </div>
      <a
        href="/auth/steam"
        class="flex items-center gap-3 bg-neutral-800 hover:bg-neutral-700 transition-colors text-white text-sm font-medium px-5 py-3 rounded-xl border border-neutral-700"
      >
        Sign in with Steam
      </a>
    </div>
    <footer class="absolute bottom-0 left-0 right-0 pb-6 flex justify-center">
      <p class="text-xs text-neutral-600">Built by Brent · Not affiliated with Valve</p>
    </footer>
  </div>
</template>