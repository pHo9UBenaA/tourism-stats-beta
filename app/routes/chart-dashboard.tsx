import type { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { fetchAllYearsDigitalPrefectureData } from 'app/data/digital/getData';
import { DigitalTourismStats } from 'app/features/digital-tourism-stats-chart';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '../components/ui/accordion';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';

export async function loader({ request }: LoaderFunctionArgs) {
	const data = await fetchAllYearsDigitalPrefectureData();
	return data;
}

export default function ChartDashboard() {
	const rawData = useLoaderData<typeof loader>();

	return (
		<div>
			<h1 className='text-3xl font-bold tracking-tight'>
				Tourism Statistics Chart
			</h1>

			<Accordion
				type='single'
				collapsible
				className='w-full'
				defaultValue='inbound'
			>
				<AccordionItem value='inbound'>
					<AccordionTrigger>Inbound Tourism Information</AccordionTrigger>
					<AccordionContent>
						<div className='space-y-4'>
							<div className='flex flex-wrap'>
								{/* <YearSelector /> */}
								<Tabs defaultValue='region'>
									<TabsList>
										<TabsTrigger value='region'>By Region</TabsTrigger>
										<TabsTrigger value='country'>By Country</TabsTrigger>
									</TabsList>
								</Tabs>
							</div>
							<DigitalTourismStats rawData={rawData} />
						</div>
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		</div>
	);
}
