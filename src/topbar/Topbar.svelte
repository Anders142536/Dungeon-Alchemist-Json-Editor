<script>
  import Export from './export/Export.svelte'
  import Import from './import/Import.svelte'
</script>

<div id="topbar" class="interface">
  <Import />
  <Export />
</div>

<style>
  #topbar {
    position: absolute;
    left: 20px;
    z-index: 1;
    width: 300px;
    border-radius: 0px 0px 15px 15px;
  }
</style>
