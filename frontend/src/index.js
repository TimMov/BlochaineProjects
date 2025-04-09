import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { Web3ReactProvider } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';

// 1. Инициализация провайдера
function getLibrary(provider) {
  return new Web3Provider(provider, 31337); // chainId для Hardhat
}

// 2. Получаем корневой элемент
const container = document.getElementById('root');
const root = createRoot(container);

// 3. Рендеринг приложения
root.render(
  <StrictMode>
    <Web3ReactProvider getLibrary={getLibrary}>
      <App />
    </Web3ReactProvider>
  </StrictMode>
);