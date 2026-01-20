import * as React from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Textarea } from './components/ui/textarea';
import { Badge } from './components/ui/badge';
import { Skeleton } from './components/ui/skeleton';
import { Separator } from './components/ui/separator';
import { Switch } from './components/ui/switch';
import { Progress } from './components/ui/progress';
import { Checkbox } from './components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from './components/ui/avatar';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption
} from './components/ui/table';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from './components/ui/card';
import { Alert, AlertTitle, AlertDescription } from './components/ui/alert';

export function App() {
  const [clickCount, setClickCount] = React.useState(0);
  const [switchChecked, setSwitchChecked] = React.useState(false);
  const [checkboxChecked, setCheckboxChecked] = React.useState(false);
  const [progress, setProgress] = React.useState(33);

  return (
    <main className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">React Playground - shadcn/ui Components</h1>
      <p className="text-muted-foreground">
        These are the original React shadcn/ui components. Compare with the converted Svelte and Vue versions.
      </p>

      {/* Button Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Button Variants</h2>
        <div className="flex gap-2 flex-wrap">
          <Button variant="default">Default</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Button Sizes</h2>
        <div className="flex gap-2 items-center">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">🎯</Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Interactive Demo</h2>
        <div className="flex gap-4 items-center">
          <Button onClick={() => setClickCount(c => c + 1)}>
            Clicked {clickCount} times
          </Button>
          <Button variant="outline" onClick={() => setClickCount(0)}>
            Reset
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Disabled State</h2>
        <div className="flex gap-2">
          <Button disabled>Disabled Default</Button>
          <Button variant="destructive" disabled>Disabled Destructive</Button>
        </div>
      </section>

      <Separator className="my-8" />

      {/* Badge Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Badge Variants</h2>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="default">Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </section>

      <Separator className="my-8" />

      {/* Avatar Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Avatar</h2>
        <div className="flex gap-4 items-center">
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

      <Separator className="my-8" />

      {/* Input & Label Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Input & Label</h2>
        <div className="grid w-full max-w-sm gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input type="email" id="email" placeholder="Enter your email" />
        </div>
        <div className="grid w-full max-w-sm gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input type="password" id="password" placeholder="Enter password" />
        </div>
        <div className="grid w-full max-w-sm gap-1.5">
          <Label htmlFor="disabled-input">Disabled Input</Label>
          <Input id="disabled-input" placeholder="Can't edit this" disabled />
        </div>
      </section>

      <Separator className="my-8" />

      {/* Textarea Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Textarea</h2>
        <div className="grid w-full max-w-sm gap-1.5">
          <Label htmlFor="message">Message</Label>
          <Textarea id="message" placeholder="Type your message here..." />
        </div>
      </section>

      <Separator className="my-8" />

      {/* Switch Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Switch</h2>
        <div className="flex items-center gap-4">
          <Switch
            checked={switchChecked}
            onCheckedChange={setSwitchChecked}
          />
          <span className="text-sm">
            Switch is {switchChecked ? 'ON' : 'OFF'}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Switch disabled />
          <span className="text-sm text-muted-foreground">Disabled switch</span>
        </div>
      </section>

      <Separator className="my-8" />

      {/* Checkbox Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Checkbox</h2>
        <div className="flex items-center gap-2">
          <Checkbox
            id="terms"
            checked={checkboxChecked}
            onCheckedChange={(checked) => setCheckboxChecked(checked === true)}
          />
          <Label htmlFor="terms">Accept terms and conditions</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="disabled" disabled />
          <Label htmlFor="disabled" className="text-muted-foreground">Disabled checkbox</Label>
        </div>
      </section>

      <Separator className="my-8" />

      {/* Progress Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Progress</h2>
        <div className="w-full max-w-sm space-y-2">
          <Progress value={progress} />
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setProgress(p => Math.max(0, p - 10))}>-10%</Button>
            <Button size="sm" variant="outline" onClick={() => setProgress(p => Math.min(100, p + 10))}>+10%</Button>
            <span className="text-sm text-muted-foreground ml-2">{progress}%</span>
          </div>
        </div>
      </section>

      <Separator className="my-8" />

      {/* Skeleton Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Skeleton</h2>
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </section>

      <Separator className="my-8" />

      {/* Card Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Card Component</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>Card description goes here</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Card content with some text explaining something interesting.</p>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="outline">Cancel</Button>
              <Button>Submit</Button>
            </CardFooter>
          </Card>

          <Card className="border-destructive">
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

      <Separator className="my-8" />

      {/* Alert Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Alert</h2>
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

      <Separator className="my-8" />

      {/* Table Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Table</h2>
        <Table>
          <TableCaption>A list of recent invoices.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Invoice</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Method</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">INV001</TableCell>
              <TableCell>Paid</TableCell>
              <TableCell>Credit Card</TableCell>
              <TableCell className="text-right">$250.00</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">INV002</TableCell>
              <TableCell>Pending</TableCell>
              <TableCell>PayPal</TableCell>
              <TableCell className="text-right">$150.00</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">INV003</TableCell>
              <TableCell>Unpaid</TableCell>
              <TableCell>Bank Transfer</TableCell>
              <TableCell className="text-right">$350.00</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      <Separator className="my-8" />

      {/* Tabs Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Tabs</h2>
        <Tabs defaultValue="account" className="w-full max-w-md">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>Manage your account settings here.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" defaultValue="John Doe" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>Change your password here.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <Label htmlFor="current">Current Password</Label>
                  <Input id="current" type="password" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Adjust your preferences.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Switch />
                  <Label>Enable notifications</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </main>
  );
}
