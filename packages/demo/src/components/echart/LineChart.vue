<script lang="ts" setup>
import type { ECharts, EChartsCoreOption } from 'echarts/core';
import { computed, onUpdated, ref } from 'vue';
import echarts from './index';

const props = defineProps<{
  styleObj: { width: string, height: string }
}>();

const styleObj = computed(() => {
  return {
    width: props.styleObj.width,
    height: props.styleObj.height,
  };
});
const bar = ref<HTMLElement>();
let ins: ECharts | null = null;
const option = {
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
  yAxis: {
    type: 'value',
  },
  series: [
    {
      data: [120, 200, 150, 80, 70, 110, 130],
      type: 'line',
      showBackground: true,
      backgroundStyle: {
        color: 'rgba(180, 180, 180, 0.2)',
      },
    },
  ],
};

onUpdated(() => {
  if (bar.value && !ins) {
    const w = getStyle(bar.value, 'width');
    if (w !== '0px') {
      ins = echarts.init(bar.value);
      render(ins, option);
    }
  }
  if (ins) {
    render(ins, option);
    ins.resize();
  }
});
function getStyle(dom: HTMLElement, attr: string) {
  // eslint-disable-next-line ts/ban-ts-comment
  // @ts-expect-error
  return window.getComputedStyle(dom, null)[attr];
}
function render(ins: ECharts, opt: EChartsCoreOption) {
  ins.setOption(opt);
}
</script>

<template>
  <div ref="bar" :style="styleObj" />
</template>

<style lang="scss" scoped></style>
