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
  title: {
    text: 'Referer of a Website',
    subtext: 'Fake Data',
    left: 'center',
  },
  tooltip: {
    trigger: 'item',
  },
  legend: {
    orient: 'vertical',
    left: 'left',
  },
  series: [
    {
      name: 'Access From',
      type: 'pie',
      radius: '50%',
      data: [
        { value: 1048, name: 'Search Engine' },
        { value: 735, name: 'Direct' },
        { value: 580, name: 'Email' },
        { value: 484, name: 'Union Ads' },
        { value: 300, name: 'Video Ads' },
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
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
