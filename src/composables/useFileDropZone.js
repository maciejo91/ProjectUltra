import { ref } from 'vue'

export function useFileDropZone({ onFiles }) {
  const isFileDragActive = ref(false)

  function resetFileDragState() {
    isFileDragActive.value = false
  }

  function onFileDragEnter(event) {
    event.preventDefault()
    if (!event.dataTransfer?.types?.includes('Files')) return
    isFileDragActive.value = true
  }

  function onFileDragLeave(event) {
    const next = event.relatedTarget
    if (next && event.currentTarget.contains(next)) return
    isFileDragActive.value = false
  }

  function onFileDragOver(event) {
    event.preventDefault()
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy'
    }
  }

  function onFileDrop(event) {
    event.preventDefault()
    resetFileDragState()
    const files = event.dataTransfer?.files
    if (files?.length) {
      onFiles(Array.from(files))
    }
  }

  return {
    isFileDragActive,
    onFileDragEnter,
    onFileDragLeave,
    onFileDragOver,
    onFileDrop
  }
}
