<template>
  <div class="min-h-screen bg-neutral-950 flex items-center justify-center">
    <div class="flex flex-col items-center gap-8">
      <div class="flex flex-col items-center gap-3">
        <h1 class="text-4xl font-semibold text-white tracking-tight">Backlog</h1>
        <p class="text-neutral-400 text-sm">Track every game you own. Actually finish some of them.</p>
      </div>

      <a
        href="/auth/steam"
        class="flex items-center gap-3 bg-neutral-800 hover:bg-neutral-700 transition-colors text-white text-sm font-medium px-5 py-3 rounded-xl border border-neutral-700"
      >
        <svg class="w-5 h-5" viewBox="0 0 233 233" fill="currentColor">
          <path d="M116.5 0C52.1 0 0 52.1 0 116.5c0 55.4 38.7 101.9 90.7 113.6l34.2-84.5c-1.5.1-3 .2-4.5.2-23.2 0-42.1-18.9-42.1-42.1 0-23.2 18.9-42.1 42.1-42.1 23.2 0 42.1 18.9 42.1 42.1 0 19.4-13.2 35.8-31 40.8l-33.5 82.8c1.8.1 3.7.2 5.5.2 64.4 0 116.5-52.1 116.5-116.5C233 52.1 180.9 0 116.5 0z"/>
        </svg>
        Sign in with Steam
      </a>
    </div>
  </div>
</template>