import type {App, Plugin} from "vue"
import {GridItem, GridLayout} from "./components"
const components = [GridLayout, GridItem]
export * from './components'
const VueGridLayout: Plugin = {
  install(App: App) {
    components.forEach(item => {
      App.use(item)
    })
  }
}

export default VueGridLayout
