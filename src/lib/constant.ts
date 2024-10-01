export const PADDING_X_LAYER = 100;
export const layers = ['Presentation Layer', 'Service Layer', 'Domain Layer', 'Data Source Layer'];
export const FACTOR = 100;
export const PADDING_INNER_PACK = 2;
export const PADDING_INTER_PACK = 10; // must be more than 1 or it will infinite loop. careful.

export const colorMap: { [key: string]: string } = {
	'Presentation Layer': '#FF3232',
	'Service Layer': '#FFDD32',
	'Domain Layer': '#1E991E',
	'Data Source Layer': '#3232FF',
	'Unknown Layer': '#666666'
};

// arbitrary layer height: 3 times the biggest root radius
export const LAYER_SIZE_MULTIPLIER = 3;
