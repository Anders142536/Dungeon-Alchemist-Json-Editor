import { writable, derived } from 'svelte/store'

/* holds the imported data and edits after pressing "save" */
function createDataStore() {
  const { subscribe, set, update } = writable({})

  return {
    subscribe,

  }
}

/* holds the values the user applies in the editor*/
function createEditorValuesStore() {
  const { subscribe, set, update } = writable({})

}

/* holds the selection the user does on the map*/
function createSelectionStore() {
  const { subscribe, set, update } = writable({})

}


export const data = createDataStore()
export const editorValues = createEditorValuesStore()
export const selection = createSelectionStore()

/* holds the imported data with the changes from the editor applied to it*/
export const editedData = derived(
  [data, editorValues, selection],
  ([$data, $editorValues, $selection]) => {

  }
)