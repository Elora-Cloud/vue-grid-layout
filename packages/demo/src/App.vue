<script lang="ts">
</script>

<script lang="ts" setup>
import { GridItem, GridLayout } from '@elora-cloud/vue-grid-layout';
import { markRaw, onMounted, ref } from 'vue';
import BarChart from './components/echart/BarChart.vue';

import LineChart from './components/echart/LineChart.vue';
import PieChart from './components/echart/PieChart.vue';
import { testData } from './test';

defineOptions({
  name: 'CardLayout',
});
const ComponentsLib = markRaw<any>({
  LineChart,
  BarChart,
  PieChart,
});
interface LayoutItemMore {
  x: number
  y: number
  w: number
  static?: boolean
  h: number
  i: string
  component: string
}
const mode = ref<boolean>(false);
// const layoutJSON = ref<Array<LayoutItemMore>>(testData)
const layoutJSON = ref<Array<LayoutItemMore>>(testData);

onMounted(() => {
  layoutJSON.value = testData;
});
</script>

<template>
  <div class="card-layout">
    <div class="mode-control">
      <button class="btn" :class="{ active: !mode }" @click="mode = false">
        show mode
      </button>
      <button class="btn" :class="{ active: mode }" @click="mode = true">
        edit mode
      </button>
    </div>
    <GridLayout
      v-model:layout="layoutJSON"
      :is-draggable="mode"
      :is-resizable="mode"
      :col-num="12"
      :row-height="30"
    >
      <GridItem
        v-for="item in layoutJSON"
        :key="item.i"
        v-slot="{ style }"
        class="l-item"
        :static="item.static"
        :x="item.x"
        :y="item.y"
        :w="item.w"
        :h="item.h"
        :i="item.i"
      >
        <div class="l-item-slot">
          <component
            :is="ComponentsLib[item.component]"
            v-if="item.component"
            :style-obj="style"
          />
        </div>
      </GridItem>
    </GridLayout>
  </div>
</template>

<style lang="scss" scoped>
.card-layout {
  overflow-x: scroll;
}

.l-item {
  border: 1px solid #ccc;
}

.mode-control {
  height: 50px;
  display: flex;
  padding-left: 10px;
  margin-top: 10px;

  .btn {
    width: 100px;
    border: none;
    border-radius: 3px;

    &:last-child {
      margin-left: 10px;
    }
  }

  .active {
    background-color: #87ceeb;
  }
}
</style>
