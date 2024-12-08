import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './src/App';

const rootNode = document.getElementById('root');

if (rootNode !== null) {
  const root = ReactDOM.createRoot(rootNode);

  (() => {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  })();
}
