import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

const colorTheme = {
  dark: false,
  colors: {
    primary: '#FFE1CA',
    secondary: '#8D0040',
    accent: '#E3257B',
    peach: '#BBE000',
  },
}

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'colorTheme', // ✅ tell Vuetify which theme to use
    themes: {
      colorTheme, // ✅ register the actual theme object here
    },
  },
})
