import GridItem from "./Grid/GridItem.vue"
import GridLayout from "./Grid/GridLayout.vue"
import {App} from "vue"
export {GridItem, GridLayout}

const components = [GridLayout, GridItem]

const VueGridLayout = {
  install(App: App) {
    components.forEach(item => {
      App.component(item.name, item)
    })
  }
}

export default VueGridLayout
