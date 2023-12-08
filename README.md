# LayoutAdaptor

## Overview

`LayoutAdaptor` is a utility class designed to adapt the layout of web elements dynamically based on screen size. It provides functionality for scaling and rectifying elements to fit different display requirements.

## Constructor

- `constructor()`: Initializes a new instance of the `LayoutAdaptor` class.

## Methods

### `initialize(options: ResponsiveLayoutOptions | string, isShowInitTip: boolean): void`

Initializes the layout adaptor with specified configuration options.

- `options`: Object containing configuration settings. Can also be a string representing an element ID.
- `isShowInitTip`: Flag indicating whether to display the initialization log.

### `deactivate(elementId: string): void`

Deactivates the adaptor and cleans up resources.

- `elementId`: The ID of the element to deactivate.

### `applyElementRectification(elementId: string, level: number): void`

Applies rectification to a specified element.

- `elementId`: The ID of the element to rectify.
- `level`: The level of rectification to be applied.

## Usage

Example of how to use `LayoutAdaptor`:

```typescript
const adaptor = new LayoutAdaptor();
adaptor.initialize(
  {
    elementId: "#app",
    designWidth: 1920,
    designHeight: 1080,
    enableResize: true,
  },
  true
);
```
