import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

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
    defaultTheme: 'light',
    themes: {
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
  }
})