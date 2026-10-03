import 'vuetify/styles'
// Os ícones internos do Vuetify (setas de select, checkbox, paginação) usam o conjunto mdi.
import '@mdi/font/css/materialdesignicons.css'
import '@/assets/styles/chibata.css'

import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { pt } from 'vuetify/locale'

// Mesmos valores de src/assets/styles/chibata.css (--ch-*). Um tema só, claro.
export default createVuetify({
  components,
  directives,

  locale: {
    locale: 'pt',
    messages: { pt }
  },

  theme: {
    defaultTheme: 'chibata',
    themes: {
      chibata: {
        dark: false,
        colors: {
          background: '#F4F5F1',
          surface: '#FFFFFF',
          'surface-variant': '#ECEEE8',
          'on-background': '#16181B',
          'on-surface': '#16181B',
          'on-surface-variant': '#4A4F57',
          primary: '#2346D8',
          'on-primary': '#FFFFFF',
          secondary: '#16181B',
          'on-secondary': '#FFFFFF',
          error: '#B42318',
          'on-error': '#FFFFFF',
          info: '#2346D8',
          success: '#1F7A4A',
          warning: '#A35200'
        }
      }
    }
  },
  defaults: {
    VBtn: { elevation: 0 },
    VCard: { elevation: 0 },
    VTextField: { variant: 'outlined', density: 'comfortable', color: 'primary' },
    VSelect: { variant: 'outlined', density: 'comfortable', color: 'primary' },
    VTextarea: { variant: 'outlined', density: 'comfortable', color: 'primary' },
    VDataTable: { hover: true },
    VDataTableServer: { hover: true },
  }
})
