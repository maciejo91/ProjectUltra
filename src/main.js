import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import { clickOutside } from '@/directives/clickOutside'
import i18n from './locales'
import { migrateSidebarStorage } from '@/utils/sidebarStorageMigration'
// Import main CSS - includes Tailwind, Motork theme, and custom styles
import './assets/css/main.css'

if (import.meta.env.DEV) {
  const renderFatalError = (title, error) => {
    const root = document.getElementById('app')
    if (!root) return

    const message = error instanceof Error ? error.stack || error.message : String(error)
    root.innerHTML = `
      <div style="padding:16px;font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;">
        <div style="font-weight:700;color:#b91c1c;margin-bottom:8px;">${title}</div>
        <pre style="white-space:pre-wrap;word-break:break-word;color:#111827;margin:0;">${message}</pre>
      </div>
    `
  }

  window.addEventListener('error', (event) => {
    renderFatalError('Unhandled error', event?.error ?? event?.message)
  })

  window.addEventListener('unhandledrejection', (event) => {
    renderFatalError('Unhandled promise rejection', event?.reason ?? event)
  })
}

migrateSidebarStorage()

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)
app.directive('click-outside', clickOutside)

app.mount('#app')
