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
  document.documentElement.classList.add('print-mode')
  document.getElementById('boot-static')?.remove()
  import('./print/PrintCV.tsx').then(({ PrintCV }) => {
    root.render(<PrintCV lang={printLang} />)
  })
} else {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
