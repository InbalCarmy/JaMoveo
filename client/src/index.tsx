import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './context/AuthContext';  // ✅ מוסיפים את ה-Provider

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <AuthProvider>     {/* ✅ עוטף את כל האפליקציה */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();
