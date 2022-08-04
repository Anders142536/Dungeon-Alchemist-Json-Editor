<script>
</script>

<form>
  <h2>Lights</h2>
  <div class="editor-grid">
    Color
    <div />
    <input type="color" />

    Intensity
    <input type="range" min="0" max="1" step="0.01" />
    <input type="number" min="0" max="1" step="0.01" />

    Range
    <input type="range" min="0" max="1000" step="1" />
    <input type="number" min="0" max="1000" step="1" />
  </div>
  <h2>Walls</h2>
  <div class="editor-grid">
    Type
    <div />
    <select>
      <option value="0: ">0: Wall</option>
      <option value="1: ">1: Door</option>
      <option value="2: ">2: Window</option>
    </select>
  </div>
</form>

<style>
  .editor-grid {
    display: grid;
    grid-template-columns: auto minmax(0px, 10em) 7em;
    gap: 10px;
  }
</style>
