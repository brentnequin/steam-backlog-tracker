<template>
  <div class="min-h-screen bg-neutral-950 flex flex-col">
    <AppHeader />
    <main class="flex-1">
        <slot />
    </main>
    <AppFooter />
  </div>
</template>