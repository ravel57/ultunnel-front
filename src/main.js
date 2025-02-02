import { createApp } from 'vue'
import { Quasar } from 'quasar'

import '@quasar/extras/roboto-font-latin-ext/roboto-font-latin-ext.css'
import '@quasar/extras/material-icons/material-icons.css'

import 'quasar/src/css/index.sass'

import App from './App.vue'

const myApp = createApp(App)

myApp.use(Quasar, {
    plugins: {},
})

myApp.mount('#app')