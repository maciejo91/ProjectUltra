# Tasks Table Redesign – Plan

## Save button: use component library only (do not re-implement)

**Requirement:** When the user selects multiple filters, a **Save** button should show up in the filter bar. That button must come from the **Motork component library** (DataTable or its filter row). We only **configure** it (e.g. enable it, pass callbacks, wire to saved views); we do **not** re-implement the button or its visibility logic.

### What to do

1. **Rely on the library for “Save” visibility**  
   The component library should show the Save button when multiple filters are selected (or when the filter state is “dirty”). At implementation time, confirm the exact condition (e.g. “more than one filter applied”, or “filters changed since last save”) from the library API/docs and ensure the tasks table is configured so that this button appears as expected.

2. **Enable the library’s save behaviour**  
   Use the DataTable (or `columnFiltersOptions`) API to show and enable the built-in save button. Consult the component library docs at implementation time:
   - `node_modules/@motork/component-library/dist/llms.txt` and `llms-full.txt`
   - Future Data Table: `dist/llms/future-components-data-table.txt`
   - Future Filters: `dist/llms/future-components-filters.txt`
   - Storybook / web-types if needed for props like `showSaveViewButton`, `onSaveView`, `savedViews`, or similar.

3. **Wire the library’s save to our persistence**  
   When the library triggers save (e.g. via an event or callback):
   - Persist the current filter state (e.g. `columnFilters`, and optionally `globalFilter`, `sorting`) as a saved view (e.g. in Pinia store or localStorage).
   - Ensure the **Default view** dropdown (saved filter combinations) is updated so the new view appears in the list.

4. **Do not add a custom Save button**  
   Do not build a separate “Save current filters” button or duplicate the library’s save UI. Only configure and connect the existing component library behaviour.

---

## Rest of the redesign (summary)

- **Default view dropdown:** New component that lists saved filter combinations; selecting one applies that combination. First control in the filter bar.
- **New column “Status”:** Task-level status (Overdue / In progress / Open), shown by default; styling via global CSS classes.
- **Existing column → “Request status”:** Rename current stage column to “Request status”, hide by default.
- **Default filters (order):** Default view (dropdown), Task type, Source, Assignee, Status (stage filter), Add Filter.
- **Default columns (visible):** Task, Due time, Customer, Vehicle, Attempts, Assignee, Created at, Status (task-level). Request status hidden by default.
- **Global styling:** All design elements (badges, due-time pills, task status, filter bar) in `main.css` using theme tokens; no inline styles; component library as base.
