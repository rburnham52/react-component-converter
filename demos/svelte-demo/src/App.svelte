<script lang="ts">
  import Button from './lib/components/ui/Button.svelte';

  let clickCount = $state(0);
</script>

<main class="p-8 space-y-8">
  <h1 class="text-3xl font-bold">Svelte 5 Demo - Converted shadcn Button</h1>
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
      <Button onclick={() => clickCount++}>
        Clicked {clickCount} times
      </Button>
      <Button variant="outline" onclick={() => clickCount = 0}>
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
