export const PADDING_X_LAYER = 100;
export const layers = ['Presentation Layer', 'Service Layer', 'Domain Layer', 'Data Source Layer'];
export const FACTOR = 100;
export const PADDING_INNER_PACK = 2;
export const PADDING_INTER_PACK = 10; // must be more than 1 or it will infinite loop. careful.

export const colorMap: { [key: string]: string } = {
	'Presentation Layer': '#e41a1c',
	'Service Layer': '#377eb8',
	'Domain Layer': '#4daf4a',
	'Data Source Layer': '#984ea3',
	'Unknown Layer': '#002E49'
};

// arbitrary layer height: 3 times the biggest root radius
export const LAYER_SIZE_MULTIPLIER = 3;
