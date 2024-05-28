<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import * as Resizable from '$lib/components/ui/resizable';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as d3 from 'd3';

	export let hoverDetail = '';
	export let table: d3.DSVRowArray<string>;

	function inputDataToHierarchyData(csvText: string): any {
		// package, class, layer, count
		table = d3.csvParse(csvText);
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

<div class="mr-2 h-full">
	<div class="mt-2 text-3xl font-bold">Pack Visualization</div>
	<Resizable.PaneGroup direction="vertical">
		<Resizable.Pane class="pt-4" defaultSize={10} minSize={10}>
			<div class="grid w-full max-w-sm items-center gap-1.5">
				<Label for="picture" class="font-bold">Input</Label>
				<Input id="picture" type="file" on:change={handleFileChange} />
			</div>
		</Resizable.Pane>
		<Resizable.Handle />
		{#if objectDetail.length === 0}
			<Resizable.Pane class="p-4">
				<div class="text-center">Hover on the pack to see the detail</div>
			</Resizable.Pane>
		{:else}
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
		{/if}
	</Resizable.PaneGroup>
</div>
