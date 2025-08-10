import VuePaycard from './components/VuePaycard.vue'

// plugin (opcional)
export default {
  install(app: any) {
    app.component('VuePaycard', VuePaycard)
  }
}

// named export
export { VuePaycard }