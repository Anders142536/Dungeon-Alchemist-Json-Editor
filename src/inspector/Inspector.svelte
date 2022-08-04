<script lang="ts">
  import Editor from './Editor.svelte'
</script>

<div id="inspector" class="interface">
  <Editor />
  <div class="button-bar">
    <input type="button" value="Cancel" />
    <input type="button" value="Save" />
  </div>
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

  .button-bar {
    display: flex;
    justify-content: space-between;
    margin-top: 15px;
  }
</style>
