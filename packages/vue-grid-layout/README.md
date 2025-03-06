# vue-grid-layout

This project js support by [vue-grid-layout](https://github.com/jbaysolutions/vue-grid-layout), but vue-grid-layout do not support vue3.

Grid layout for vue 3 with draggable, resize, responsive events

Rewrote to TypeScript, Composition API and migrated to Vue3

base on [vue3-grid-layout](https://github.com/xhlife/vue3-grid-layout)

## Vue 3 + TypeScript + Vite

### Usage
```js
import VueGridLayout from '@elora-cloud/vue-grid-layout';
import { createApp } from 'vue';
import App from './App.vue';
import '@elora-cloud/vue-grid-layout/dist/vue-grid-layout.css';

const app = createApp(App);

app.use(VueGridLayout);

app.mount('#app');
```
