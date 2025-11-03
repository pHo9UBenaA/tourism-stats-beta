/**
 * @file Chart panel for the domestic tourism dashboard.
 */
import type { EChartsOption } from "echarts";
import type { EChartsAutoSizeProps } from "echarts-solid";
import { Show, type Accessor, type JSX } from "solid-js";

import type { ChartState } from "../state/types";

type ChartSectionProps = {
	chartState: Accessor<ChartState>;
	chartOption: Accessor<EChartsOption | null>;
	chartComponent: Accessor<
		((props: EChartsAutoSizeProps) => JSX.Element) | null
	>;
};

const LOADING_MESSAGE = "Loading chart data…";

/**
 * Provide loading, error, and success render paths for the chart.
 */
export function ChartSection(props: ChartSectionProps) {
	return (
		<>
			<Show when={props.chartState().loading}>
				<div class="h-80 rounded-md border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
					{LOADING_MESSAGE}
				</div>
			</Show>

			<Show
				when={
					!props.chartState().loading &&
					props.chartState().data &&
					!props.chartState().data?.ok
				}
			>
				<div class="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-400 dark:bg-red-950 dark:text-red-100">
					{props.chartState().data?.error}
				</div>
			</Show>

			<Show
				when={
					!props.chartState().loading &&
					props.chartOption() &&
					props.chartComponent()
				}
			>
				<div class="h-80 w-full">
					{(() => {
						const Component = props.chartComponent();
						if (!Component) {
							return null;
						}
						return <Component option={props.chartOption()!} />;
					})()}
				</div>
			</Show>
		</>
	);
}
