/* eslint-disable @typescript-eslint/no-explicit-any */
// TODO: remove above line
const FACTOR = 200;
const PADDING_INNER_PACK = 2;
const PADDING_INTER_PACK = 10; // must be more than 1
const PADDING_X_LAYER = 100;
import * as d3 from 'd3';
const layers = ['Presentation Layer', 'Service Layer', 'Domain Layer', 'Data Source Layer'];

function adjustHexColor(hex: string, percent: number): string {
	// Parse the hex color
	const num = parseInt(hex.slice(1), 16);

	// Extract RGB components
	const rgb = [
		(num >> 16) & 0xFF,
		(num >> 8) & 0xFF,
		num & 0xFF
	];

	const adjustedRgb = rgb
		.map(c => Math.floor(c + (255 - c) * percent)) // Adjust RGB components based on the percentage
		.map(c => Math.max(Math.min(c, 255), 0)); // Cap RGB values at 0 and 255

	// Convert RGB back to hex
	const adjustedHex = "#" + adjustedRgb.reduce((acc, c) => acc + c.toString(16).padStart(2, '0'), '');

	return adjustedHex;
}

export default function drawPack(
	canvas: d3.Selection<SVGGElement, unknown, null, undefined>,
	roots: any[],
	writeDetailHover: (detail: string) => void
) {
	const layerCountProto: any = layers.reduce((obj: {[key: string]: number}, item: string) => {
			obj[item] = 0;
			return obj;
		}, {'Unknown Layer': 0});
	// COMPUTE
	roots.forEach((root) => {
		// 1. Compute the pack layout.
		const pack = d3.pack<any>();
		pack.padding(PADDING_INNER_PACK);

		// // Sum and sort the data.
		root.sum((d: any) => d.count);

		// determine the max size of the root based on its value
		const size = Math.log10(root.value+1) * FACTOR; // make it non linear
		pack.size([size, size]);

		pack(root);

		// 2. find the total 'count' attribute for each layer
		const layerCount: any = { ...layerCountProto };
		let total = 0;
		root.each((d: any) => {
			const layer = d.data.layer;
			layerCount[layer] += d.data.count;
			total += d.data.count;
		});

		const layerPercentage = Object.keys(layerCount).reduce((acc: any, key) => {
				acc[key] = (layerCount[key] / total) * 100;
				return acc;
			}, {});

		// find the dominants layer, and remove non dominant layer.
		/*
		step
		1. sort the layerPercentage from highest to lowest
		2. if the second highest is more than 1.5 times the highest, the it's considered as dominant
		3. do this until non dominan is found, then truncate the rest
		*/
		// turn the layerPercentage into array
		const layerPercentageArray = Object.keys(layerPercentage).map((key) => {
			return { layer: key, percentage: layerPercentage[key] };
		});
		// sort the layerPercentageArray from highest to lowest
		layerPercentageArray.sort((a, b) => b.percentage - a.percentage);

		const dominantLayer = [layerPercentageArray[0]];
		let layerIndexToCheck = 1;
		while (layerIndexToCheck < layerPercentageArray.length) {
			const currentLayer = layerPercentageArray[layerIndexToCheck];
			const previousLayer = layerPercentageArray[layerIndexToCheck - 1];
			if (currentLayer.percentage * 1.5 > previousLayer.percentage) {
				dominantLayer.push(currentLayer);
			} else {
				break;
			}
			layerIndexToCheck++;
		}

		// attach the layerPercentage to the root
		root.data.dominantLayer = dominantLayer;
		root.data.layerPercentageArray = layerPercentageArray;
	});

	// CALCULATE LAYOUT
	// draw the layer as rectangle
	// height is the biggest pack size
	const biggestRootRadius = roots.reduce((acc, root) => {
		if (acc.value < root.value) {
			return root;
		}
		return acc;
	});
	const layerHeight = biggestRootRadius.r * 3;
	// find the y for each root based on the dominantLayer

	let maxWidth = 0;
	const previousRoots: any = [];
	roots.forEach((root) => {
		const dominantLayer = root.data.dominantLayer;
		/*
			if dominant layer > 2 ,set Y to be -100
			if dominant layer = 2, check the two layer. if they're side to side, calculate based on the ratio of those two layer. 
			if not, set Y to be -100
			if dominant layer = 1, set Y the center of that layer
		*/
		if (dominantLayer.length > 2) {
			root.containerY = -100;
			root.isCrossOver = true;
		} else if (dominantLayer.length === 2) {
			const layer1 = dominantLayer[0].layer;
			const layer2 = dominantLayer[1].layer;
			const layer1Index = layers.indexOf(layer1);
			const layer2Index = layers.indexOf(layer2);
			if (layer1Index + 1 === layer2Index || layer1Index - 1 === layer2Index) {
				const layer1 = dominantLayer[0].layer;
				const layer1Index = layers.indexOf(layer1);
				const layer1Location = (layer1Index + 0.5) * layerHeight;
				const layer1Percentage = dominantLayer[0].percentage;

				const layer2 = dominantLayer[1].layer;
				const layer2Index = layers.indexOf(layer2);
				const layer2Location = (layer2Index + 0.5) * layerHeight;
				const layer2Percentage = dominantLayer[1].percentage;

				// calculate based on ratio
				const distanceAdded =
					(layer2Location - layer1Location) *
					(layer2Percentage / (layer1Percentage + layer2Percentage));
				root.containerY = layer1Location + distanceAdded;
			} else {
				root.containerY = -100;
				root.isCrossOver = true;
			}
		} else if (dominantLayer.length === 1) {
			const layer = dominantLayer[0].layer;
			const layerIndex = layers.indexOf(layer);
			root.containerY = (layerIndex + 0.5) * layerHeight;
		} else {
			root.containerY = -100;
			root.isCrossOver = true;
		}
		// the coordinate is from top left.
		root.containerY -= root.r;

		// calculate the x. check if it overlaps with previous roots. if it does, move it to the right then check again
		root.containerX = PADDING_X_LAYER;

		// skip if crossover
		if (root.isCrossOver) {
			return;
		}

		let isOverlap = false;
		do {
			isOverlap = false;
			for (let i = 0; i < previousRoots.length; i++) {
				const previousRoot = previousRoots[i];
				const circle1 = {
					x: previousRoot.containerX + previousRoot.r, // center of the circle
					y: previousRoot.containerY + previousRoot.r, // center of the circle
					r: previousRoot.r
				};
				const circle2 = {
					x: root.containerX + root.r, // center of the circle
					y: root.containerY + root.r, // center of the circle
					r: root.r
				};
				if (doesCircleOverlap(circle1, circle2)) {
					isOverlap = true;
					root.containerX += findMoveNeededInXForCircle2(circle1, circle2) + PADDING_INTER_PACK;
					break;
				}
			}
		} while (isOverlap);
		previousRoots.push(root);

		if (root.containerX + root.r * 2 > maxWidth) {
			maxWidth = root.containerX + root.r * 2;
		}
	});

	// TODO: parameterize?
	const colorMap: {[key:string]:string} = {
		'Presentation Layer': '#ee3239',//'#fb8072', 
		'Service Layer': '#fece00',//'#ffffb3', 
		'Domain Layer': '#5eaa5f',//'#8dd3c7', 
		'Data Source Layer': '#6A6DBA',//'#bebada',
		'Unknown Layer': '#101010'
	}

	const defs = canvas.append("svg:defs");
		
	Object.entries(colorMap).forEach(([key, value]) => {
		const grad = defs.append("svg:radialGradient")
			.attr("gradientUnits", "objectBoundingBox")
			.attr("cx", "25%")
			.attr("cy", "25%")
			.attr("r", "100%")
			.attr("id", "grad"+key.split(' ').join(''));

		grad.append("stop")
			.attr("offset", "0%")
			.style("stop-color", "white");

		grad.append("stop")
			.attr("offset", "75%")
			.style("stop-color",  adjustHexColor(value,-0.1));
	});

	const grad = defs.append("svg:radialGradient")
		.attr("gradientUnits", "objectBoundingBox")
		.attr("cx", "25%")
		.attr("cy", "25%")
		.attr("r", "100%")
		.attr("id", "gradElse");

	grad.append("stop")
		.attr("offset", "0%")
		.style("stop-color", "#D9B299");

	grad.append("stop")
		.attr("offset", "75%")
		.style("stop-color", "#ecd8cc");

	// RENDER LAYER
	const layerWidth = maxWidth + PADDING_X_LAYER;
	layers.forEach((layer, i) => {
		canvas
			.append('rect')
			.attr('x', 0)
			.attr('y', i * layerHeight)
			.attr('width', layerWidth)
			.attr('height', layerHeight)
			.attr('fill', () => adjustHexColor(colorMap[layer] ?? '#cccccc', 0.7))
			.attr('stroke', 'black');

		canvas
			.append('text')
			.attr('x', 5)
			.attr('y', i * layerHeight + 15)
			.attr('fill', 'black')
			.attr('text-anchor', 'start')
			.attr('font-size', '14px')
			.text(layer);
	});
	canvas
		.append('rect')
		.attr('x', maxWidth + PADDING_X_LAYER)
		.attr('y', 0)
		.attr('width', layerHeight)
		.attr('height', 4*layerHeight)
		.attr('fill', adjustHexColor(colorMap['Unknown Layer'], 0.7))
		.attr('stroke', 'black');
	canvas
		.append('text')
		.attr('x', maxWidth + PADDING_X_LAYER + 5)
		.attr('y', 15)
		.attr('fill', 'black')
		.attr('text-anchor', 'start')
		.attr('font-size', '14px')
		.text('Not classified');

	// RENDER PACKS
	roots.forEach((root, index: number) => {
		const containerElement = canvas
			.append('g')
			.attr('transform', `translate(${root.containerX},${root.containerY})`)
			.attr('id', `root-${index}`);

		// add container drag
		containerElement.call(
			d3.drag<any, any>().on('drag', function (event) {
				const x = event.dx;
				const y = event.dy;
				root.containerX += x;
				root.containerY += y;
				d3.select(this).attr('transform', `translate(${root.containerX},${root.containerY})`);
			})
		);

		root.each((d: any) => {
			const node = containerElement
				.append('g')
				.attr('transform', `translate(${d.x},${d.y})`)
				.attr('class', 'node');

			node
				.append('circle')
				.attr('r', d.r)
				.attr('fill', "url(#grad"+(d.data?.layer?.split(' ')?.join('')??'Else')+")")
				.attr('stroke', 'black');

			node.on('mouseover', function () {
				const hoverDetail = JSON.stringify(d.data, null, '\t');
				writeDetailHover(hoverDetail);

				d3.select(this).select('circle').attr('stroke-width', 2);
			});

			node.on('mouseout', function () {
				writeDetailHover('');
				d3.select(this).select('circle').attr('stroke-width', 1);
			});

			if (d.data.kind === 'package') {
				node
					.append('text')
					.attr('dy', -d.r-4)
					.attr('fill', 'black')
					.attr('text-anchor', 'middle')
					.attr('font-size', '12px')
					.text(d.data.id);
			}
		});
	});
}

type Circle = {
	x: number;
	y: number;
	r: number;
};
function doesCircleOverlap(circle1: Circle, circle2: Circle) {
	return findMoveNeededInXForCircle2(circle1, circle2) > 0;
}

// find the x and lock the y for the circle to not overlap new x must be to the right of the circle1
function findMoveNeededInXForCircle2(circle1: Circle, circle2: Circle) {
	const targetDistanceInX = Math.sqrt((circle1.r + circle2.r) ** 2 - (circle1.y - circle2.y) ** 2);
	if (Number.isNaN(targetDistanceInX)) {
		return 0;
	}
	const currentDistanceInX = Math.abs(circle1.x - circle2.x);
	let moveNeeded = targetDistanceInX - currentDistanceInX;
	// if circle2 is to the left, add 2 * currentDistanceInX
	if (circle2.x < circle1.x) {
		moveNeeded += 2 * currentDistanceInX;
	}
	return moveNeeded;
}
