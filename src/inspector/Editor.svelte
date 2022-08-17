<script>
</script>

<form>
  <h2>Lights</h2>
  <div class="editor-grid">
    <i class="fa-solid fa-palette" />
    Color
    <div />
    <input type="color" />

    <i class="fa-solid fa-sun" />
    Intensity
    <input type="range" min="0" max="1" step="0.01" class="slider" />
    <input type="number" min="0" max="1" step="0.01" />

    <i class="fa-solid fa-arrows-left-right-to-line" />
    Range
    <input type="range" min="0" max="1000" step="1" class="slider" />
    <input type="number" min="0" max="1000" step="1" />
  </div>
  <h2>Walls</h2>
  <div class="editor-grid">
    <i class="fa-solid fa-dungeon" />
    Type
    <div />
    <select>
      <option value="0: ">0: Wall</option>
      <option value="1: ">1: Door</option>
      <option value="2: ">2: Window</option>
    </select>
  </div>
</form>
<div class="button-bar">
  <input type="button" value="Cancel" />
  <input type="button" value="Save" />
</div>

<style>
  .editor-grid {
    display: grid;
    grid-template-columns: max-content auto minmax(0px, 10em) 7em;
    gap: 10px;
    align-items: center;
  }

  .button-bar {
    display: flex;
    justify-content: space-between;
    margin-top: 15px;
  }

  /* .slider {
    width: 135px;
    height: 25px;
  } */
</style>
