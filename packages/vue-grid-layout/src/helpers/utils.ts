/* The following list is defined in React's core */
import type {
  Layout,
  LayoutItem,
  TopLeftStyle,
  TopRightStyle,
  TransformStyle,
} from '../types';
import {
  IS_UNITLESS,
} from '../types';
/**
 * Will add px to the end of style values which are Numbers.
 * @param name
 * @param value
 * @return {*}
 */
export function addPx(name: string, value: number | string) {
  if (typeof value === 'number' && !IS_UNITLESS[name]) {
    return `${value}px`;
  }
  else {
    return value;
  }
}

// Flow can't really figure this out, so we just use Object
export function autoBindHandlers(el: HTMLElement, fns: Array<string>): void {
  fns.forEach(key => (el[key] = el[key].bind(el)));
}

// export type ResizeEvent = {e: Event, node: HTMLElement, size: Size};
// const isProduction = process.env.NODE_ENV === 'production';
/**
 * Return the bottom coordinate of the layout.
 *
 * @param  {Array} layout Layout array.
 * @return {number}       Bottom coordinate.
 */
export function bottom(layout: Layout): number {
  let max = 0;
  let bottomY;

  for (let i = 0, len = layout.length; i < len; i++) {
    bottomY = layout[i].y + layout[i].h;
    if (bottomY > max)
      max = bottomY;
  }
  return max;
}

export function cloneLayout(layout: Layout): Layout {
  const newLayout: Layout = Array.from({ length: layout.length });

  for (let i = 0, len = layout.length; i < len; i++) {
    newLayout[i] = cloneLayoutItem(layout[i]);
  }
  return newLayout;
}

// Fast path to cloning, since this is monomorphic
export function cloneLayoutItem(layoutItem: LayoutItem): LayoutItem {
  /* return {
    w: layoutItem.w, h: layoutItem.h, x: layoutItem.x, y: layoutItem.y, i: layoutItem.i,
    minW: layoutItem.minW, maxW: layoutItem.maxW, minH: layoutItem.minH, maxH: layoutItem.maxH,
    moved: Boolean(layoutItem.moved), static: Boolean(layoutItem.static),
    // These can be null
    isDraggable: layoutItem.isDraggable, isResizable: layoutItem.isResizable
  }; */
  return JSON.parse(JSON.stringify(layoutItem));
}

/**
 * Given two layoutitems, check if they collide.
 *
 * @return {boolean}   True if colliding.
 */
export function collides(l1: LayoutItem, l2: LayoutItem): boolean {
  if (l1 === l2)
    return false; // same element
  if (l1.x + l1.w <= l2.x)
    return false; // l1 is left of l2
  if (l1.x >= l2.x + l2.w)
    return false; // l1 is right of l2
  if (l1.y + l1.h <= l2.y)
    return false; // l1 is above l2
  if (l1.y >= l2.y + l2.h)
    return false; // l1 is below l2
  return true; // boxes overlap
}

/**
 * Given a layout, compact it. This involves going down each y coordinate and removing gaps
 * between items.
 *
 * @param  {Array} layout Layout.
 * @param  {boolean} verticalCompact Whether or not to compact the layout
 *   vertically.
 * @param {object} minPositions
 * @return {Array}       Compacted Layout.
 */
export function compact(layout: Layout, verticalCompact: boolean, minPositions?: any): Layout {
  // Statics go in the compareWith array right away so items flow around them.
  const compareWith = getStatics(layout);
  // We go through the items by row and column.
  const sorted = sortLayoutItemsByRowCol(layout);
  // Holding for new items.
  const out: Layout = Array.from({ length: layout.length });

  for (let i = 0, len = sorted.length; i < len; i++) {
    let l = sorted[i];

    // Don't move static elements
    if (!l.static) {
      l = compactItem(compareWith, l, verticalCompact, minPositions);

      // Add to comparison array. We only collide with items before this one.
      // Statics are already in this array.
      compareWith.push(l);
    }

    // Add to output array to make sure they still come out in the right order.
    out[layout.indexOf(l)] = l;

    // Clear moved flag, if it exists.
    l.moved = false;
  }

  return out;
}

/**
 * Compact an item in the layout.
 */
export function compactItem(
  compareWith: Layout,
  l: LayoutItem,
  verticalCompact: boolean,
  minPositions?: any,
): LayoutItem {
  if (verticalCompact) {
    // Move the element up as far as it can go without colliding.
    while (l.y > 0 && !getFirstCollision(compareWith, l)) {
      l.y--;
    }
  }
  else if (minPositions) {
    const minY = minPositions[l.i].y;

    while (l.y > minY && !getFirstCollision(compareWith, l)) {
      l.y--;
    }
  }

  // Move it down, and keep moving it down if it's colliding.
  let collides;

  // eslint-disable-next-line no-cond-assign
  while ((collides = getFirstCollision(compareWith, l))) {
    l.y = collides.y + collides.h;
  }
  return l;
}

/**
 * Given a layout, make sure all elements fit within its bounds.
 *
 * @param  {Array} layout Layout array.
 * @param  {number} bounds Number of columns.
 */
export function correctBounds(layout: Layout, bounds: { cols: number }): Layout {
  const collidesWith = getStatics(layout);

  for (let i = 0, len = layout.length; i < len; i++) {
    const l = layout[i];
    // Overflows right

    if (l.x + l.w > bounds.cols)
      l.x = bounds.cols - l.w;
    // Overflows left
    if (l.x < 0) {
      l.x = 0;
      l.w = bounds.cols;
    }
    if (!l.static) {
      collidesWith.push(l);
    }
    else {
      // If this is static and collides with other statics, we must move it down.
      // We have to do something nicer than just letting them overlap.
      while (getFirstCollision(collidesWith, l)) {
        l.y++;
      }
    }
  }
  return layout;
}

export function createMarkup(obj: JSStyle): string {
  const keys = Object.keys(obj);

  if (!keys.length)
    return '';
  let i;
  const len = keys.length;
  let result = '';

  for (i = 0; i < len; i++) {
    const key = keys[i];
    const val = obj[key];

    result += `${hyphenate(key)}:${addPx(key, val)};`;
  }

  return result;
}

export function findAndRemove(array: Array<any>, property: string, value: any) {
  array.forEach((result, index) => {
    if (result[property] === value) {
      // Remove from array
      array.splice(index, 1);
    }
  });
}

export function findItemInArray(array: Array<any>, property: string, value: any) {
  for (let i = 0; i < array.length; i++) {
    if (array[i][property] === value)
      return true;
  }

  return false;
}

export function getAllCollisions(layout: Layout, layoutItem: LayoutItem): Array<LayoutItem> {
  return layout.filter(l => collides(l, layoutItem));
}

/**
 * Returns the first item this layout collides with.
 * It doesn't appear to matter which order we approach this from, although
 * perhaps that is the wrong thing to do.
 *
 * @param  {object} layout Layout.
 * @param  {object} layoutItem Layout item.
 * @return {object | undefined}  A colliding layout item, or undefined.
 */
export function getFirstCollision(layout: Layout, layoutItem: LayoutItem): LayoutItem | undefined {
  for (let i = 0, len = layout.length; i < len; i++) {
    if (collides(layout[i], layoutItem))
      return layout[i];
  }
}

/**
 * Get a layout item by ID. Used so we can override later on if necessary.
 *
 * @param  {Array}  layout Layout array.
 * @param  {string} id     ID
 * @return {LayoutItem}    Item at ID.
 */
export function getLayoutItem(
  layout: Layout,
  id: string | number | undefined,
): LayoutItem | undefined {
  for (let i = 0, len = layout.length; i < len; i++) {
    if (layout[i].i === id)
      return layout[i];
  }
}

/**
 * Get all static elements.
 * @param  {Array} layout Array of layout objects.
 * @return {Array}        Array of static layout items..
 */
export function getStatics(layout: Layout): Array<LayoutItem> {
  // return [];
  return layout.filter(l => l.static);
}
/**
 * Hyphenate a camelCase string.
 *
 * @param {string} str
 * @return {string}
 */
export const hyphenateRE = /([a-z\d])([A-Z])/g;

export function hyphenate(str: string) {
  return str.replace(hyphenateRE, '$1-$2').toLowerCase();
}

/**
 * Move an element. Responsible for doing cascading movements of other elements.
 *
 * @param  {Array}      layout Full layout to modify.
 * @param  {LayoutItem} l      element to move.
 * @param  {number}     [x]    X position in grid units.
 * @param  {number}     [y]    Y position in grid units.
 * @param  {boolean}    [isUserAction] If true, designates that the item we're moving is
 *                                     being dragged/resized by th euser.
 */
export function moveElement(
  layout: Layout,
  l: LayoutItem,
  x: number | undefined,
  y: number | undefined,
  isUserAction?: boolean,
  preventCollision?: boolean,
): Layout {
  if (l.static)
    return layout;

  // Short-circuit if nothing to do.
  // if (l.y === y && l.x === x) return layout;

  const oldX = l.x;
  const oldY = l.y;

  const movingUp = y && l.y > y;
  // This is quite a bit faster than extending the object

  if (typeof x === 'number')
    l.x = x;
  if (typeof y === 'number')
    l.y = y;
  l.moved = true;

  // If this collides with anything, move it.
  // When doing this comparison, we have to sort the items we compare with
  // to ensure, in the case of multiple collisions, that we're getting the
  // nearest collision.
  let sorted = sortLayoutItemsByRowCol(layout);

  if (movingUp)
    sorted = sorted.reverse();
  const collisions = getAllCollisions(sorted, l);

  if (preventCollision && collisions.length) {
    l.x = oldX;
    l.y = oldY;
    l.moved = false;
    return layout;
  }

  // Move each item that collides away from this element.
  for (let i = 0, len = collisions.length; i < len; i++) {
    const collision = collisions[i];
    // console.log('resolving collision between', l.i, 'at', l.y, 'and', collision.i, 'at', collision.y);

    // Short circuit so we can't infinite loop
    if (collision.moved)
      continue;

    // This makes it feel a bit more precise by waiting to swap for just a bit when moving up.
    if (l.y > collision.y && l.y - collision.y > collision.h / 4)
      continue;

    // Don't move static items - we have to move *this* element away
    if (collision.static) {
      layout = moveElementAwayFromCollision(layout, collision, l, isUserAction);
    }
    else {
      layout = moveElementAwayFromCollision(layout, l, collision, isUserAction);
    }
  }

  return layout;
}

/**
 * This is where the magic needs to happen - given a collision, move an element away from the collision.
 * We attempt to move it up if there's room, otherwise it goes below.
 *
 * @param  {Array} layout            Full layout to modify.
 * @param  {LayoutItem} collidesWith Layout item we're colliding with.
 * @param  {LayoutItem} itemToMove   Layout item we're moving.
 * @param  {boolean} [isUserAction]  If true, designates that the item we're moving is being dragged/resized
 *                                   by the user.
 */
export function moveElementAwayFromCollision(
  layout: Layout,
  collidesWith: LayoutItem,
  itemToMove: LayoutItem,
  isUserAction?: boolean,
): Layout {
  const preventCollision = false; // we're already colliding
  // If there is enough space above the collision to put this element, move it there.
  // We only do this on the main collision as this can get funky in cascades and cause
  // unwanted swapping behavior.

  if (isUserAction) {
    // Make a mock item so we don't modify the item here, only modify in moveElement.
    const fakeItem: LayoutItem = {
      x: itemToMove.x,
      y: itemToMove.y,
      w: itemToMove.w,
      h: itemToMove.h,
      i: '-1',
    };

    fakeItem.y = Math.max(collidesWith.y - itemToMove.h, 0);
    if (!getFirstCollision(layout, fakeItem)) {
      return moveElement(layout, itemToMove, undefined, fakeItem.y, preventCollision);
    }
  }
  /*
  layout: Layout,
  l: LayoutItem,
  x: number,
  y: number,
  isUserAction: boolean,
  preventCollision: boolean
  */
  // Previously this was optimized to move below the collision directly, but this can cause problems
  // with cascading moves, as an item may actually leapflog a collision and cause a reversal in order.
  return moveElement(layout, itemToMove, undefined, itemToMove.y + 1, preventCollision);
}

/**
 * Convert a JS object to CSS string. Similar to React's output of CSS.
 * @param obj
 * @returns {string}
 */
interface JSStyle {
  [key: string]: string
}

/**
 * Helper to convert a number to a percentage string.
 *
 * @param  {number} num Any number
 * @return {string}     That number as a percentage.
 */
export function perc(num: number): string {
  return `${num * 100}%`;
}

export function setTopLeft(top: number, left: number, width: number, height: number): TopLeftStyle {
  return {
    top: `${top}px`,
    left: `${left}px`,
    width: `${width}px`,
    height: `${height}px`,
    position: 'absolute',
  };
}

export function setTopRight(
  top: number,
  right: number,
  width: number,
  height: number,
): TopRightStyle {
  return {
    top: `${top}px`,
    right: `${right}px`,
    width: `${width}px`,
    height: `${height}px`,
    position: 'absolute',
  };
}

export function setTransform(
  top: number,
  left: number,
  width: number,
  height: number,
): TransformStyle {
  // Replace unitless items with px
  const translate = `translate3d(${left}px,${top}px, 0)`;

  return {
    transform: translate,
    WebkitTransform: translate,
    MozTransform: translate,
    msTransform: translate,
    OTransform: translate,
    width: `${width}px`,
    height: `${height}px`,
    position: 'absolute',
  };
}

/**
 * Just like the setTransform method, but instead it will return a negative value of right.
 *
 * @param top
 * @param right
 * @param width
 * @param height
 * @return {{transform: string, WebkitTransform: string, MozTransform: string, msTransform: string, OTransform: string, width: string, height: string, position: string}}
 */
export function setTransformRtl(
  top: number,
  right: number,
  width: number,
  height: number,
): TransformStyle {
  // Replace unitless items with px
  const translate = `translate3d(${right * -1}px,${top}px, 0)`;

  return {
    transform: translate,
    WebkitTransform: translate,
    MozTransform: translate,
    msTransform: translate,
    OTransform: translate,
    width: `${width}px`,
    height: `${height}px`,
    position: 'absolute',
  };
}

/**
 * Get layout items sorted from top left to right and down.
 *
 * @return {Array} Array of layout objects.
 * @return {Array}        Layout, sorted static items first.
 */
export function sortLayoutItemsByRowCol(layout: Layout): Layout {
  const a: Array<LayoutItem> = [];

  return a.concat(layout).sort((a, b) => {
    if (a.y === b.y && a.x === b.x) {
      return 0;
    }

    if (a.y > b.y || (a.y === b.y && a.x > b.x)) {
      return 1;
    }

    return -1;
  });
}

/**
 * Generate a layout using the initialLayout and children as a template.
 * Missing entries will be added, extraneous ones will be truncated.
 *
 * @param  {Array}  initialLayout Layout passed in through props.
 * @param  {string} breakpoint    Current responsive breakpoint.
 * @param  {boolean} verticalCompact Whether or not to compact the layout vertically.
 * @return {Array}                Working layout.
 */
/*
export function synchronizeLayoutWithChildren(initialLayout: Layout, children: Array<React.Element>|React.Element,
                                              cols: number, verticalCompact: boolean): Layout {
  // ensure 'children' is always an array
  if (!Array.isArray(children)) {
    children = [children];
  }
  initialLayout = initialLayout || [];

  // Generate one layout item per child.
  let layout: Layout = [];
  for (let i = 0, len = children.length; i < len; i++) {
    let newItem;
    const child = children[i];

    // Don't overwrite if it already exists.
    const exists = getLayoutItem(initialLayout, child.key || "1" /!* FIXME satisfies Flow *!/);
    if (exists) {
      newItem = exists;
    } else {
      const g = child.props._grid;

      // Hey, this item has a _grid property, use it.
      if (g) {
        if (!isProduction) {
          validateLayout([g], 'ReactGridLayout.children');
        }
        // Validated; add it to the layout. Bottom 'y' possible is the bottom of the layout.
        // This allows you to do nice stuff like specify {y: Infinity}
        if (verticalCompact) {
          newItem = cloneLayoutItem({...g, y: Math.min(bottom(layout), g.y), i: child.key});
        } else {
          newItem = cloneLayoutItem({...g, y: g.y, i: child.key});
        }
      }
      // Nothing provided: ensure this is added to the bottom
      else {
        newItem = cloneLayoutItem({w: 1, h: 1, x: 0, y: bottom(layout), i: child.key || "1"});
      }
    }
    layout[i] = newItem;
  }

  // Correct the layout.
  layout = correctBounds(layout, {cols: cols});
  layout = compact(layout, verticalCompact);

  return layout;
}
*/
/**
 * Validate a layout. Throws errors.
 *
 * @param  {Array}  layout        Array of layout items.
 * @param  {string} [contextName] Context name for errors.
 * @throw  {Error}                Validation error.
 */
export function validateLayout(layout: Layout, contextName?: string): void {
  contextName = contextName || 'Layout';
  const subProps = ['x', 'y', 'w', 'h'];
  const keyArr: string[] = [];

  if (!Array.isArray(layout))
    throw new Error(`${contextName} must be an array!`);
  for (let i = 0, len = layout.length; i < len; i++) {
    const item = layout[i];

    for (let j = 0; j < subProps.length; j++) {
      if (typeof item[subProps[j]] !== 'number') {
        throw new TypeError(`VueGridLayout: ${contextName}[${i}].${subProps[j]} must be a number!`);
      }
    }

    if (item.i === undefined || item.i === null) {
      throw new Error(`VueGridLayout: ${contextName}[${i}].i cannot be null!`);
    }

    if (typeof item.i !== 'number' && typeof item.i !== 'string') {
      throw new TypeError(`VueGridLayout: ${contextName}[${i}].i must be a string or number!`);
    }

    if (keyArr.includes(item.i)) {
      throw new Error(`VueGridLayout: ${contextName}[${i}].i must be unique!`);
    }
    keyArr.push(item.i);

    if (item.static !== undefined && typeof item.static !== 'boolean') {
      throw new Error(`VueGridLayout: ${contextName}[${i}].static must be a boolean!`);
    }
  }
}
