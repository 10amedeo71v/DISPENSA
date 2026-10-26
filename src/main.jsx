import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { migraDatePianoPasti, riparaIdDuplicati, pulisciPianoPasti } from './utils/migrazioni.js';

// Va eseguita prima che l'app legga i dati salvati (una sola volta per dispositivo).
migraDatePianoPasti();
riparaIdDuplicati();
pulisciPianoPasti();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
