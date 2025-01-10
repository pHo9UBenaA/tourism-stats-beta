import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '../components/ui/accordion';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import ChartLineDefault from '../features/chart-line-default';

export default function ChartDashboard() {
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
							<ChartLineDefault />
						</div>
					</AccordionContent>
				</AccordionItem>

				<AccordionItem value='domestic'>
					<AccordionTrigger>Domestic Tourism Information</AccordionTrigger>
					<AccordionContent>
						<div className='space-y-4'>
							<div className='flex flex-wrap '>
								{/* <YearSelector /> */}
								<Tabs defaultValue='prefecture'>
									<TabsList>
										<TabsTrigger value='prefecture'>By Prefecture</TabsTrigger>
										<TabsTrigger value='municipality'>
											By Municipality
										</TabsTrigger>
									</TabsList>
								</Tabs>
							</div>
							<ChartLineDefault />
						</div>
					</AccordionContent>
				</AccordionItem>

				<AccordionItem value='accommodation'>
					<AccordionTrigger>Accommodation Information</AccordionTrigger>
					<AccordionContent>
						<div className='space-y-4'>
							<div className='flex flex-wrap '>
								<Tabs defaultValue='accommodation'>
									<TabsList>
										<TabsTrigger value='accommodation'>
											Accommodation
										</TabsTrigger>
										<TabsTrigger value='occupancy'>Occupancy Rates</TabsTrigger>
									</TabsList>
								</Tabs>
							</div>
							<ChartLineDefault />
						</div>
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		</div>
	);
}
