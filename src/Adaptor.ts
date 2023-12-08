import type {
  IgnoreOption,
  RectifiableElement,
  ResponsiveLayoutOptions,
} from "./type";

/**
 * LayoutAdaptor is a utility class for adapting the layout based on specific design requirements.
 * It allows for dynamic scaling and rectification of elements based on the screen size.
 */
export class LayoutAdaptor {
  // Current render element's ID.
  private currentRenderElementId: string | null;

  // ID of the element that is currently being rectified.
  private currentElementRectificationId: string;

  // Level of rectification to be applied.
  private elementRectificationLevel: number;

  // Listener for resize events.
  private resizeListener: (() => void) | null;

  // Timer for handling delay in resize events.
  private timer: NodeJS.Timeout | null;

  // Current scale of the layout.
  private currScale: number;

  // Indicates whether the adaptor is currently running.
  private isAdaptorRunning: boolean;

  // Indicates whether an element is currently undergoing rectification.
  private isElRectification: boolean;

  constructor() {
    this.currentRenderElementId = null;
    this.currentElementRectificationId = "";
    this.elementRectificationLevel = 1;
    this.resizeListener = null;
    this.timer = null;
    this.currScale = 1;
    this.isAdaptorRunning = false;
    this.isElRectification = false;
  }

  /**
   * Initializes the layout adaptor with specified options or element ID.
   * @param options - Configuration options or an element ID for the adaptor.
   * @param isShowInitTip - Flag to show initialization log.
   */
  initialize(
    options: ResponsiveLayoutOptions | string = {},
    isShowInitTip: boolean = true
  ): void {
    if (isShowInitTip) {
      console.log(`%c Adaptor is running`, this.logStyle());
    }

    if (typeof options === "string") {
      options = { elementId: options };
    }

    const {
      designWidth = 1920,
      designHeight = 1080,
      elementId = "#app",
      enableResize = true,
      ignoreList = [],
      transitionDuration = "none",
      resizeDelay = 0,
    } = options;

    this.currentRenderElementId = elementId;
    const dom = document.querySelector<HTMLElement>(elementId);
    if (!dom) {
      console.error(`Adaptor: '${elementId}' is not exist`);
      return;
    }

    this.applyInitialStyles(dom, designHeight, designWidth);
    this.applyResponsiveScaling(designWidth, designHeight, dom, ignoreList);

    if (enableResize) {
      this.resizeListener = () => {
        this.timer && clearTimeout(this.timer);
        if (resizeDelay !== 0) {
          this.timer = setTimeout(() => {
            this.applyResponsiveScaling(
              designWidth,
              designHeight,
              dom,
              ignoreList
            );
            this.isElRectification &&
              this.applyElementRectification(
                this.currentElementRectificationId,
                this.elementRectificationLevel
              );
          }, resizeDelay);
        } else {
          this.applyResponsiveScaling(
            designWidth,
            designHeight,
            dom,
            ignoreList
          );
          this.isElRectification &&
            this.applyElementRectification(
              this.currentElementRectificationId,
              this.elementRectificationLevel
            );
        }
      };
      window.addEventListener("resize", this.resizeListener);
    }
    this.isAdaptorRunning = true;

    setTimeout(() => {
      dom.style.transition = `${transitionDuration}s`;
    });
  }

  /**
   * Deactivates the adaptor and cleans up resources.
   * @param el - The ID of the element to deactivate.
   */
  deactivate(el: string = "#app"): void {
    try {
      this.isElRectification = false;

      if (this.resizeListener) {
        window.removeEventListener("resize", this.resizeListener);
      }

      document.querySelector("#adaptor-style")?.remove();
      document.querySelector("#ignoreStyle")?.remove();

      const targetElement = document.querySelector<HTMLElement>(
        this.currentRenderElementId || el
      );
      targetElement?.setAttribute("style", "");

      this.isElRectification && this.offElRectification();
    } catch (error) {
      console.error(`Adaptor: Failed to remove normally`, error);
    } finally {
      if (this.isAdaptorRunning) {
        console.log(`%c Adaptor is off`, this.offLogStyle());
      }
      this.isAdaptorRunning = false;
    }
  }

  /**
   * Applies rectification to a specified element.
   * @param elementId - The ID of the element to rectify.
   * @param level - The level of rectification.
   */
  applyElementRectification(elementId: string, level: number = 1): void {
    if (!this.isAdaptorRunning) {
      console.error("Adaptor: Adaptor has not been initialized yet");
      return;
    }

    if (!elementId) {
      console.error(`Adaptor: bad selector: ${elementId}`);
      return;
    }

    this.currentElementRectificationId = elementId;
    this.elementRectificationLevel = level;
    const currEl = document.querySelectorAll<RectifiableElement>(elementId);
    if (currEl.length === 0) {
      console.error("Adaptor: elRectification found no element");
      return;
    }

    currEl.forEach((item) => {
      // 确保 originalWidth 和 originalHeight 已经被定义
      if (
        item.originalWidth === undefined ||
        item.originalHeight === undefined
      ) {
        if (!this.isElRectification) {
          item.originalWidth = item.clientWidth;
          item.originalHeight = item.clientHeight;
        } else {
          console.error("Adaptor: original dimensions are undefined");
          return;
        }
      }

      const rectification = this.currScale === 1 ? 1 : this.currScale * level;
      item.style.width = `${item.originalWidth * rectification}px`;
      item.style.height = `${item.originalHeight * rectification}px`;
      item.style.transform = `scale(${1 / this.currScale})`;
      item.style.transformOrigin = `0 0`;
    });

    this.isElRectification = true;
  }

  private offElRectification(): void {
    if (!this.currentElementRectificationId) return;
    document
      .querySelectorAll<HTMLElement>(this.currentElementRectificationId)
      .forEach((item) => {
        item.style.width = "";
        item.style.height = "";
        item.style.transform = "";
      });
  }

  private applyResponsiveScaling(
    designWidth: number,
    designHeight: number,
    dom: HTMLElement,
    ignoreList: (IgnoreOption | string)[]
  ): void {
    const clientHeight = document.documentElement.clientHeight;
    const clientWidth = document.documentElement.clientWidth;
    this.currScale =
      clientWidth / clientHeight < designWidth / designHeight
        ? clientWidth / designWidth
        : clientHeight / designHeight;
    dom.style.height = `${clientHeight / this.currScale}px`;
    dom.style.width = `${clientWidth / this.currScale}px`;
    dom.style.transform = `scale(${this.currScale})`;

    this.applyIgnoreStyles(dom, ignoreList);
  }

  private applyIgnoreStyles(
    dom: HTMLElement,
    ignoreList: (IgnoreOption | string)[]
  ): void {
    const ignoreStyleDOM =
      document.querySelector<HTMLStyleElement>("#ignoreStyle");
    if (!ignoreStyleDOM) {
      console.error("Adaptor: ignoreStyle element is not found");
      return;
    }

    ignoreStyleDOM.innerHTML = "";

    ignoreList.forEach((item) => {
      let selector: string;
      let style: IgnoreOption = {
        el: "",
      };

      if (typeof item === "string") {
        selector = item;
      } else {
        selector = item.el;
        style = item;
      }

      const realScale =
        style.scale !== undefined ? style.scale : 1 / this.currScale;
      const realFontSize =
        style.fontSize !== undefined ? `${style.fontSize}px` : "inherit";
      const realWidth = style.width !== undefined ? style.width : "auto";
      const realHeight = style.height !== undefined ? style.height : "auto";

      ignoreStyleDOM.innerHTML += `
        ${selector} {
          transform: scale(${realScale}) !important;
          transform-origin: 0 0;
          width: ${realWidth} !important;
          height: ${realHeight} !important;
        }
      `;

      if (style.fontSize) {
        ignoreStyleDOM.innerHTML += `
          ${selector} div, ${selector} span, ${selector} a, ${selector} * {
            font-size: ${realFontSize} !important;
          }
        `;
      }
    });
  }

  private applyInitialStyles(
    dom: HTMLElement,
    designHeight: number,
    designWidth: number
  ): void {
    const style = document.createElement("style");
    style.lang = "text/css";
    style.id = "adaptor-style";
    style.innerHTML = `body {overflow: hidden;}`;
    document.querySelector("body")?.appendChild(style);

    const ignoreStyle = document.createElement("style");
    ignoreStyle.lang = "text/css";
    ignoreStyle.id = "ignoreStyle";
    document.querySelector("body")?.appendChild(ignoreStyle);

    dom.style.height = `${designHeight}px`;
    dom.style.width = `${designWidth}px`;
    dom.style.transformOrigin = `0 0`;
    dom.style.overflow = "hidden";
  }

  private logStyle(): string {
    return `font-weight: bold; color: #ffffff; background:linear-gradient(-45deg, #0058ff 50%, #47caff 50% );background: -webkit-linear-gradient( 120deg, #0058ff 30%, #41d1ff ); padding: 4px 8px; border-radius: 4px;`;
  }

  private offLogStyle(): string {
    return `font-weight: bold;color: #707070; background: #e6e6e6; padding: 8px 12px; border-radius: 4px;`;
  }
}
