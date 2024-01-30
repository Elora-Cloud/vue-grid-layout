import type {App, Plugin} from "vue"
import {GridItem, GridLayout} from "./components"
import "./global.d.ts"
const components = [GridLayout, GridItem]

const VueGridLayout: Plugin = {
  install(App: App) {
    components.forEach(item => {
      App.use(item)
    })
  }
}

export default VueGridLayout
