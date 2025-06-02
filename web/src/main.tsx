/*
React application bootstrap file.
Sets up the root React component with Secret.js context provider and renders the App.
*/

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SecretJsContextProvider } from './secretjs/SecretJsContext.tsx'
import { PollStoreProvider } from './context/PollStoreContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SecretJsContextProvider>
      <PollStoreProvider>
        <App />
      </PollStoreProvider>
    </SecretJsContextProvider>
  </StrictMode>,
)
