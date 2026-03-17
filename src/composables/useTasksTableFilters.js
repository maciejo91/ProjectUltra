import { computed } from 'vue'
import { getDisplayStage } from '@/utils/stageMapper'
import { LEAD_STAGES, OPPORTUNITY_STAGES } from '@/utils/stageMapper/constants'

/**
 * Composable for TasksTableView filter definitions
 * Provides filter definitions for DataTable component aligned with columns and task data
 *
 * @param {Object} params - Parameters object
 * @param {import('vue').Ref<boolean>} params.showTypeFilter - Whether to show type filter
 * @param {Array} params.tasks - Tasks array for dynamic filter options
 * @returns {Object} Object containing filterDefinitions
 */
export function useTasksTableFilters({ showTypeFilter, tasks }) {
  const filterDefinitions = computed(() => {
    const taskList = tasks.value ?? []
    const defs = []

    // Show Closed - external filter (controls data source, not column); excluded from row-level filtering
    defs.push({
      key: 'showClosed',
      label: 'Show Closed',
      type: 'select',
      operators: [{ value: 'eq', label: 'is' }],
      options: [
        { value: '', label: 'No' },
        { value: 'yes', label: 'Yes' }
      ],
      externalFilter: true,
      pinned: true
    })

    // Type filter - matches Task details column (lead/opportunity badge)
    if (showTypeFilter.value) {
      defs.push({
        key: 'type',
        label: 'Task type',
        type: 'select',
        operators: [{ value: 'eq', label: 'is' }],
        options: [
          { value: '', label: 'All' },
          { value: 'lead', label: 'Lead' },
          { value: 'opportunity', label: 'Opportunity' }
        ],
        aiHint: 'Lead or Opportunity type',
        pinned: true
      })
    }

    // Status/Stage filter - matches Task details column (status badge), dynamic options from tasks
    const uniqueStatuses = [...new Set(
      taskList.map(t => getDisplayStage(t, t.type === 'lead' ? 'lead' : 'opportunity') ?? t.displayStage ?? t.status ?? t.stage).filter(Boolean)
    )].sort()
    const leadStageValues = Object.values(LEAD_STAGES).filter(s => s !== LEAD_STAGES.VALID)
    const statusOptions = uniqueStatuses.length > 0
      ? uniqueStatuses.map(s => ({ value: s, label: s }))
      : [
          ...leadStageValues,
          ...Object.values(OPPORTUNITY_STAGES),
          'In Negotiation - Offer Sent',
          'In Negotiation - Contract Pending'
        ].filter((v, i, a) => a.indexOf(v) === i).map(s => ({ value: s, label: s }))
    defs.push({
      key: 'status',
      label: 'Status',
      type: 'multiselect',
      operators: [
        { value: 'in', label: 'is any of' },
        { value: 'notIn', label: 'is none of' }
      ],
      options: statusOptions,
      aiHint: 'Lead status or opportunity stage (e.g. New, To be called back, Qualified, In Negotiation)',
      pinned: true
    })

    // Priority filter - matches task priority (leads)
    defs.push({
      key: 'priority',
      label: 'Priority',
      type: 'select',
      operators: [{ value: 'eq', label: 'is' }],
      options: [
        { value: 'Hot', label: 'High' },
        { value: 'Normal', label: 'Normal' }
      ],
      aiHint: 'Task priority level'
    })

    // Source filter - matches Source column, dynamic options
    const uniqueSources = [...new Set(taskList.map(t => t.source).filter(Boolean))].sort()
    const sourceOptions = uniqueSources.length > 0
      ? uniqueSources.map(s => ({ value: s, label: s }))
      : [
          { value: 'Marketing', label: 'Marketing' },
          { value: 'Website', label: 'Website' },
          { value: 'Referral', label: 'Referral' },
          { value: 'Walk-in', label: 'Walk-in' }
        ]
    defs.push({
      key: 'source',
      label: 'Source',
      type: 'multiselect',
      operators: [
        { value: 'in', label: 'is any of' },
        { value: 'notIn', label: 'is none of' }
      ],
      options: sourceOptions,
      aiHint: 'Lead or opportunity source',
      pinned: true
    })

    // Assignee filter - matches Assigned column
    const uniqueAssignees = [...new Set(taskList.map(t => t.assignee).filter(Boolean))].sort()
    const assigneeOptions = [
      ...uniqueAssignees.map(name => ({ value: name, label: name })),
      ...(taskList.some(t => !t.assignee) ? [{ value: '__unassigned__', label: 'Unassigned' }] : [])
    ]
    defs.push({
      key: 'assignee',
      label: 'Assigned',
      type: 'select',
      operators: [{ value: 'eq', label: 'is' }],
      options: assigneeOptions.length > 0 ? assigneeOptions : [{ value: '__unassigned__', label: 'Unassigned' }],
      aiHint: 'Person assigned to the task',
      pinned: true
    })

    // Requested car / Vehicle brand - matches Vehicle column
    const uniqueBrands = [...new Set(
      taskList.map(t => {
        const car = t.type === 'lead' ? t.requestedCar : (t.vehicle || t.requestedCar)
        return car?.brand
      }).filter(Boolean)
    )].sort()
    if (uniqueBrands.length > 0) {
      defs.push({
        key: 'requestedCarBrand',
        label: 'Vehicle brand',
        type: 'multiselect',
        operators: [
          { value: 'in', label: 'is any of' },
          { value: 'notIn', label: 'is none of' }
        ],
        options: uniqueBrands.map(brand => ({ value: brand, label: brand })),
        aiHint: 'Car brand requested or associated with the task'
      })
    }

    // Creation date - matches Created column
    defs.push({
      key: 'createdAt',
      label: 'Created',
      type: 'inputrange',
      inputType: 'date',
      operators: [
        { value: 'between', label: 'is between' },
        { value: 'gte', label: 'is after' },
        { value: 'lte', label: 'is before' }
      ],
      aiHint: 'Date when the task was created'
    })

    // Due date - matches Due date column
    defs.push({
      key: 'nextActionDue',
      label: 'Due date',
      type: 'inputrange',
      inputType: 'date',
      operators: [
        { value: 'between', label: 'is between' },
        { value: 'gte', label: 'is after' },
        { value: 'lte', label: 'is before' }
      ],
      aiHint: 'Next action due date or task deadline'
    })

    return defs
  })

  return {
    filterDefinitions
  }
}



