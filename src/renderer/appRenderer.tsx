import { store } from '@renderer/store/RenderStore';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import App from './components/App';

// Render application in DOM
createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <HashRouter>
      <App />
    </HashRouter>
  </Provider>,
);
