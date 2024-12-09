import type { App, Plugin } from 'vue';
import gridItem from './Grid/GridItem.vue';
import gridLayout from './Grid/GridLayout.vue';

type SFCWithInstall<T> = T & Plugin;
function withInstall<T, E extends Record<string, any>>(main: T, extra?: E) {
  ;(main as SFCWithInstall<T>).install = (app: App): void => {
    for (const comp of [main, ...Object.values(extra ?? {})]) {
      app.component(comp.name, comp);
    }
  };

  if (extra) {
    for (const [key, comp] of Object.entries(extra)) {
      ;(main as any)[key] = comp;
    }
  }
  return main as SFCWithInstall<T> & E;
}

export const GridItem = withInstall(gridItem);
export const GridLayout = withInstall(gridLayout);
export type GridItemInstance = InstanceType<typeof gridItem>;

export type GridLayoutInstance = InstanceType<typeof gridLayout>;
