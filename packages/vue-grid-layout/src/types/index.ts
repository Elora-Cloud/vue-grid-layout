import type elementResizeDetectorMaker from 'element-resize-detector';
import type { EventType } from 'mitt';
import type { Ref, TemplateRef } from 'vue';

export const IS_UNITLESS: Record<string, boolean> = {
  animationIterationCount: true,
  boxFlex: true,
  boxFlexGroup: true,
  boxOrdinalGroup: true,
  columnCount: true,
  flex: true,
  flexGrow: true,
  flexPositive: true,
  flexShrink: true,
  flexNegative: true,
  flexOrder: true,
  gridRow: true,
  gridColumn: true,
  fontWeight: true,
  lineClamp: true,
  lineHeight: true,
  opacity: true,
  order: true,
  orphans: true,
  tabSize: true,
  widows: true,
  zIndex: true,
  zoom: true,

  // SVG-related properties
  fillOpacity: true,
  stopOpacity: true,
  strokeDashoffset: true,
  strokeOpacity: true,
  strokeWidth: true,
};

export type Layout = Array<LayoutItem>;

export type LayoutItem = LayoutItemRequired & {
  minW?: number
  minH?: number
  maxW?: number
  maxH?: number
  moved?: boolean
  static?: boolean
  isDraggable?: boolean
  isResizable?: boolean
};

export interface LayoutItemRequired {
  w: number
  h: number
  x: number
  y: number
  i: string
}

// export type Position = {left: number, top: number, width: number, height: number};
/*
export type DragCallbackData = {
  node: HTMLElement,
  x: number, y: number,
  deltaX: number, deltaY: number,
  lastX: number, lastY: number
};
*/

// export type DragEvent = {e: Event} & DragCallbackData;
export interface Size {
  width: number
  height: number
}

export interface TopLeftStyle {
  top: string
  left: string
  width: string
  height: string
  position: 'absolute'
}

/**
 * Just like the setTopLeft method, but instead, it will return a right property instead of left.
 *
 * @param top
 * @param right
 * @param width
 * @param height
 * @returns {{top: string, right: string, width: string, height: string, position: string}}
 */
export interface TopRightStyle {
  top: string
  right: string
  width: string
  height: string
  position: string
}

export interface TransformStyle {
  transform: string
  WebkitTransform: string
  MozTransform: string
  msTransform: string
  OTransform: string
  width: string
  height: string
  position: 'absolute' | 'relative'
}

export type Breakpoint = string;

export interface Breakpoints {
  lg?: number
  md?: number
  sm?: number
  xs?: number
  xxs?: number

  [key: string]: number | undefined
}

export interface ResponsiveLayout {
  lg?: Layout
  md?: Layout
  sm?: Layout
  xs?: Layout
  xxs?: Layout

  [key: Breakpoint]: Layout | undefined
}

export type Direction = 'ltr' | 'rtl' | 'auto';

export interface Point {
  x: number
  y: number
}

export interface DraggableCoreData {
  deltaX: number
  deltaY: number
  lastX: number
  lastY: number
  x: number
  y: number
}

export interface EventsData {
  eventType: string | symbol
  i: string | number
  x: number
  y: number
  h: number
  w: number
}

export interface GridItemPropsChild {
  isDraggable?: boolean | null
  isResizable?: boolean | null
  isBounded?: boolean | null
  static?: boolean
  minH?: number
  minW?: number
  maxH?: number
  maxW?: number
  x: number
  y: number
  w: number
  h: number
  i: string | number
  dragIgnoreFrom?: string
  dragAllowFrom?: string | null
  resizeIgnoreFrom?: string
  preserveAspectRatio?: boolean
  dragOption?: { [key: string]: any }
  resizeOption?: { [key: string]: any }
}

export interface GridItemPos {
  left?: number
  right?: number
  top: number
  width: number
  height: number
}

export interface GridItemWH {
  width: number
  height: number
}

export interface GridLayoutPlaceholder {
  x: number
  y: number
  w: number
  h: number
  i: number | string
}

export interface GridLayoutProps {
  autoSize?: boolean
  colNum?: number
  rowHeight?: number
  maxRows?: number
  margin?: Array<number>
  isDraggable?: boolean
  isResizable?: boolean
  isMirrored?: boolean
  isBounded?: boolean
  useCssTransforms?: boolean
  verticalCompact?: boolean
  restoreOnDrag?: boolean
  layout: Layout
  responsive?: boolean
  responsiveLayouts?: { [key: string]: any }
  transformScale?: number
  breakpoints?: { lg: number, md: number, sm: number, xs: number, xxs: number }
  cols?: { lg: number, md: number, sm: number, xs: number, xxs: number }
  preventCollision?: boolean
  useStyleCursor?: boolean
}

export interface GridLayoutLayoutData {
  width: number | null
  mergeStyle: { [key: string]: string }
  lastLayoutLength: number
  isDragging: boolean
  placeholder: GridLayoutPlaceholder
  layouts: { [key: string]: Layout | any }
  lastBreakpoint: string | null
  originalLayout: Layout | null
  erd: elementResizeDetectorMaker.Erd | null
  positionsBeforeDrag: { [key: string]: string }
  this$refsLayout: HTMLElement
}

export interface GridItemInstance extends GridItemPropsChild {
  autoSize: () => void
  dragging: Ref<GridItemPos | null>
  /**
   * Translate x and y coordinates from pixels to grid units.
   * @param  {number} top  Top position (relative to parent) in pixels.
   * @param  {number} left Left position (relative to parent) in pixels.
   * @return {object} x and y in grid units.
   */
  calcXY: (top: number, left: number) => { x: number, y: number }
}

export interface GridLayoutInstance extends GridLayoutProps {
  width: Ref<number | null>
  lastBreakpoint: Ref<string | null>
  lastLayoutLength: Ref<number>
  isDragging: Ref<boolean>
  erd: Ref<elementResizeDetectorMaker.Erd | null>
  originalLayout: Ref<Layout | null>
  placeholder: Ref<GridLayoutPlaceholder>
  mergeStyle: Ref<{ [key: string]: string }>
  layouts: Ref<{ [key: string]: Layout | any }>
  gridItemRef: TemplateRef<GridItemInstance>
  dragEvent: (
    eventName?: EventType,
    id?: string | number,
    x?: number,
    y?: number,
    h?: number,
    w?: number,
  ) => void
}
