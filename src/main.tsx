import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/manrope'
import '@fontsource-variable/inter'
import './index.css'
import App from './App.tsx'

const params = new URLSearchParams(window.location.search)
const printLang = params.get('print')

const root = createRoot(document.getElementById('root')!)

if (printLang === 'en' || printLang === 'bg') {
  // The print route is only used by the PDF generator — keep it out of
  // the main bundle.
  document.documentElement.lang = printLang
  document.documentElement.classList.add('print-mode')
  document.getElementById('boot-static')?.remove()
  document.getElementById('cv-static')?.remove()
  import('./print/PrintCV.tsx').then(({ PrintCV }) => {
    root.render(<PrintCV lang={printLang} />)
  })
} else {
  // The experience removes this overlay when the scene is ready. Reduced
  // motion skips that screen, so drop it immediately and show the document.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.getElementById('boot-static')?.remove()
  }
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
