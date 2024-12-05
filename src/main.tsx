import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Properly initialize DOM with error handling
const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found in the document');
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);