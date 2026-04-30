/**
 * Composable for handling row click on Motork DataTable via event delegation.
 * The future DataTable does not emit row-click; this provides row-click by
 * delegating from the table container and mapping the clicked tr to the row data.
 *
 * @param {Ref<Array>} dataRef - Ref to the array passed as :data to DataTable (current page rows)
 * @param {Function} onRowClick - (record) => void
 * @returns {{ onTableContainerClick: (e: MouseEvent) => void }}
 */
export function useTableRowClick(dataRef, onRowClick) {
  function onTableContainerClick(e) {
    if (!onRowClick || !dataRef?.value?.length) return
    // Motork DataTable uses role="button" widely (cells, wrappers). Treating it as interactive
    // prevents row-click entirely. Only exclude true interactive controls.
    const interactive = e.target.closest(
      'button, input, select, textarea, a, [data-slot="table-filter"]'
    )
    if (interactive) return
    const tr = e.target.closest('tbody tr')
    if (!tr) return
    const tbody = tr.closest('tbody')
    if (!tbody) return
    const rowIndex = Array.from(tbody.querySelectorAll('tr')).indexOf(tr)
    if (rowIndex < 0) return
    const record = dataRef.value[rowIndex]
    if (record) onRowClick(record)
  }
  return { onTableContainerClick }
}
