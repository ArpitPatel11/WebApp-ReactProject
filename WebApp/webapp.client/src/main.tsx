import React from 'react'
import ReactDOM from 'react-dom/client'
//import App from './App.tsx'
import './index.css'
import './custom.scss';
import Routing from './app/components/app-routing.component'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Routing />
  </React.StrictMode>,
)
