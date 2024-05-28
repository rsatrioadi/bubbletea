<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import * as Resizable from '$lib/components/ui/resizable';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as d3 from 'd3';

	export let hoverDetail = '';
	export let roots: any[] = [];

	function inputDataToHierarchyData(csvText: string): any {
		// package, class, layer, count
		const table = d3.csvParse(csvText);

		// TODO: parameterize
		const validLayers = [
			'Presentation Layer',
			'Service Layer',
			'Domain Layer',
			'Data Source Layer'
		];

		// normalize invalid layers
		table.forEach((row) => {
			if (!validLayers.includes(row.layer)) {
				row.layer = 'Unknown Layer';
			}
		});

		const obj: any = {};

		table.forEach(({ package: pkg, class: cls, layer, count: cstr }) => {
			const count = parseFloat(cstr);
			if (!obj[pkg]) {
				obj[pkg] = {};
			}
			if (!obj[pkg][cls]) {
				obj[pkg][cls] = [];
			}
			obj[pkg][cls].push({ layer, count });
		});

		const nodes: any = [];

		for (const pkg in obj) {
			const classes = obj[pkg];
			const temporaryTable: any = [];

			for (const cls in classes) {
				const rows = classes[cls];

				// TODO: should we differentiate length=1?
				if (rows.length > 1) {
					// add instances with their respective layers and counts
					rows.forEach((row: { count: any; layer: any }, index: any) => {
						temporaryTable.push({
							id: `${cls}-child${index + 1}`,
							parent: cls,
							kind: 'layer_info',
							count: row.count,
							layer: row.layer
						});
					});

					// append parent class
					temporaryTable.push({
						id: cls,
						parent: pkg,
						kind: 'class',
						count: 0,
						layer: undefined
					});
				} else {
					temporaryTable.push({
						id: cls,
						parent: pkg,
						kind: 'class',
						count: rows[0].count,
						layer: rows[0].layer
					});
				}
			}

			// append package
			temporaryTable.push({
				id: pkg,
				parent: '',
				kind: 'package',
				count: 0,
				layer: undefined
			});

			nodes.push(temporaryTable);
		}

		roots = [];
		nodes.forEach((temporaryTable: unknown[]) => {
			// turn to d3 hierarchy
			const root = d3
				.stratify()
				.id((d: any) => d.id)
				.parentId((d: any) => d.parent)(temporaryTable);

			// temporary, limit to two

			roots.push(root);
		});
	}

	function handleFileChange(e: any) {
		const file = e.target?.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (e) => {
			const text = e.target?.result as string;
			inputDataToHierarchyData(text);
		};
		reader.readAsText(file);
	}

	let objectDetail: any = [];
	$: {
		if (hoverDetail) {
			objectDetail = JSON.parse(hoverDetail);
			objectDetail = Object.entries(objectDetail);
			// remove if type is object or empty
			objectDetail = objectDetail.filter(
				([key, value]: [string, any]) => typeof value !== 'object' && value !== ''
			);
		}
	}
</script>

<Resizable.PaneGroup direction="vertical">
	<Resizable.Pane class="pt-4" defaultSize={10}>
		<div class="grid w-full max-w-sm items-center gap-1.5">
			<Label for="picture" class="font-bold">Input</Label>
			<Input id="picture" type="file" on:change={handleFileChange} />
		</div>
	</Resizable.Pane>
	<Resizable.Handle />

	<Resizable.Pane class="pb-4">
		<Table.Root>
			<Table.Caption>Attributes</Table.Caption>
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-[100px]">Attribute</Table.Head>
					<Table.Head>Data</Table.Head>
				</Table.Row>
			</Table.Header>
			{#each objectDetail as [key, value]}
				<Table.Body>
					<Table.Row>
						<Table.Cell class="font-medium">{key}</Table.Cell>
						<Table.Cell>{value}</Table.Cell>
					</Table.Row>
				</Table.Body>
			{/each}
		</Table.Root>
	</Resizable.Pane>
</Resizable.PaneGroup>
