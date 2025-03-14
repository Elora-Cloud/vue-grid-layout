import type { ComponentInternalInstance } from 'vue';
import { getCurrentInstance } from 'vue';

export default function useCurrentInstance() {
  const { appContext, proxy } = getCurrentInstance() as ComponentInternalInstance;

  const globalProperties = appContext.config.globalProperties;

  return {
    proxy,
    appContext,
    globalProperties,
  };
}
