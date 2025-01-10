import { memo } from 'react';
import {
	CartesianGrid,
	Label,
	Line,
	LineChart as OriginalLineChart,
	XAxis,
	YAxis,
} from 'recharts';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from './ui/card';
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from './ui/chart';
// import { TODOUHUKEN_COLOR_MAP } from '../consts/const';

interface ChartProps {
	currentChartData: ({
		date: string;
	} & {
		[region: string]: number;
	})[];
	selectedRegions: string[];
}

const chartConfig = {
	desktop: {
		label: 'Desktop',
		color: 'hsl(var(--chart-1))',
	},
} satisfies ChartConfig;

const LineChart = memo(function Chart({
	currentChartData,
	selectedRegions,
}: ChartProps) {
	const getPrefecture = (region: string) => {
		const match = region.match(/^(.*?[都道府県])/);
		return match ? match[1] : region;
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Line Chart</CardTitle>
				<CardDescription>January - June 2024</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig}>
					<OriginalLineChart
						// className="h-screen"
						data={currentChartData}
						margin={{
							top: 5,
							right: 30,
							left: 20,
							bottom: 5,
						}}
					>
						<CartesianGrid strokeDasharray='3 3' />
						{/* see: https://github.com/recharts/recharts/issues/843 */}
						<XAxis dataKey='date' height={20} fontSize={'0.75rem'} />
						<YAxis width={5} fontSize={'0rem'}>
							<Label
								style={{
									textAnchor: 'start',
									fontSize: '130%',
									fill: 'gray'
								}}
								angle={270}
								dy={-20}
								dx={-8}
								value={'Number of visitor'}
							/>
						</YAxis>
						{/* see: https://github.com/recharts/recharts/issues/787 */}
						<ChartTooltip
							cursor={false}
							content={<ChartTooltipContent hideLabel />}
							// wrapperStyleにて高さなどを変えたいという影響で、overflow: autoをつけている
							wrapperStyle={{
								pointerEvents: 'auto',
								maxHeight: '98%',
								overflow: 'auto',
							}}
							offset={1}
						/>
						{/* <Legend /> */}
						{selectedRegions.map((region) => (
							<Line
								key={region}
								type='monotone'
								dataKey={region}
								// stroke={TODOUHUKEN_COLOR_MAP[getPrefecture(region)]}
							/>
						))}
					</OriginalLineChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
});

export { LineChart };
