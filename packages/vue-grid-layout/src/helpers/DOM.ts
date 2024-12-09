import type { Direction } from '../types';

let currentDir: Direction = 'auto';

function hasDocument(): boolean {
  return typeof document !== 'undefined';
}

function hasWindow(): boolean {
  return typeof window !== 'undefined';
}

export function getDocumentDir(): Direction | string {
  if (!hasDocument()) {
    return currentDir;
  }
  const direction
    = typeof document.dir !== 'undefined'
      ? document.dir
      : document.getElementsByTagName('html')[0].getAttribute('dir') || 'auto';
  return direction;
}

export function setDocumentDir(dir: Direction): boolean {
  // export function setDocumentDir(dir){
  if (!hasDocument) {
    currentDir = dir;
    return false;
  }

  const html = document.getElementsByTagName('html')[0];
  html.setAttribute('dir', dir);
  return true;
}

export function addWindowEventListener(event: string, callback: () => any): boolean {
  if (!hasWindow) {
    callback();
    return false;
  }
  window.addEventListener(event, callback);
  return true;
}

export function removeWindowEventListener(event: string, callback: () => any) {
  if (!hasWindow) {
    return;
  }
  window.removeEventListener(event, callback);
}
