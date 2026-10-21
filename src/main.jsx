import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { migraDatePianoPasti } from './utils/migrazioni.js';

// Va eseguita prima che l'app legga i dati salvati (una sola volta per dispositivo).
migraDatePianoPasti();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
