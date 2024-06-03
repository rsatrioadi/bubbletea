<script lang="ts">
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
		const validLayers = ["Presentation Layer", "Service Layer", "Domain Layer", "Data Source Layer"];
		
		// normalize invalid layers
		table.forEach(row => {
			if (!validLayers.includes(row.layer)) {
			row.layer = "Unknown Layer";
			}
		});

		const obj: any = {};
		
		table.forEach(({package: pkg, class: cls, layer, count: cstr}) => {
			const count = parseFloat(cstr);
			if (!obj[pkg]) { obj[pkg] = {}; }
			if (!obj[pkg][cls]) { obj[pkg][cls] = []; }
			obj[pkg][cls].push({ layer, count });
		});

		const nodes: any = [];

		for (const pkg in obj) {
			const classes = obj[pkg];
			const temporaryTable: any = [];
			
			for (const cls in classes) {
				const rows = classes[cls];
			
					// add instances with their respective layers and counts
					rows.forEach((row: { count: any; layer: any; }, index: any) => {
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
</script>

<Resizable.PaneGroup direction="vertical">
	<Resizable.Pane class="pb-4" defaultSize={20}>{hoverDetail}</Resizable.Pane>
	<Resizable.Handle />
	<Resizable.Pane class="pt-4">
		<div class="grid w-full max-w-sm items-center gap-1.5">
			<Label for="picture" class="font-bold">Input</Label>
			<Input id="picture" type="file" on:change={handleFileChange} />
		</div>
	</Resizable.Pane>
</Resizable.PaneGroup>
