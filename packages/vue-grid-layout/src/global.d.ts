/* eslint-disable */
/* prettier-ignore */
// @ts-nocheck
import "@vue/runtime-core";

export {};

declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    GridLayout: typeof import('@elora-cloud/vue-grid-layout')['GridLayout'];
    GridItem: typeof import('@elora-cloud/vue-grid-layout')['GridItem'];
  }
}
