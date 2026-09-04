import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import App from './App'
import './index.css'

export function render(pathname) {
  return renderToString(
    <StaticRouter location={pathname}>
      <App />
    </StaticRouter>,
  )
}
