<script lang="ts">
  // Single-file components (fully supported by CLI conversion)
  import Button from './lib/components/ui/Button.svelte';
  import Input from './lib/components/ui/Input.svelte';
  import Label from './lib/components/ui/Label.svelte';
  import Textarea from './lib/components/ui/Textarea.svelte';
  import Badge from './lib/components/ui/Badge.svelte';
  import Skeleton from './lib/components/ui/Skeleton.svelte';
  import Separator from './lib/components/ui/Separator.svelte';
  import Switch from './lib/components/ui/Switch.svelte';
  import Progress from './lib/components/ui/Progress.svelte';
  import Checkbox from './lib/components/ui/Checkbox.svelte';

  let clickCount = $state(0);
  let switchChecked = $state(false);
  let checkboxChecked = $state(false);
  let progress = $state(33);
</script>

<main class="p-8 space-y-8">
  <h1 class="text-3xl font-bold">Svelte 5 Demo - Converted shadcn Components</h1>
  <p class="text-muted-foreground">
    These components were converted from React shadcn/ui using component-converter.
  </p>
  <p class="text-sm text-muted-foreground">
    Note: Only single-component files are shown. Multi-component files (Card, Alert, Table, Tabs, Avatar)
    require CLI enhancement to split into separate files.
  </p>

  <!-- Button Section -->
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

  <Separator class="my-8" />

  <!-- Badge Section -->
  <section class="space-y-4">
    <h2 class="text-xl font-semibold">Badge Variants</h2>
    <div class="flex gap-2 flex-wrap">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  </section>

  <Separator class="my-8" />

  <!-- Input & Label Section -->
  <section class="space-y-4">
    <h2 class="text-xl font-semibold">Input & Label</h2>
    <div class="grid w-full max-w-sm gap-1.5">
      <Label for="email">Email</Label>
      <Input type="email" id="email" placeholder="Enter your email" />
    </div>
    <div class="grid w-full max-w-sm gap-1.5">
      <Label for="password">Password</Label>
      <Input type="password" id="password" placeholder="Enter password" />
    </div>
    <div class="grid w-full max-w-sm gap-1.5">
      <Label for="disabled-input">Disabled Input</Label>
      <Input id="disabled-input" placeholder="Can't edit this" disabled />
    </div>
  </section>

  <Separator class="my-8" />

  <!-- Textarea Section -->
  <section class="space-y-4">
    <h2 class="text-xl font-semibold">Textarea</h2>
    <div class="grid w-full max-w-sm gap-1.5">
      <Label for="message">Message</Label>
      <Textarea id="message" placeholder="Type your message here..." />
    </div>
  </section>

  <Separator class="my-8" />

  <!-- Switch Section -->
  <section class="space-y-4">
    <h2 class="text-xl font-semibold">Switch</h2>
    <div class="flex items-center gap-4">
      <Switch
        checked={switchChecked}
        onchange={() => switchChecked = !switchChecked}
      />
      <span class="text-sm">
        Switch is {switchChecked ? 'ON' : 'OFF'}
      </span>
    </div>
    <div class="flex items-center gap-4">
      <Switch disabled />
      <span class="text-sm text-muted-foreground">Disabled switch</span>
    </div>
  </section>

  <Separator class="my-8" />

  <!-- Checkbox Section -->
  <section class="space-y-4">
    <h2 class="text-xl font-semibold">Checkbox</h2>
    <div class="flex items-center gap-2">
      <Checkbox
        id="terms"
        checked={checkboxChecked}
        onclick={() => checkboxChecked = !checkboxChecked}
      />
      <Label for="terms">Accept terms and conditions</Label>
    </div>
    <div class="flex items-center gap-2">
      <Checkbox id="disabled" disabled />
      <Label for="disabled" class="text-muted-foreground">Disabled checkbox</Label>
    </div>
  </section>

  <Separator class="my-8" />

  <!-- Progress Section -->
  <section class="space-y-4">
    <h2 class="text-xl font-semibold">Progress</h2>
    <div class="w-full max-w-sm space-y-2">
      <Progress value={progress} />
      <div class="flex gap-2">
        <Button size="sm" variant="outline" onclick={() => progress = Math.max(0, progress - 10)}>-10%</Button>
        <Button size="sm" variant="outline" onclick={() => progress = Math.min(100, progress + 10)}>+10%</Button>
        <span class="text-sm text-muted-foreground ml-2">{progress}%</span>
      </div>
    </div>
  </section>

  <Separator class="my-8" />

  <!-- Skeleton Section -->
  <section class="space-y-4">
    <h2 class="text-xl font-semibold">Skeleton</h2>
    <div class="flex items-center space-x-4">
      <Skeleton class="h-12 w-12 rounded-full" />
      <div class="space-y-2">
        <Skeleton class="h-4 w-[250px]" />
        <Skeleton class="h-4 w-[200px]" />
      </div>
    </div>
  </section>
</main>
