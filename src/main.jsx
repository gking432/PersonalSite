import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import App from './App'
import './index.css'

// Nearly every section on this site reveals itself by animating a transform on
// scroll. `reducedMotion="user"` makes Framer drop transform and layout
// animations for visitors whose system asks for reduced motion, while still
// allowing opacity, which is not a vestibular trigger. Sections whose runway or
// pinning also needs to collapse handle that in their own stylesheet.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MotionConfig>
  </React.StrictMode>,
)
