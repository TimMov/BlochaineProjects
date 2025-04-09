import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Web3ReactProvider } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import App from './App';

function getLibrary(provider) {
  return new Web3Provider(provider, 31337); // Явно указываем chainId
}

const root = createRoot(document.getElementById('root'));

root.render(
  <StrictMode>
    <Web3ReactProvider getLibrary={getLibrary}>
      <App />
    </Web3ReactProvider>
  </StrictMode>
);