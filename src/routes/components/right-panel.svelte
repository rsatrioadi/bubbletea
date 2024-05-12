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
			
				// TODO: should we differentiate length=1?
				if (rows.length > 1) {

					// add instances with their respective layers and counts
					rows.forEach((row: { count: any; layer: any; }, index: any) => {
						temporaryTable.push({
							class: `${cls}-child${index + 1}`,
							package: cls,
							count: row.count,
							layer: row.layer
						});
					});

					// append parent class
					temporaryTable.push({
						class: cls,
						package: pkg,
						count: 0,
						layer: ''
					});

				} else {
					
					temporaryTable.push({
						class: cls,
						package: pkg,
						count: rows[0].count,
						layer: rows[0].layer
					});
				}
			}
		
			// append package
			temporaryTable.push({
				class: pkg,
				package: '',
				count: 0,
				layer: ''
			});

			nodes.push(temporaryTable);
		}

		roots = [];
		nodes.forEach((temporaryTable: unknown[]) => {
			// turn to d3 hierarchy
			const root = d3
				.stratify()
				.id((d: any) => d.class)
				.parentId((d: any) => d.package)(temporaryTable);

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
