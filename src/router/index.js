import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/components/layout/MainLayout.vue'
import { useUserStore } from '@/stores/user'
import { SETTINGS_PLACEHOLDER_ROUTE_ITEMS } from '@/constants/settingsNavRoutes'

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'home',
        redirect: '/home'
      },
      {
        path: 'home',
        name: 'home-dashboard',
        component: () => import('@/views/Home.vue'),
        meta: { titleKey: 'common.navigation.home', mutedPageChrome: true }
      },
      {
        path: 'add-new',
        name: 'add-new',
        component: () => import('@/views/AddNew.vue'),
        meta: { titleKey: 'common.navigation.addNewCustomer', tablePageLayout: true }
      },
      {
        path: 'tasks/:id?',
        name: 'task-detail',
        component: () => import('@/views/Tasks.vue'),
        meta: { titleKey: 'common.navigation.tasks', tablePageLayout: true }
      },
      {
        path: 'customer/:id',
        name: 'customer-view',
        component: () => import('@/views/Customer.vue'),
        props: true,
        meta: { titleKey: 'entities.customer.title', showPageTitle: false }
      },
      {
        path: 'vehicles',
        name: 'vehicles',
        component: () => import('@/views/Vehicles.vue'),
        meta: { titleKey: 'common.navigation.vehicles', tablePageLayout: true }
      },
      {
        path: 'vehicles/:id',
        name: 'vehicle-detail',
        component: () => import('@/views/VehicleDetailPage.vue'),
        props: true,
        meta: { titleKey: 'common.navigation.vehicles', tablePageLayout: true }
      },
      {
        path: 'requests/:id',
        name: 'request-detail',
        component: () => import('@/views/RequestDetailPage.vue'),
        props: true,
        meta: { titleKey: 'common.navigation.sales', showPageTitle: false }
      },
      {
        path: 'requests',
        name: 'requests',
        component: () => import('@/views/Requests.vue'),
        meta: { titleKey: 'common.navigation.sales', tablePageLayout: true }
      },
      {
        path: 'after-sales',
        name: 'after-sales',
        component: () => import('@/views/AfterSales.vue'),
        meta: { titleKey: 'common.navigation.afterSales' }
      },
      {
        path: 'conversations/:threadId?',
        name: 'conversations',
        component: () => import('@/views/Conversations.vue'),
        meta: { titleKey: 'common.navigation.conversations', mutedPageChrome: true }
      },
      {
        path: 'customers',
        name: 'customers',
        component: () => import('@/views/Customers.vue'),
        meta: { titleKey: 'common.navigation.customers', tablePageLayout: true }
      },
      {
        path: 'calendar',
        name: 'calendar',
        component: () => import('@/views/Calendar.vue'),
        meta: { titleKey: 'common.navigation.calendar', mutedPageChrome: true }
      },
      {
        path: 'reports',
        name: 'reports',
        component: () => import('@/views/Reports.vue'),
        meta: { titleKey: 'common.navigation.reports', tablePageLayout: true }
      },
      {
        path: 'marketing',
        name: 'marketing',
        component: () => import('@/views/MarketingLoaderPreview.vue'),
        meta: { titleKey: 'common.navigation.marketing', showPageTitle: false }
      },
      {
        path: 'settings',
        component: () => import('@/views/SettingsLayout.vue'),
        redirect: { name: SETTINGS_PLACEHOLDER_ROUTE_ITEMS[0].name },
        beforeEnter: (to, from, next) => {
          const userStore = useUserStore()
          if (userStore.canAccessSettings()) {
            next()
          } else {
            next('/access-denied')
          }
        },
        children: [
          {
            path: 'prototype',
            name: 'settings-prototype',
            component: () => import('@/views/Settings.vue'),
            meta: { titleKey: 'common.navigation.settingsPrototype' }
          },
          ...SETTINGS_PLACEHOLDER_ROUTE_ITEMS.map((r) => ({
            path: r.relPath,
            name: r.name,
            component: () => import('@/views/settings/SettingsAdminPlaceholder.vue'),
            meta: { titleKey: r.titleKey }
          }))
        ]
      },
      {
        path: 'access-denied',
        name: 'access-denied',
        component: () => import('@/views/AccessDenied.vue'),
        meta: { title: 'Access Denied', showPageTitle: false }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
