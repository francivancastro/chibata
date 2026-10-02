import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import '@/assets/styles/command-center.css'

import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { pt } from 'vuetify/locale'

const BANDEIRA = {
  marrom: '#663300',
  azul: '#0000ff',
  verde: '#006600',
  amarelo: '#fff000'
}

export default createVuetify({
  components,
  directives,

  locale: {
    locale: 'pt',
    messages: { pt }
  },

  theme: {
    defaultTheme: 'darkModular',
    themes: {
      darkModular: {
        dark: true,
        colors: {
          primary: '#00D084', 'on-primary': '#06251C',
          secondary: '#91A4C0', 'on-secondary': '#111827',
          accent: '#00E596', background: '#111827', surface: '#172033',
          'surface-variant': '#1D2940', 'on-surface': '#F1F5F9',
          'on-background': '#F1F5F9', 'on-surface-variant': '#91A4C0',
          error: '#F08A82', 'on-error': '#281214', info: '#91A4C0',
          success: '#00D084', warning: '#F0B35B'
        }
      },
      editorial: {
        dark: false,
        colors: {
          primary: '#10243A', 'on-primary': '#F4F0E7',
          secondary: '#B69A62', 'on-secondary': '#10243A',
          accent: '#B69A62', background: '#F4F0E7', surface: '#FBF9F4',
          'surface-variant': '#EBE4D8', 'on-surface': '#10243A',
          'on-background': '#10243A', 'on-surface-variant': '#59616B',
          error: '#9A5B50', 'on-error': '#F4F0E7', info: '#59616B',
          success: '#627B66', warning: '#A76F3D'
        }
      },
      obsidian: {
        dark: true,
        colors: {
          primary: '#A7D8CB', 'on-primary': '#12201D',
          secondary: '#A8AEAF', 'on-secondary': '#111315',
          accent: '#C1F0E4', background: '#111315', surface: '#181B1E',
          'surface-variant': '#202428', 'on-surface': '#F1F0EB',
          'on-background': '#F1F0EB', 'on-surface-variant': '#A8AEAF',
          error: '#E8A5A0', 'on-error': '#351716',
          info: '#A7D8CB', success: '#9FD5B1', warning: '#E2C18A',
        },
      },
      light: {
        colors: {
          primary: '#1371B4',
          secondary: BANDEIRA.marrom,
          accent: BANDEIRA.azul,
          error: '#FF5252',
          info: '#2196F3',
          success: BANDEIRA.verde,
          warning: BANDEIRA.amarelo
        }
      }
    }
  },
  defaults: {
    VBtn: { rounded: 'lg', elevation: 0 },
    VCard: { rounded: 'lg', elevation: 0 },
    VTextField: { variant: 'outlined', density: 'comfortable', rounded: 'lg', color: 'primary' },
    VSelect: { variant: 'outlined', density: 'comfortable', rounded: 'lg', color: 'primary' },
    VTextarea: { variant: 'outlined', density: 'comfortable', rounded: 'lg', color: 'primary' },
    VDataTable: { hover: true },
  }
})
