export const IS_UNITLESS = {
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
  strokeWidth: true
}

export type Layout = Array<LayoutItem>

export type LayoutItem = LayoutItemRequired & {
  minW?: number
  minH?: number
  maxW?: number
  maxH?: number
  moved?: boolean
  static?: boolean
  isDraggable?: boolean
  isResizable?: boolean
}

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
export type Size = {width: number; height: number}

export interface TopLeftStyle {
  top: string
  left: string
  width: string
  height: string
  position: "absolute"
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
  position: "absolute" | "relative"
}
export type Breakpoint = string
export type Breakpoints = {lg?: number; md?: number; sm?: number; xs?: number; xxs?: number}
export type ResponsiveLayout = {lg?: Layout; md?: Layout; sm?: Layout; xs?: Layout; xxs?: Layout}
export type Direction = "ltr" | "rtl" | "auto"
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
