import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import './styles.css';

const root = document.getElementById('root');
if (!root) throw new Error('#root missing from index.html');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// devbar rides along in development only: the annotation toolbar that hands a
// clicked element — selector, computed styles, React source path — to an agent.
// Both imports sit behind `import.meta.env.DEV`, so the production bundle never
// sees them. `init` mounts its own container, outside the tree above.
if (import.meta.env.DEV) {
  void (async () => {
    const [{ init }] = await Promise.all([
      import('devbar.sh'),
      import('devbar.sh/styles.css'),
    ]);
    init({ theme: 'auto', position: 'bottom-right' });
  })();
}
