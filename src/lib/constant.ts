export const PADDING_X_LAYER = 100;
export const layers = ['Presentation Layer', 'Service Layer', 'Domain Layer', 'Data Source Layer'];
export const FACTOR = 100;
export const PADDING_INNER_PACK = 2;
export const PADDING_INTER_PACK = 10; // must be more than 1 or it will infinite loop. careful.

export const colorMap: { [key: string]: string } = {
	'Presentation Layer': '#fb8072',
	'Service Layer': '#ffffb3',
	'Domain Layer': '#8dd3c7',
	'Data Source Layer': '#bebada',
	'Unknown Layer': '#525252'
};

// arbitrary layer height: 3 times the biggest root radius
export const LAYER_SIZE_MULTIPLIER = 3;
