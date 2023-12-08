export interface IgnoreOption {
  el: string;
  height?: string;
  width?: string;
  scale?: number;
  fontSize?: number;
}

export interface ResponsiveLayoutOptions {
  elementId?: string;
  designWidth?: number;
  designHeight?: number;
  enableResize?: boolean;
  ignoreList?: (IgnoreOption | string)[];
  transitionDuration?: number;
  resizeDelay?: number;
}

export interface RectifiableElement extends HTMLElement {
  originalWidth?: number;
  originalHeight?: number;
}
