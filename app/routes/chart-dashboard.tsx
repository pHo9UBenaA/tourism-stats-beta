import type { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from 'app/components/ui/select';
import { Indexes, TabTitle } from 'app/constants/digital-tourism-stats';
import {
	fetchMunicipalityData,
	fetchPrefectureData,
} from 'app/data/digital/getData';
import { DigitalTourismStats } from 'app/features/digital-tourism-stats-chart';
import type { TabType } from 'app/types/digital-tourism-stats';
import { useState } from 'react';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '../components/ui/accordion';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';

export async function loader({ request }: LoaderFunctionArgs) {
	const prefecture = await fetchPrefectureData();
	const municipality = await fetchMunicipalityData();
	return { prefecture, municipality };
}

const isTab = (value: string): value is TabType => {
	return Object.values(Indexes).includes(value as TabType);
};

export default function ChartDashboard() {
	const data = useLoaderData<typeof loader>();

	const [tab, setTab] = useState<TabType>(Indexes.prefecture);

	const onTabChange = (value: string) => {
		if (isTab(value)) {
			setTab(value);
		}
	};

	return (
		<div>
			<h1 className='text-3xl font-bold tracking-tight pb-5'>
				Tourism Statistics Chart
			</h1>

			<Accordion
				type='single'
				collapsible
				className='w-full'
				defaultValue='domestic'
			>
				<AccordionItem value='domestic'>
					<AccordionTrigger className='text-lg'>
						Domestic Tourism Information
					</AccordionTrigger>
					<AccordionContent>
						<div className='space-y-4'>
							<div className='flex flex-wrap gap-4'>
								<Select>
									<SelectTrigger className='w-[180px]'>
										<SelectValue placeholder='Select a fruit' />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											<SelectLabel>Fruits</SelectLabel>
											<SelectItem value='apple'>Apple</SelectItem>
											<SelectItem value='banana'>Banana</SelectItem>
											<SelectItem value='blueberry'>Blueberry</SelectItem>
											<SelectItem value='grapes'>Grapes</SelectItem>
											<SelectItem value='pineapple'>Pineapple</SelectItem>
										</SelectGroup>
									</SelectContent>
								</Select>
								<Tabs
									defaultValue={Indexes.prefecture}
									onValueChange={onTabChange}
								>
									<TabsList>
										<TabsTrigger value={Indexes.prefecture}>
											{TabTitle.prefecture}
										</TabsTrigger>
										<TabsTrigger value={Indexes.municipality}>
											{TabTitle.municipality}
										</TabsTrigger>
									</TabsList>
								</Tabs>
							</div>

							{/* TODO: <DigitalTourismStats chartData={data[tab]} groupBy={tab} /> */}
							{tab === Indexes.prefecture && (
								<DigitalTourismStats chartData={data[tab]} groupBy={tab} />
							)}
							{tab === Indexes.municipality && (
								<DigitalTourismStats chartData={data[tab]} groupBy={tab} />
							)}
						</div>
						{/* </div> */}
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		</div>
	);
}
