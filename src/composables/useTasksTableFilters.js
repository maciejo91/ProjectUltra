import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { TASK_TABLE_STATUS, translateTaskTableStatus } from '@/utils/taskStatus'

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
  const { t } = useI18n()

  const filterDefinitions = computed(() => {
    const taskList = tasks.value ?? []
    const defs = []

    // Show Closed - external filter (controls data source, not column); excluded from row-level filtering
    defs.push({
      key: 'showClosed',
      label: t('dataTable.tasks.filters.showClosed'),
      type: 'select',
      operators: [{ value: 'eq', label: t('dataTable.filters.operators.is') }],
      options: [
        { value: '', label: t('common.common.no') },
        { value: 'yes', label: t('common.common.yes') }
      ],
      externalFilter: true,
      pinned: true
    })

    // Type filter - matches Type column (LQF task type)
    if (showTypeFilter.value) {
      defs.push({
        key: 'taskType',
        label: t('dataTable.tasks.columns.taskType'),
        type: 'select',
        operators: [{ value: 'eq', label: t('dataTable.filters.operators.is') }],
        options: [
          { value: '', label: t('common.common.all') },
          { value: 'LQF', label: 'LQF' }
        ],
        aiHint: 'LQF lead qualification task type',
        pinned: true
      })
    }

    const statusOptions = [
      TASK_TABLE_STATUS.OPEN,
      TASK_TABLE_STATUS.IN_PROGRESS,
      TASK_TABLE_STATUS.CLOSED
    ].map((value) => ({ value, label: translateTaskTableStatus(value, t) }))
    defs.push({
      key: 'status',
      label: t('dataTable.tasks.filters.status'),
      type: 'multiselect',
      operators: [
        { value: 'in', label: t('dataTable.filters.operators.isAnyOf') },
        { value: 'notIn', label: t('dataTable.filters.operators.isNoneOf') }
      ],
      options: statusOptions,
      aiHint: 'Task status: Open, In progress, or Closed',
      pinned: true
    })

    // Priority filter - matches task priority (leads)
    defs.push({
      key: 'priority',
      label: t('dataTable.tasks.filters.priority'),
      type: 'select',
      operators: [{ value: 'eq', label: t('dataTable.filters.operators.is') }],
      options: [
        { value: 'Hot', label: t('dataTable.tasks.priority.high') },
        { value: 'Normal', label: t('dataTable.tasks.priority.normal') }
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
      label: t('dataTable.tasks.filters.source'),
      type: 'multiselect',
      operators: [
        { value: 'in', label: t('dataTable.filters.operators.isAnyOf') },
        { value: 'notIn', label: t('dataTable.filters.operators.isNoneOf') }
      ],
      options: sourceOptions,
      aiHint: 'Lead or opportunity source',
      pinned: true
    })

    // Assignee filter - matches Assigned column
    const uniqueAssignees = [...new Set(taskList.map(t => t.assignee).filter(Boolean))].sort()
    const assigneeOptions = [
      ...uniqueAssignees.map(name => ({ value: name, label: name })),
      ...(taskList.some(t => !t.assignee) ? [{ value: '__unassigned__', label: t('dataTable.tasks.values.unassigned') }] : [])
    ]
    defs.push({
      key: 'assignee',
      label: t('dataTable.tasks.filters.assigned'),
      type: 'select',
      operators: [{ value: 'eq', label: t('dataTable.filters.operators.is') }],
      options: assigneeOptions.length > 0 ? assigneeOptions : [{ value: '__unassigned__', label: t('dataTable.tasks.values.unassigned') }],
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
        label: t('dataTable.tasks.filters.vehicleBrand'),
        type: 'multiselect',
        operators: [
          { value: 'in', label: t('dataTable.filters.operators.isAnyOf') },
          { value: 'notIn', label: t('dataTable.filters.operators.isNoneOf') }
        ],
        options: uniqueBrands.map(brand => ({ value: brand, label: brand })),
        aiHint: 'Car brand requested or associated with the task'
      })
    }

    // Creation date - matches Created column
    defs.push({
      key: 'createdAt',
      label: t('dataTable.tasks.filters.created'),
      type: 'inputrange',
      inputType: 'date',
      operators: [
        { value: 'between', label: t('dataTable.filters.operators.isBetween') },
        { value: 'gte', label: t('dataTable.filters.operators.isAfter') },
        { value: 'lte', label: t('dataTable.filters.operators.isBefore') }
      ],
      aiHint: 'Date when the task was created'
    })

    // Due date - matches Due date column
    defs.push({
      key: 'nextActionDue',
      label: t('dataTable.tasks.filters.dueDate'),
      type: 'inputrange',
      inputType: 'date',
      operators: [
        { value: 'between', label: t('dataTable.filters.operators.isBetween') },
        { value: 'gte', label: t('dataTable.filters.operators.isAfter') },
        { value: 'lte', label: t('dataTable.filters.operators.isBefore') }
      ],
      aiHint: 'Next action due date or task deadline'
    })

    return defs
  })

  return {
    filterDefinitions
  }
}



