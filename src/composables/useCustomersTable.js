import { computed, h } from 'vue'
import { Badge } from '@motork/component-library/future/primitives'
import { Gem } from 'lucide-vue-next'
import { getLucideIcon } from '@/utils/lucideIcons'

/**
 * Composable for Customers table configuration
 * Provides columns, filterDefinitions, and tableMeta for DataTable component
 *
 * @param {Ref} activeTab - The active tab ('customers', 'open-leads', etc.)
 * @param {Function} handleRowClick - Handler function for row clicks
 * @param {Object} [opts] - Optional: { rows } for dynamic filter options (assignee, requestType)
 * @returns {Object} Object containing columns, filterDefinitions, and tableMeta
 */
export function useCustomersTable(activeTab, handleRowClick, opts = {}) {
  const rows = opts.rows

  // Filter definitions for AI-powered filtering
  const filterDefinitions = computed(() => {
    // Different filters based on active tab
    if (activeTab.value === 'customers') {
      return [
        {
          key: 'source',
          label: 'Source',
          type: 'select',
          operators: [
            { value: 'eq', label: 'is' },
            { value: 'ne', label: 'is not' }
          ],
          options: [
            { value: 'Marketing', label: 'Marketing' },
            { value: 'Referral', label: 'Referral' },
            { value: 'Direct', label: 'Direct' }
          ]
        },
        {
          key: 'accountType',
          label: 'Account type',
          type: 'select',
          operators: [
            { value: 'eq', label: 'is' },
            { value: 'ne', label: 'is not' }
          ],
          options: [
            { value: 'Contact', label: 'Contact' },
            { value: 'Account', label: 'Account' }
          ]
        }
      ]
    } else {
      // For leads and opportunities – include all fields supported by AI natural language queries
      const rowList = rows?.value ?? []
      const assigneeOptions = [...new Set(rowList.map((r) => r.assignee).filter(Boolean))].sort().map((name) => ({ value: name, label: name }))
      const requestTypeOptions = [
        { value: 'Test Drive', label: 'Test Drive' },
        { value: 'Quotation', label: 'Quotation' },
        { value: 'Generic sales', label: 'Generic sales' }
      ]

      return [
        {
          key: 'assignee',
          label: 'Assignee',
          type: 'select',
          operators: [
            { value: 'eq', label: 'is' },
            { value: 'ne', label: 'is not' }
          ],
          options: assigneeOptions
        },
        {
          key: 'status',
          label: 'Status',
          type: 'multiselect',
          operators: [
            { value: 'in', label: 'is any of' },
            { value: 'notIn', label: 'is none of' }
          ],
          options: [
            { value: 'Valid - to be called back', label: 'Valid - to be called back' },
            { value: 'Not valid', label: 'Not valid' },
            { value: 'Qualified', label: 'Qualified' },
            { value: 'Not interested', label: 'Not interested' }
          ]
        },
        {
          key: 'carStatus',
          label: 'Car status',
          type: 'select',
          operators: [
            { value: 'eq', label: 'is' },
            { value: 'ne', label: 'is not' }
          ],
          options: [
            { value: 'In Stock', label: 'In Stock' },
            { value: 'Out of Stock', label: 'Out of Stock' }
          ]
        },
        {
          key: 'requestType',
          label: 'Request type',
          type: 'select',
          operators: [
            { value: 'eq', label: 'is' },
            { value: 'ne', label: 'is not' },
            { value: 'in', label: 'is any of' }
          ],
          options: requestTypeOptions
        },
        {
          key: 'priority',
          label: 'Priority',
          type: 'select',
          operators: [
            { value: 'eq', label: 'is' },
            { value: 'ne', label: 'is not' }
          ],
          options: [
            { value: 'Hot', label: 'Hot' },
            { value: 'Normal', label: 'Normal' }
          ]
        },
        {
          key: 'source',
          label: 'Source',
          type: 'select',
          operators: [
            { value: 'eq', label: 'is' },
            { value: 'ne', label: 'is not' }
          ],
          options: [
            { value: 'Marketing', label: 'Marketing' },
            { value: 'Referral', label: 'Referral' },
            { value: 'Direct', label: 'Direct' }
          ]
        },
        {
          key: 'car',
          label: 'Requested car (model)',
          type: 'select',
          operators: [
            { value: 'includes', label: 'contains' },
            { value: 'eq', label: 'is' }
          ],
          options: []
        },
        {
          key: 'createdAt',
          label: 'Created',
          type: 'inputrange',
          inputType: 'date',
          operators: [
            { value: 'between', label: 'is between' },
            { value: 'gte', label: 'is after' },
            { value: 'lte', label: 'is before' }
          ],
          options: []
        }
      ]
    }
  })

  // Table meta configuration
  const tableMeta = computed(() => ({
    class: {
      tr: 'cursor-pointer hover:bg-muted transition-colors border-black/5'
    }
  }))

  // DataTable columns configuration - dynamic based on activeTab
  const columns = computed(() => {
    if (activeTab.value === 'customers') {
      // Contacts columns - unified for contacts and accounts
      return [
        {
          accessorKey: 'customer',
          header: 'Customer',
          meta: {
            title: 'Customer',
            onOpen: (row) => handleRowClick(row.original)
          },
          cell: ({ row }) => {
            const rowData = row.original
            const accountType = rowData.accountType || 'Contact'
            return h('div', { class: 'flex items-center gap-2 md:gap-3' }, [
              h('div', {
                class: 'w-9 h-9 rounded-full flex items-center justify-center text-fluid-xs font-bold shrink-0 bg-blue-100 text-blue-600'
              }, rowData.initials),
              h('div', { class: 'min-w-0 flex flex-wrap items-center gap-2' }, [
                h('div', { class: 'text-fluid-sm font-semibold text-foreground truncate max-w-[120px] md:max-w-none' }, rowData.customer),
                h(Badge, {
                  text: accountType,
                  size: 'small',
                  theme: accountType === 'Account' ? 'blue' : 'gray'
                })
              ])
            ])
          }
        },
        {
          accessorKey: 'telephone',
          header: 'Telephone',
          meta: { title: 'Telephone' },
          cell: ({ row }) => {
            return h('span', { class: 'text-fluid-sm text-muted-foreground' }, row.original.telephone || 'N/A')
          }
        },
        {
          accessorKey: 'location',
          header: 'Location',
          meta: { title: 'Location' },
          cell: ({ row }) => {
            return h('span', { class: 'text-fluid-sm text-muted-foreground truncate max-w-[150px]' }, row.original.location || 'N/A')
          }
        },
        {
          accessorKey: 'interestScore',
          header: 'Interest score',
          meta: { title: 'Interest score' },
          cell: ({ row }) => {
            const score = row.original.interestScore
            const display = score != null ? `${score}%` : 'N/A'
            const showGem = score != null && score > 80
            return h('div', { class: 'flex items-center gap-1.5 text-fluid-sm text-muted-foreground' }, [
              showGem ? h(Gem, { size: 14, class: 'shrink-0 text-primary' }) : null,
              h('span', display)
            ])
          }
        },
        {
          accessorKey: 'createdAt',
          header: 'Created at',
          meta: { title: 'Created at' },
          cell: ({ row }) => {
            return h('span', { class: 'text-fluid-sm text-muted-foreground' }, row.original.createdAt || 'N/A')
          }
        },
        {
          accessorKey: 'leads',
          header: 'Leads',
          meta: { title: 'Leads' },
          cell: ({ row }) => {
            const val = row.original.leads
            return h('span', { class: 'text-fluid-sm text-muted-foreground' }, val != null ? String(val) : '0')
          }
        },
        {
          accessorKey: 'opportunities',
          header: 'Opportunities',
          meta: { title: 'Opportunities' },
          cell: ({ row }) => {
            const val = row.original.opportunities
            return h('span', { class: 'text-fluid-sm text-muted-foreground' }, val != null ? String(val) : '0')
          }
        },
        {
          id: 'actions',
          header: '',
          meta: { title: 'Actions' },
          cell: () => {
            return h('button', {
              class: 'text-muted-foreground hover:text-foreground'
            }, [
              h('i', { class: 'fa-solid fa-ellipsis-vertical' })
            ])
          }
        }
      ]
    } else if (activeTab.value === 'open-leads') {
      // Customers (leads/opportunities) columns
      return [
        {
          accessorKey: 'customer',
          header: 'Customer',
          meta: {
            title: 'Customer',
            onOpen: (row) => handleRowClick(row.original)
          },
          cell: ({ row }) => {
            const rowData = row.original
            return h('div', { class: 'flex items-center gap-2 md:gap-3' }, [
              h('div', {
                class: 'w-9 h-9 rounded-full flex items-center justify-center text-fluid-xs font-bold shrink-0 bg-orange-100 text-orange-600'
              }, rowData.initials),
              h('div', { class: 'min-w-0' }, [
                h('div', { class: 'text-fluid-sm font-semibold text-foreground truncate' }, rowData.customer),
                h('div', { class: 'text-fluid-xs text-muted-foreground truncate hidden sm:block' }, rowData.email)
              ])
            ])
          }
        },
        {
          accessorKey: 'nextAction',
          header: 'Next action due',
          meta: { title: 'Next action due' },
          cell: ({ row }) => {
            const rowData = row.original
            if (!rowData.nextActionFull) return '-'
            return h('div', { class: 'text-fluid-sm' }, [
              h('div', {
                class: `font-medium mb-0.5 ${rowData.deadlineStatus?.textClass || 'text-foreground'}`
              }, rowData.nextActionFull),
              h('div', {
                class: `text-fluid-xs flex items-center gap-1 ${rowData.deadlineStatus?.textClass || 'text-muted-foreground'}`
              }, [
                rowData.deadlineStatus?.iconClass ? h(getLucideIcon(rowData.deadlineStatus.iconClass), { size: 14, class: 'shrink-0 text-fluid-xs' }) : null,
                h('span', rowData.nextAction)
              ])
            ])
          }
        },
        {
          accessorKey: 'car',
          header: 'Requested car',
          meta: { title: 'Requested car' },
          cell: ({ row }) => {
            return h('div', { class: 'flex items-center gap-2' }, [
              h(getLucideIcon('fa-brands fa-volkswagen'), { size: 14, class: 'shrink-0 text-muted-foreground text-fluid-sm' }),
              h('span', { class: 'text-fluid-sm font-medium text-foreground truncate max-w-[120px]' }, row.original.car || 'N/A')
            ])
          }
        },
        {
          accessorKey: 'carStatus',
          header: 'Car status',
          meta: { title: 'Car status' },
          cell: ({ row }) => {
            return h('span', {
              class: `inline-flex items-center px-2 py-0.5 rounded text-fluid-xs font-semibold ${row.original.carStatusClass}`
            }, row.original.carStatus)
          }
        },
        {
          accessorKey: 'requestType',
          header: 'Request type',
          meta: { title: 'Request type' },
          cell: ({ row }) => {
            return h('span', { class: 'text-fluid-sm text-muted-foreground' }, row.original.requestType || 'N/A')
          }
        },
        {
          accessorKey: 'source',
          header: 'Source',
          meta: { title: 'Source' },
          cell: ({ row }) => {
            return h('span', {
              class: 'inline-flex items-center px-2 py-0.5 rounded text-fluid-xs font-semibold bg-muted text-muted-foreground'
            }, row.original.source || 'N/A')
          }
        },
        {
          accessorKey: 'assignee',
          header: 'Assignee',
          meta: { title: 'Assignee' },
          cell: ({ row }) => {
            return h('div', { class: 'flex items-center gap-2' }, [
              h('div', {
                class: 'w-6 h-6 rounded-full bg-muted flex items-center justify-center text-fluid-xs font-bold text-muted-foreground shrink-0'
              }, row.original.assigneeInitials),
              h('span', { class: 'text-fluid-sm text-muted-foreground truncate max-w-[80px] hidden md:inline' }, row.original.assignee || 'N/A')
            ])
          }
        },
        {
          accessorKey: 'createdAt',
          header: 'Created at',
          meta: { title: 'Created at' },
          cell: ({ row }) => {
            return h('span', { class: 'text-fluid-sm text-muted-foreground' }, row.original.createdAt || 'N/A')
          }
        },
        {
          accessorKey: 'lastActivity',
          header: 'Last activity',
          meta: { title: 'Last activity' },
          cell: ({ row }) => {
            return h('span', { class: 'text-fluid-sm text-muted-foreground' }, row.original.lastActivity || 'N/A')
          }
        },
        {
          accessorKey: 'status',
          header: 'Status',
          meta: { title: 'Status' },
          cell: ({ row }) => {
            return h('span', {
              class: `inline-flex items-center px-2 py-0.5 rounded text-fluid-xs font-semibold ${row.original.statusClass}`
            }, row.original.status)
          }
        },
        {
          id: 'actions',
          header: '',
          meta: { title: 'Actions' },
          cell: () => {
            return h('button', {
              class: 'text-muted-foreground hover:text-foreground'
            }, [
              h('i', { class: 'fa-solid fa-ellipsis-vertical' })
            ])
          }
        }
      ]
    } else {
      // Opportunities columns (for open-opportunities, in-negotiation, won, lost tabs)
      return [
        {
          accessorKey: 'customer',
          header: 'Customer',
          meta: {
            title: 'Customer',
            onOpen: (row) => handleRowClick(row.original)
          },
          cell: ({ row }) => {
            const rowData = row.original
            return h('div', { class: 'flex items-center gap-2 md:gap-3' }, [
              h('div', {
                class: 'w-9 h-9 rounded-full flex items-center justify-center text-fluid-xs font-bold shrink-0 bg-purple-100 text-purple-600'
              }, rowData.initials),
              h('div', { class: 'min-w-0' }, [
                h('div', { class: 'text-fluid-sm font-semibold text-foreground truncate' }, rowData.customer),
                h('div', { class: 'text-fluid-xs text-muted-foreground truncate hidden sm:block' }, rowData.email)
              ])
            ])
          }
        },
        {
          accessorKey: 'nextAction',
          header: 'Next action due',
          meta: { title: 'Next action due' },
          cell: ({ row }) => {
            const rowData = row.original
            if (!rowData.nextActionFull) return '-'
            return h('div', { class: 'text-fluid-sm' }, [
              h('div', {
                class: `font-medium mb-0.5 ${rowData.deadlineStatus?.textClass || 'text-foreground'}`
              }, rowData.nextActionFull),
              h('div', {
                class: `text-fluid-xs flex items-center gap-1 ${rowData.deadlineStatus?.textClass || 'text-muted-foreground'}`
              }, [
                rowData.deadlineStatus?.iconClass ? h(getLucideIcon(rowData.deadlineStatus.iconClass), { size: 14, class: 'shrink-0 text-fluid-xs' }) : null,
                h('span', rowData.nextAction)
              ])
            ])
          }
        },
        {
          accessorKey: 'car',
          header: 'Offered car',
          meta: { title: 'Offered car' },
          cell: ({ row }) => {
            return h('div', { class: 'flex items-center gap-2' }, [
              h(getLucideIcon('fa-brands fa-volkswagen'), { size: 14, class: 'shrink-0 text-muted-foreground text-fluid-sm' }),
              h('span', { class: 'text-fluid-sm font-medium text-foreground truncate max-w-[120px]' }, row.original.car || 'N/A')
            ])
          }
        },
        {
          accessorKey: 'carStatus',
          header: 'Car status',
          meta: { title: 'Car status' },
          cell: ({ row }) => {
            return h('span', {
              class: `inline-flex items-center px-2 py-0.5 rounded text-fluid-xs font-semibold ${row.original.carStatusClass}`
            }, row.original.carStatus)
          }
        },
        {
          accessorKey: 'requestType',
          header: 'Request type',
          meta: { title: 'Request type' },
          cell: ({ row }) => {
            return h('span', { class: 'text-fluid-sm text-muted-foreground' }, row.original.requestType || 'N/A')
          }
        },
        {
          accessorKey: 'source',
          header: 'Source',
          meta: { title: 'Source' },
          cell: ({ row }) => {
            return h('span', {
              class: 'inline-flex items-center px-2 py-0.5 rounded text-fluid-xs font-semibold bg-muted text-muted-foreground'
            }, row.original.source || 'N/A')
          }
        },
        {
          accessorKey: 'assignee',
          header: 'Assignee',
          meta: { title: 'Assignee' },
          cell: ({ row }) => {
            return h('div', { class: 'flex items-center gap-2' }, [
              h('div', {
                class: 'w-6 h-6 rounded-full bg-muted flex items-center justify-center text-fluid-xs font-bold text-muted-foreground shrink-0'
              }, row.original.assigneeInitials),
              h('span', { class: 'text-fluid-sm text-muted-foreground truncate max-w-[80px] hidden md:inline' }, row.original.assignee || 'N/A')
            ])
          }
        },
        {
          accessorKey: 'createdAt',
          header: 'Created at',
          meta: { title: 'Created at' },
          cell: ({ row }) => {
            return h('span', { class: 'text-fluid-sm text-muted-foreground' }, row.original.createdAt || 'N/A')
          }
        },
        {
          accessorKey: 'lastAppointment',
          header: 'Last appointment',
          meta: { title: 'Last appointment' },
          cell: ({ row }) => {
            return h('span', { class: 'text-fluid-sm text-muted-foreground' }, row.original.lastAppointment || 'N/A')
          }
        },
        {
          accessorKey: 'status',
          header: 'Status',
          meta: { title: 'Status' },
          cell: ({ row }) => {
            return h('span', {
              class: `inline-flex items-center px-2 py-0.5 rounded text-fluid-xs font-semibold ${row.original.statusClass}`
            }, row.original.status)
          }
        },
        {
          id: 'actions',
          header: '',
          meta: { title: 'Actions' },
          cell: () => {
            return h('button', {
              class: 'text-muted-foreground hover:text-foreground'
            }, [
              h('i', { class: 'fa-solid fa-ellipsis-vertical' })
            ])
          }
        }
      ]
    }
  })

  return {
    columns,
    filterDefinitions,
    tableMeta
  }
}



