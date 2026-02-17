import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/components/layout/MainLayout.vue'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'home',
        redirect: '/tasks'
      },
      {
        path: 'home',
        name: 'home-dashboard',
        component: () => import('@/views/Home.vue'),
        meta: { titleKey: 'common.navigation.home' }
      },
      {
        path: 'add-new',
        name: 'add-new',
        component: () => import('@/views/AddNew.vue'),
        meta: { titleKey: 'common.navigation.addNewCustomer' }
      },
      {
        path: 'tasks/:id?',
        name: 'task-detail',
        component: () => import('@/views/Tasks.vue'),
        meta: { titleKey: 'common.navigation.tasks' }
      },
      {
        path: 'customer/:id',
        name: 'customer-view',
        component: () => import('@/views/Customer.vue'),
        props: true,
        meta: { titleKey: 'entities.customer.title' }
      },
      {
        path: 'vehicles',
        name: 'vehicles',
        component: () => import('@/views/Vehicles.vue'),
        meta: { titleKey: 'common.navigation.vehicles' }
      },
      {
        path: 'requests',
        name: 'requests',
        component: () => import('@/views/Requests.vue'),
        meta: { titleKey: 'common.navigation.requests' }
      },
      {
        path: 'customers',
        name: 'customers',
        component: () => import('@/views/Customers.vue'),
        meta: { titleKey: 'common.navigation.customers' }
      },
      {
        path: 'calendar',
        name: 'calendar',
        component: () => import('@/views/Calendar.vue'),
        meta: { titleKey: 'common.navigation.calendar' }
      },
      {
        path: 'reports',
        name: 'reports',
        component: () => import('@/views/Reports.vue'),
        meta: { titleKey: 'common.navigation.reports' }
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('@/views/Settings.vue'),
        meta: { titleKey: 'common.navigation.settings' },
        beforeEnter: (to, from, next) => {
          const userStore = useUserStore()
          if (userStore.canAccessSettings()) {
            next()
          } else {
            next('/access-denied')
          }
        }
      },
      {
        path: 'access-denied',
        name: 'access-denied',
        component: () => import('@/views/AccessDenied.vue'),
        meta: { title: 'Access Denied' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
