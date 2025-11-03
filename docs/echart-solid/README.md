README.md

```markdown
# GitHub - alxnddr/echarts-solid: SolidJS components for ECharts

[![echarts-solid](https://camo.githubusercontent.com/b99557cc09898b7f4294867ac510442b9b1a0f25115424e9f60ac0ca905c0e2b/68747470733a2f2f6173736574732e736f6c69646a732e636f6d2f62616e6e65723f747970653d656368617274732d736f6c6964266261636b67726f756e643d74696c65732670726f6a6563743d253230)

](https://camo.githubusercontent.com/b99557cc09898b7f4294867ac510442b9b1a0f25115424e9f60ac0ca905c0e2b/68747470733a2f2f6173736574732e736f6c69646a732e636f6d2f62616e6e65723f747970653d656368617274732d736f6c6964266261636b67726f756e643d74696c65732670726f6a6563743d253230)

## echarts-solid

[](#echarts-solid)

[![pnpm](https://camo.githubusercontent.com/2eeacbcffaeaac8a4b60786f4bcfa38c1d4feca32a563f276d0f788e7de09776/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f6d61696e7461696e6564253230776974682d706e706d2d6363303066662e7376673f7374796c653d666f722d7468652d6261646765266c6f676f3d706e706d)

](https://pnpm.io/)

`echarts-solid` is a library that provides components for integrating ECharts with SolidJS apps. It includes two main components: `ECharts` and `EChartsAutoSize`, both designed to make it easier to work with ECharts in Solid-based projects.

## Quick start

[](#quick-start)

Install it:

```
npm i echarts-solid echarts
# or
yarn add echarts-solid echarts
# or
pnpm add echarts-solid echarts
```

Use it:

```
import { ECharts } from 'echarts-solid'

function MyChartComponent() {
  const options = {
    // ... your ECharts option here
  };

  return (
    <ECharts
      option={options}
      width={600}
      height={400}
    />
  );
}
```

For responsive charts, use the `EChartsAutoSize` component:

```
import { EChartsAutoSize } from 'echarts-solid'

function MyResponsiveChartComponent() {
  const options = {
    // ... your ECharts option here
  };

  return (
    <EChartsAutoSize
      option={options}
    />
  );
}
```

## Components

[](#components)

### ECharts

[](#echarts)

`ECharts` is a component that renders an ECharts chart with specified options and styles.

#### Props

[](#props)

- `option`: ECharts `option` object with data and configuration.

- `width`, `height`: The dimensions of the chart.

- `initOptions`: Optional parameters for the ECharts instance initialization.

- `notMerge`: Whether not to merge with previous `option`.

- `lazyUpdate`: Whether to update chart immediately.

- `isLoading`: Displays a loading animation when the chart is being prepared or data is being fetched.

- `loadingOptions`: The options for the loading animation.

- `resizeOptions`: Options to pass to ECharts' resize method.

- `theme`: Theme to be applied to the chart instance.

- `eventHandlers`: An object to attach event handlers to the chart instance.

- `onInit`: Callback function that is invoked with the chart instance when it is initialized.

- `class`, `style`: Standard HTML attributes for styling.

- `ref`: Ref of the div element that is used for the chart.

### EChartsAutoSize

[](#echartsautosize)

`EChartsAutoSize` is similar to `ECharts` but automatically adjusts its size based on its container's size.

#### Props

[](#props-1)

It has all the same props as ECharts, except for width and height because it adjusts to the chart element's size.

## Events

[](#events)

You can attach event handlers to different chart events by passing an `eventHandlers` object. Each key is the event name, and the value can be the handler function or an object with `query` for filtering and `handler` for the function itself.

```
const eventHandlers = {
  'click': (event: ECElementEvent) => {
    console.log('Chart is clicked!', event);
  }
};

<EChartsAutoSize
  option={options}
  eventHandlers={eventHandlers}
/>
```

## Loading State

[](#loading-state)

You can control the display of a loading animation by using the `isLoading` and `loadingOptions` props:

```
<EChartsAutoSize
  option={options}
  isLoading={true}
  loadingOptions={{ text: 'Data is loading...' }}
/>
```

## Contributing

[](#contributing)

Contributions to the `echarts-solid` library are encouraged and appreciated.

## License

[](#license)

`echarts-solid` is [MIT licensed](https://github.com/alxnddr/echarts-solid/blob/main/LICENSE).

Source: https://github.com/alxnddr/echarts-solid
```