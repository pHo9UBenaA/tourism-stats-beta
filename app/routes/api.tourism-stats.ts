import { fetchMunicipalityData } from 'app/data/digital/getData';

export const loader = async () => {
	return await fetchMunicipalityData();
};
