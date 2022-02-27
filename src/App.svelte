<script lang="ts">
	import Import		from './Import.svelte'
	import Export		from './Export.svelte'
	import Settings		from './Settings.svelte'
	import LightsEditor from './LightsEditor.svelte'
	import WallsEditor	from './WallsEditor.svelte'
	

</script>

<svg id='map'></svg>
<div id='filebar' class='interface'>
	<Import/>
	<Export/>
	<Settings/>

</div>
<div id='inspector' class='interface'>
	<LightsEditor/>
	<WallsEditor/>
	<div class='button-bar'>
		<input type='button' value='Cancel'>
		<input type='button' value='Save'>
	</div>
</div>


