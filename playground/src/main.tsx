import React from 'react';
import ReactDOM from 'react-dom/client';
import { Button } from './components/ui/button';
import './index.css';

function App() {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Component Converter Playground</h1>
      <p className="text-muted-foreground">
        Test shadcn components here before converting them.
      </p>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Button Variants</h2>
        <div className="flex gap-2 flex-wrap">
          <Button variant="default">Default</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Button Sizes</h2>
        <div className="flex gap-2 items-center">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
