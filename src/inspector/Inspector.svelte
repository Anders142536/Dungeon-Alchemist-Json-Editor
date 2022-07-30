<script>
	import LightsEditor from './LightsEditor.svelte'
	import WallsEditor	from './WallsEditor.svelte'


</script>


<div id='inspector' class='interface'>
	<LightsEditor/>
	<WallsEditor/>
	<div class='button-bar'>
		<input type='button' value='Cancel'>
		<input type='button' value='Save'>
	</div>
</div>