import { Button } from 'app/components/ui/button';
import { Checkbox } from 'app/components/ui/checkbox';
import { Label } from 'app/components/ui/label';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '../components/ui/dialog';

type Props = {
	uniqueRegions: string[];
	selectedRegions: string[];
	handleRegionChange: (region: string, checked: boolean) => void;
};

const SelectRegionDialog = ({
	uniqueRegions,
	selectedRegions,
	handleRegionChange,
}: Props) => {
	const selectedRegionsSet = new Set(selectedRegions);

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button>表示する地域を選択</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>地域を選択</DialogTitle>
					<DialogDescription>表示する地域を選択</DialogDescription>
					<DialogClose />
				</DialogHeader>

				<div className='grid grid-cols-4 gap-2 place-items-center max-h-96 overflow-auto'>
					{uniqueRegions.map((region) => (
						<div
							key={region}
							className='flex justify-center items-center h-10 w-40'
						>
							<Checkbox
								checked={selectedRegionsSet.has(region)}
								onCheckedChange={(checked) => {
									handleRegionChange(region, !!checked);
								}}
							/>
							<Label className='pl-1'>{region}</Label>
						</div>
					))}
				</div>
			</DialogContent>
		</Dialog>
	);
};

export { SelectRegionDialog };
