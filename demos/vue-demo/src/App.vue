<script setup lang="ts">
import { ref } from 'vue';
import Button from './components/ui/Button.vue';

const clickCount = ref(0);
</script>

<template>
  <main class="p-8 space-y-8">
    <h1 class="text-3xl font-bold">Vue 3 Demo - Converted shadcn Button</h1>
    <p class="text-muted-foreground">
      This Button component was converted from React shadcn/ui using component-converter.
    </p>

    <section class="space-y-4">
      <h2 class="text-xl font-semibold">Button Variants</h2>
      <div class="flex gap-2 flex-wrap">
        <Button variant="default">Default</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </div>
    </section>

    <section class="space-y-4">
      <h2 class="text-xl font-semibold">Button Sizes</h2>
      <div class="flex gap-2 items-center">
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
        <Button size="icon">🎯</Button>
      </div>
    </section>

    <section class="space-y-4">
      <h2 class="text-xl font-semibold">Interactive Demo</h2>
      <div class="flex gap-4 items-center">
        <Button @click="clickCount++">
          Clicked {{ clickCount }} times
        </Button>
        <Button variant="outline" @click="clickCount = 0">
          Reset
        </Button>
      </div>
    </section>

    <section class="space-y-4">
      <h2 class="text-xl font-semibold">Disabled State</h2>
      <div class="flex gap-2">
        <Button disabled>Disabled Default</Button>
        <Button variant="destructive" disabled>Disabled Destructive</Button>
      </div>
    </section>
  </main>
</template>
