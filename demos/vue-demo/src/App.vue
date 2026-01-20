<script setup lang="ts">
import { ref } from 'vue';

// UI Components
import Button from './lib/components/ui/Button.vue';
import Input from './lib/components/ui/Input.vue';
import Label from './lib/components/ui/Label.vue';
import Textarea from './lib/components/ui/Textarea.vue';
import Badge from './lib/components/ui/Badge.vue';
import Skeleton from './lib/components/ui/Skeleton.vue';
import Separator from './lib/components/ui/Separator.vue';
import Switch from './lib/components/ui/Switch.vue';
import Progress from './lib/components/ui/Progress.vue';
import Checkbox from './lib/components/ui/Checkbox.vue';

// Avatar components
import Avatar from './lib/components/ui/Avatar.vue';
import AvatarImage from './lib/components/ui/AvatarImage.vue';
import AvatarFallback from './lib/components/ui/AvatarFallback.vue';

// Card components
import Card from './lib/components/ui/Card.vue';
import CardHeader from './lib/components/ui/CardHeader.vue';
import CardTitle from './lib/components/ui/CardTitle.vue';
import CardDescription from './lib/components/ui/CardDescription.vue';
import CardContent from './lib/components/ui/CardContent.vue';
import CardFooter from './lib/components/ui/CardFooter.vue';

// Alert components
import Alert from './lib/components/ui/Alert.vue';
import AlertTitle from './lib/components/ui/AlertTitle.vue';
import AlertDescription from './lib/components/ui/AlertDescription.vue';

// Table components
import Table from './lib/components/ui/Table.vue';
import TableHeader from './lib/components/ui/TableHeader.vue';
import TableBody from './lib/components/ui/TableBody.vue';
import TableRow from './lib/components/ui/TableRow.vue';
import TableHead from './lib/components/ui/TableHead.vue';
import TableCell from './lib/components/ui/TableCell.vue';
import TableCaption from './lib/components/ui/TableCaption.vue';

// Tabs components
import TabsList from './lib/components/ui/TabsList.vue';
import TabsTrigger from './lib/components/ui/TabsTrigger.vue';
import TabsContent from './lib/components/ui/TabsContent.vue';

const clickCount = ref(0);
const switchChecked = ref(false);
const checkboxChecked = ref(false);
const progress = ref(33);
const activeTab = ref('account');
</script>

<template>
  <main class="p-8 space-y-8">
    <h1 class="text-3xl font-bold">Vue 3 Demo - Converted shadcn Components</h1>
    <p class="text-muted-foreground">
      These components were converted from React shadcn/ui using component-converter.
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

    <!-- Avatar Section -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold">Avatar</h2>
      <div class="flex gap-4 items-center">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
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
          v-model:checked="switchChecked"
        />
        <span class="text-sm">
          Switch is {{ switchChecked ? 'ON' : 'OFF' }}
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
          :checked="checkboxChecked"
          @click="checkboxChecked = !checkboxChecked"
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
        <Progress :value="progress" />
        <div class="flex gap-2">
          <Button size="sm" variant="outline" @click="progress = Math.max(0, progress - 10)">-10%</Button>
          <Button size="sm" variant="outline" @click="progress = Math.min(100, progress + 10)">+10%</Button>
          <span class="text-sm text-muted-foreground ml-2">{{ progress }}%</span>
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

    <Separator class="my-8" />

    <!-- Card Section -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold">Card Component</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description goes here</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card content with some text explaining something interesting.</p>
          </CardContent>
          <CardFooter class="flex gap-2">
            <Button variant="outline">Cancel</Button>
            <Button>Submit</Button>
          </CardFooter>
        </Card>

        <Card class="border-destructive">
          <CardHeader>
            <CardTitle>Another Card</CardTitle>
            <CardDescription>With custom border class</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This card demonstrates that custom classes can be passed through.</p>
          </CardContent>
        </Card>
      </div>
    </section>

    <Separator class="my-8" />

    <!-- Alert Section -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold">Alert</h2>
      <Alert>
        <AlertTitle>Default Alert</AlertTitle>
        <AlertDescription>
          This is a default alert message to notify users.
        </AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertTitle>Destructive Alert</AlertTitle>
        <AlertDescription>
          Something went wrong! Please try again.
        </AlertDescription>
      </Alert>
    </section>

    <Separator class="my-8" />

    <!-- Table Section -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold">Table</h2>
      <Table>
        <TableCaption>A list of recent invoices.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead class="w-[100px]">Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead class="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell class="font-medium">INV001</TableCell>
            <TableCell>Paid</TableCell>
            <TableCell>Credit Card</TableCell>
            <TableCell class="text-right">$250.00</TableCell>
          </TableRow>
          <TableRow>
            <TableCell class="font-medium">INV002</TableCell>
            <TableCell>Pending</TableCell>
            <TableCell>PayPal</TableCell>
            <TableCell class="text-right">$150.00</TableCell>
          </TableRow>
          <TableRow>
            <TableCell class="font-medium">INV003</TableCell>
            <TableCell>Unpaid</TableCell>
            <TableCell>Bank Transfer</TableCell>
            <TableCell class="text-right">$350.00</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </section>

    <Separator class="my-8" />

    <!-- Tabs Section -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold">Tabs</h2>
      <div class="w-full max-w-md">
        <TabsList>
          <TabsTrigger @click="activeTab = 'account'" :data-state="activeTab === 'account' ? 'active' : 'inactive'">Account</TabsTrigger>
          <TabsTrigger @click="activeTab = 'password'" :data-state="activeTab === 'password' ? 'active' : 'inactive'">Password</TabsTrigger>
          <TabsTrigger @click="activeTab = 'settings'" :data-state="activeTab === 'settings' ? 'active' : 'inactive'">Settings</TabsTrigger>
        </TabsList>
        <TabsContent v-if="activeTab === 'account'">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Manage your account settings here.</CardDescription>
            </CardHeader>
            <CardContent>
              <div class="grid gap-2">
                <Label for="name">Name</Label>
                <Input id="name" value="John Doe" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent v-if="activeTab === 'password'">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Change your password here.</CardDescription>
            </CardHeader>
            <CardContent>
              <div class="grid gap-2">
                <Label for="current">Current Password</Label>
                <Input id="current" type="password" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent v-if="activeTab === 'settings'">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Adjust your preferences.</CardDescription>
            </CardHeader>
            <CardContent>
              <div class="flex items-center gap-2">
                <Switch />
                <Label>Enable notifications</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </div>
    </section>
  </main>
</template>
