<script lang="ts">
  import Editor from './Editor.svelte'
</script>

<div id="inspector" class="interface">
  <Editor />
</div>

<style>
  #inspector {
    position: absolute;
    right: 20px;
    top: 20px;
    border-radius: 15px;
    z-index: 1;
    width: 25em;
  }
</style>
