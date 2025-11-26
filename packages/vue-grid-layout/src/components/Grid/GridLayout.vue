<script lang="ts" setup>
import type { Emitter, EventType } from 'mitt';
import type {
  EventsData,
  GridItemInstance,
  GridLayoutInstance,
  GridLayoutPlaceholder,
  GridLayoutProps,
  Layout,
  LayoutItem,
} from '../../types';
import elementResizeDetectorMaker from 'element-resize-detector';
import mitt from 'mitt';
import {
  defineEmits,
  defineExpose,
  defineOptions,
  defineProps,
  nextTick,
  onBeforeMount,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  useTemplateRef,
  watch,
  withDefaults,
} from 'vue';

import { addWindowEventListener, removeWindowEventListener } from '../../helpers/DOM';
import {
  findOrGenerateResponsiveLayout,
  getBreakpointFromWidth,
  getColsFromBreakpoint,
} from '../../helpers/responsiveUtils';
import {
  bottom,
  cloneLayout,
  compact,
  getAllCollisions,
  getLayoutItem,
  moveElement,
  validateLayout,
} from '../../helpers/utils';

import GridItem from './GridItem.vue';

defineOptions({
  name: 'GridLayout',
});

// GridLayoutProps Data
const props = withDefaults(defineProps<GridLayoutProps>(), {
  autoSize: true,
  colNum: 12,
  rowHeight: 100,
  maxRows: Infinity,
  margin: () => [10, 10],
  isDraggable: true,
  isResizable: true,
  isMirrored: false,
  isBounded: false,
  useCssTransforms: true,
  verticalCompact: true,
  restoreOnDrag: false,
  responsive: false,
  responsiveLayouts: () => ({}),
  transformScale: 1,
  breakpoints: () => ({ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }),
  cols: () => ({ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }),
  preventCollision: false,
  useStyleCursor: true,
});
// add listen
const emit = defineEmits<{
  'layoutCreated': [layout: Layout]
  'layoutBeforeMount': [layout: Layout]
  'layoutMounted': [layout: Layout]
  'layoutUpdated': [layout: Layout]
  'layoutReady': [layout: Layout]
  'update:layout': [layout: Layout]
  'breakpointChanged': [newBreakpoint: string, layout: Layout]
}>();

// self data
const width = ref<number | null>(null);
const mergeStyle = ref<{ [key: string]: string }>({});
// console.log(mergeStyle)

const lastLayoutLength = ref<number>(0);
const isDragging = ref<boolean>(false);
const placeholder = ref<GridLayoutPlaceholder>({ x: 0, y: 0, w: 0, h: 0, i: -1 });
const layouts = ref<{ [key: string]: Layout | any }>({}); // array to store all layouts from different breakpoints
const lastBreakpoint = ref<string | null>(null); // store last active breakpoint
const originalLayout = ref<Layout | null>(null);
const erd = ref<elementResizeDetectorMaker.Erd | null>(null);
const positionsBeforeDrag = ref<{ [key: string]: string }>();
// layout dom
const layoutRef = useTemplateRef<HTMLElement>('layoutRef');
// default grid item
const gridItemRef = useTemplateRef<GridItemInstance>('gridItemRef');
const eventBus: Emitter<{
  resizeEvent?: EventsData
  dragEvent?: EventsData
  updateWidth: number | null
  setColNum: number
  setRowHeight: number
  setDraggable: boolean
  setResizable: boolean
  setBounded: boolean
  setTransformScale: number
  setMaxRows: number
  compact: void
}> = mitt();

provide('eventBus', eventBus);

// Accessible references of functions for removing in beforeDestroy
function resizeEventHandler(data?: EventsData) {
  if (!data) {
    resizeEvent();
  }
  else {
    const { eventType, i, x, y, h, w } = data;
    resizeEvent(eventType, i, x, y, h, w);
  }
}

function dragEventHandler(data?: EventsData) {
  if (!data) {
    dragEvent();
  }
  else {
    const { eventType, i, x, y, h, w } = data;
    dragEvent(eventType, i, x, y, h, w);
  }
}

eventBus.on('resizeEvent', resizeEventHandler);
eventBus.on('dragEvent', dragEventHandler);
emit('layoutCreated', props.layout);

onBeforeUnmount(() => {
  eventBus.off('resizeEvent', resizeEventHandler);
  eventBus.off('dragEvent', dragEventHandler);
  removeWindowEventListener('resize', onWindowResize);
  if (erd.value) {
    erd.value.uninstall(layoutRef.value!);
  }
});

onBeforeMount(() => {
  emit('layoutBeforeMount', props.layout);
});
onMounted(() => {
  emit('layoutMounted', props.layout);
  nextTick(() => {
    validateLayout(props.layout);

    originalLayout.value = props.layout;
    nextTick(() => {
      initResponsiveFeatures();

      onWindowResize();

      // self.width = self.$el.offsetWidth;
      addWindowEventListener('resize', onWindowResize);

      compact(props.layout, props.verticalCompact);

      emit('layoutUpdated', props.layout);

      updateHeight();
      nextTick(() => {
        erd.value = elementResizeDetectorMaker({
          strategy: 'scroll', // <- For ultra performance.
          // See https://github.com/wnr/element-resize-detector/issues/110 about callOnAdd.
          callOnAdd: false,
        });
        erd.value.listenTo(layoutRef.value!, () => {
          onWindowResize();
        });
      });
    });
  });
});

watch(width, (newVal, oldVal) => {
  nextTick(() => {
    eventBus.emit('updateWidth', newVal);
    if (oldVal === null) {
      /*
        If oldval == null is when the width has never been
        set before. That only occurs when mouting is
        finished, and onWindowResize has been called and
        this.width has been changed the first time after it
        got set to null in the constructor. It is now time
        to issue layout-ready events as the GridItems have
        their sizes configured properly.

        The reason for emitting the layout-ready events on
        the next tick is to allow for the newly-emitted
        updateWidth event (above) to have reached the
        children GridItem-s and had their effect, so we're
        sure that they have the final size before we emit
        layout-ready (for this GridLayout) and
        item-layout-ready (for the GridItem-s).

        This way any client event handlers can reliably
        invistigate stable sizes of GridItem-s.
      */
      nextTick(() => {
        emit('layoutReady', props.layout);
      });
    }
    updateHeight();
  });
});
watch(
  () => props.layout,
  () => {
    layoutUpdate();
  },
);
watch(
  () => props.layout.length,
  () => {
    layoutUpdate();
  },
);

watch(
  () => props.colNum,
  (val) => {
    eventBus.emit('setColNum', val);
  },
);
watch(
  () => props.rowHeight,
  (val) => {
    eventBus.emit('setRowHeight', val);
  },
);
watch(
  () => props.isDraggable,
  (val) => {
    eventBus.emit('setDraggable', val);
  },
);
watch(
  () => props.isResizable,
  (val) => {
    eventBus.emit('setResizable', val);
  },
);
watch(
  () => props.isBounded,
  (val) => {
    eventBus.emit('setBounded', val);
  },
);

watch(
  () => props.transformScale,
  (val) => {
    eventBus.emit('setTransformScale', val);
  },
);
watch(
  () => props.responsive,
  (val) => {
    if (!val) {
      emit('update:layout', originalLayout.value || []);
      eventBus.emit('setColNum', props.colNum);
    }
    onWindowResize();
  },
);
watch(
  () => props.maxRows,
  (val) => {
    eventBus.emit('setMaxRows', val);
  },
);
watch(
  () => props.margin,
  () => {
    updateHeight();
  },
);

// methods
function layoutUpdate() {
  if (props.layout !== undefined && originalLayout.value !== null) {
    if (props.layout.length !== originalLayout.value.length) {
      // console.log("### LAYOUT UPDATE!", this.layout.length, this.originalLayout.length);

      const diff = findDifference(props.layout, originalLayout.value);
      if (diff.length > 0) {
        // console.log(diff);
        if (props.layout.length > originalLayout.value.length) {
          originalLayout.value = originalLayout.value.concat(diff);
        }
        else {
          originalLayout.value = originalLayout.value.filter((obj) => {
            return !diff.some((obj2) => {
              return obj.i === obj2.i;
            });
          });
        }
      }

      lastLayoutLength.value = props.layout.length;
      initResponsiveFeatures();
    }

    compact(props.layout, props.verticalCompact);
    eventBus.emit('updateWidth', width.value);
    updateHeight();
    emit('layoutUpdated', props.layout);
  }
}

function updateHeight() {
  mergeStyle.value = {
    height: containerHeight(),
  };
}

function onWindowResize() {
  if (layoutRef.value !== null && layoutRef.value !== undefined) {
    width.value = layoutRef.value.offsetWidth;
  }
  eventBus.emit('resizeEvent');
}

function containerHeight(): string {
  if (!props.autoSize)
    return '';
  // console.log("bottom: " + bottom(this.layout))
  // console.log("rowHeight + margins: " + (this.rowHeight + this.margin[1]) + this.margin[1])
  return `${bottom(props.layout) * (props.rowHeight + props.margin[1]) + props.margin[1]}px`;
}

function dragEvent(
  eventName?: EventType,
  id?: string | number,
  x?: number,
  y?: number,
  h?: number,
  w?: number,
) {
  // console.log(eventName + " id=" + id + ", x=" + x + ", y=" + y);
  let l = getLayoutItem(props.layout, id);

  // GetLayoutItem sometimes returns null object
  if (l === undefined || l === null) {
    l = { x: 0, y: 0 } as LayoutItem;
  }

  if (eventName === 'dragstart' && !props.verticalCompact) {
    positionsBeforeDrag.value = props.layout.reduce(
      (result, { i, x, y }) => ({
        ...result,
        [i]: { x, y },
      }),
      {},
    );
  }

  if (eventName === 'dragmove' || eventName === 'dragstart') {
    placeholder.value.i = id as string | number;
    placeholder.value.x = l.x as number;
    placeholder.value.y = l.y as number;
    placeholder.value.w = w as number;
    placeholder.value.h = h as number;
    nextTick(() => {
      isDragging.value = true;
    });
    // this.$broadcast("updateWidth", this.width);
    eventBus.emit('updateWidth', width.value);
  }
  else {
    nextTick(() => {
      isDragging.value = false;
    });
  }

  // Move the element to the dragged location.
  // this.layout = moveElement(this.layout, l, x, y, true, this.preventCollision)
  const layout = moveElement(props.layout, l, x, y, true, props.preventCollision);
  emit('update:layout', layout);

  if (props.restoreOnDrag) {
    // Do not compact items more than in layout before drag
    // Set moved item as static to avoid to compact it
    l.static = true;
    compact(props.layout, props.verticalCompact, positionsBeforeDrag.value);
    l.static = false;
  }
  else {
    compact(props.layout, props.verticalCompact);
  }

  // needed because vue can't detect changes on array element properties
  eventBus.emit('compact');
  updateHeight();
  if (eventName === 'dragend') {
    positionsBeforeDrag.value = undefined;
    emit('layoutUpdated', layout);
  }
}

function resizeEvent(
  eventName?: EventType,
  id?: string | number,
  x?: number,
  y?: number,
  h?: number,
  w?: number,
) {
  let l = getLayoutItem(props.layout, id);
  // GetLayoutItem sometimes return null object
  if (l === undefined || l === null) {
    l = { h: 0, w: 0 } as LayoutItem;
  }
  w = Number(w);
  h = Number(h);
  let hasCollisions;
  if (props.preventCollision) {
    const collisions = getAllCollisions(props.layout, { ...l, w, h }).filter(
      layoutItem => layoutItem.i !== l?.i,
    );
    hasCollisions = collisions.length > 0;

    // If we're colliding, we need adjust the placeholder.
    if (hasCollisions) {
      // adjust w && h to maximum allowed space
      let leastX = Infinity;
      let leastY = Infinity;
      collisions.forEach((layoutItem) => {
        if (layoutItem.x > Number(l?.x))
          leastX = Math.min(leastX, layoutItem.x);
        if (layoutItem.y > Number(l?.y))
          leastY = Math.min(leastY, layoutItem.y);
      });

      if (Number.isFinite(leastX))
        l.w = leastX - l.x;
      if (Number.isFinite(leastY))
        l.h = leastY - l.y;
    }
  }

  if (!hasCollisions) {
    // Set new width and height.
    l.w = w;
    l.h = h;
  }

  if (eventName === 'resizestart' || eventName === 'resizemove') {
    placeholder.value.i = id as string | number;
    placeholder.value.x = x as number;
    placeholder.value.y = y as number;
    placeholder.value.w = l.w as number;
    placeholder.value.h = l.h as number;
    nextTick(() => {
      isDragging.value = true;
    });
    // this.$broadcast("updateWidth", this.width);
    eventBus.emit('updateWidth', width.value);
  }
  else {
    nextTick(() => {
      isDragging.value = false;
    });
  }

  if (props.responsive)
    responsiveGridLayout();

  compact(props.layout, props.verticalCompact);
  eventBus.emit('compact');
  updateHeight();

  if (eventName === 'resizeend')
    emit('layoutUpdated', props.layout);
}

// finds or generates new layouts for set breakpoints
function responsiveGridLayout() {
  const newBreakpoint = getBreakpointFromWidth(props.breakpoints, width.value as number);
  const newCols = getColsFromBreakpoint(newBreakpoint, props.cols);

  // save actual layout in layouts
  if (lastBreakpoint.value != null && !layouts.value[lastBreakpoint.value])
    layouts.value[lastBreakpoint.value] = cloneLayout(props.layout);

  // Find or generate a new layout.
  const layout = findOrGenerateResponsiveLayout(
    originalLayout.value as Layout,
    layouts.value,
    props.breakpoints,
    newBreakpoint,
    lastBreakpoint.value as string,
    newCols,
    props.verticalCompact,
  );

  // Store the new layout.
  layouts.value[newBreakpoint] = layout;

  if (lastBreakpoint.value !== newBreakpoint) {
    emit('breakpointChanged', newBreakpoint, layout);
  }

  // new prop sync
  emit('update:layout', layout);

  lastBreakpoint.value = newBreakpoint;
  eventBus.emit('setColNum', getColsFromBreakpoint(newBreakpoint, props.cols));
}

// clear all responsive layouts
function initResponsiveFeatures() {
  layouts.value = Object.assign({}, props.responsiveLayouts);
}

// find difference in layouts
function findDifference(layout: Layout, originalLayout: Layout) {
  // Find values that are in result1 but not in result2
  const uniqueResultOne = layout.filter((obj) => {
    return !originalLayout.some((obj2) => {
      return obj.i === obj2.i;
    });
  });

  // Find values that are in result2 but not in result1
  const uniqueResultTwo = originalLayout.filter((obj) => {
    return !layout.some((obj2) => {
      return obj.i === obj2.i;
    });
  });

  // Combine the two arrays of unique entries#
  return uniqueResultOne.concat(uniqueResultTwo);
}

// Expose some property for this
defineExpose<GridLayoutInstance>({
  ...props,
  width,
  mergeStyle,
  lastLayoutLength,
  isDragging,
  placeholder,
  layouts,
  lastBreakpoint,
  originalLayout,
  erd,
  gridItemRef,
  dragEvent,
});
</script>

<template>
  <div ref="layoutRef" class="vue-grid-layout" :style="mergeStyle">
    <slot />
    <GridItem
      v-show="isDragging"
      ref="gridItemRef"
      class="vue-grid-placeholder"
      :x="placeholder.x"
      :y="placeholder.y"
      :w="placeholder.w"
      :h="placeholder.h"
      :i="placeholder.i"
    />
  </div>
</template>

<style lang="css">
.vue-grid-layout {
  position: relative;
  transition: height 200ms ease;
}
</style>
