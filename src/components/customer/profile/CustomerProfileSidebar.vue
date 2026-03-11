<template>
  <Card class="h-full border-r border-border rounded-none shadow-none">
    <CardContent class="p-6 space-y-6">
      <div v-if="loading" class="space-y-6 animate-pulse">
        <div class="flex flex-col items-center space-y-4">
          <div class="w-20 h-20 rounded-full bg-muted"></div>
          <div class="space-y-2 w-full flex flex-col items-center">
            <div class="h-6 bg-muted rounded w-1/2"></div>
            <div class="h-4 bg-muted rounded w-1/3"></div>
          </div>
        </div>
        <div class="flex justify-center gap-2">
           <div class="w-10 h-10 rounded-full bg-muted"></div>
           <div class="w-10 h-10 rounded-full bg-muted"></div>
           <div class="w-10 h-10 rounded-full bg-muted"></div>
        </div>
        <div class="space-y-4 pt-4 border-t border-border">
           <div class="h-4 bg-muted rounded w-full"></div>
           <div class="h-4 bg-muted rounded w-full"></div>
           <div class="h-4 bg-muted rounded w-full"></div>
        </div>
      </div>
      
      <div v-else>
        <!-- Profile Header -->
        <div class="flex flex-col items-center text-center space-y-4">
          <div class="relative">
            <div class="w-20 h-20 rounded-full bg-black flex items-center justify-center text-white text-2xl font-semibold">
              {{ initials }}
            </div>
            <button class="absolute bottom-0 right-0 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center border border-gray-100 hover:bg-gray-50">
              <MoreHorizontal class="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
          
          <div class="space-y-1">
            <h2 class="text-xl font-semibold text-foreground">{{ displayName }}</h2>
            <div class="text-sm text-muted-foreground" v-if="accountName">{{ accountName }}</div>
          </div>

          <div class="flex flex-wrap gap-2 justify-center">
            <Badge 
              v-for="tag in tags" 
              :key="tag" 
              variant="secondary"
              class="bg-green-100 text-green-700 hover:bg-green-200 border-transparent font-normal"
            >
              {{ tag }}
            </Badge>
            <button @click="$emit('add-tag')" class="inline-flex items-center justify-center w-6 h-6 rounded-full hover:bg-muted transition-colors">
              <Plus class="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
        </div>

        <!-- Details List -->
        <div class="mt-4 space-y-4 pt-4 border-t border-border">
          <div class="grid grid-cols-[100px_1fr] gap-2 text-sm">
            <div class="text-muted-foreground">Customer name</div>
            <div class="font-medium text-foreground text-right truncate">{{ displayName }}</div>
            
            <div class="text-muted-foreground">Account</div>
            <div class="font-medium text-foreground text-right truncate">{{ accountName || '-' }}</div>
            
            <div class="text-muted-foreground">Account Owner</div>
            <div class="font-medium text-foreground text-right truncate">-</div>
            
            <div class="text-muted-foreground">Email</div>
            <div class="font-medium text-foreground text-right truncate select-none">
               <a v-if="email" :href="`mailto:${email}`" class="hover:underline">{{ email }}</a>
               <span v-else>-</span>
            </div>
            
            <div class="text-muted-foreground">Phone</div>
            <div class="font-medium text-foreground text-right truncate flex items-center justify-end gap-1.5 min-w-0">
              <a v-if="phone" :href="`tel:${phone}`" class="hover:underline truncate">{{ phone }}</a>
              <span v-else>-</span>
              <Button
                v-if="phone"
                variant="ghost"
                size="icon"
                class="shrink-0 w-8 h-8 rounded-sm text-muted-foreground hover:text-foreground"
                :aria-label="'Copy phone number'"
                @click="copyPhone"
              >
                <Copy class="w-3.5 h-3.5" />
              </Button>
            </div>
            
            <div class="text-muted-foreground">Address</div>
            <div class="font-medium text-foreground text-right truncate">{{ address || '-' }}</div>
            
            <div class="text-muted-foreground">Language</div>
            <div class="font-medium text-foreground text-right truncate">{{ language || 'English' }}</div>
            
            <div class="text-muted-foreground">Fiscal Entities</div>
            <div class="font-medium text-foreground text-right truncate">MotorK</div>
            
            <div class="text-muted-foreground">Driven vehicle</div>
            <div class="font-medium text-foreground text-right truncate">{{ drivenVehicle || '-' }}</div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup>
import { computed } from 'vue'
import { Card, CardContent, Button, Badge } from '@motork/component-library/future/primitives'
import { MoreHorizontal, Plus, Copy } from 'lucide-vue-next'
import { useToastStore } from '@/stores/toast'

const props = defineProps({
  customer: { type: Object, required: true },
  account: { type: Object, default: null },
  cars: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  customerId: { type: [Number, String], default: null },
  customerType: { type: String, default: 'contact' }
})

const emit = defineEmits(['add-tag'])
const toastStore = useToastStore()

const copyPhone = async () => {
  if (!phone.value) return
  try {
    await navigator.clipboard.writeText(phone.value)
    toastStore.pushToast('success', 'Phone number copied to clipboard')
  } catch {
    toastStore.pushToast('error', 'Failed to copy phone number')
  }
}

const displayName = computed(() => {
  if (!props.customer) return ''
  return props.customer.name || `${props.customer.firstName || ''} ${props.customer.lastName || ''}`.trim()
})

const initials = computed(() => {
  if (!displayName.value) return '?'
  return displayName.value
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
})

const accountName = computed(() => props.account?.name || props.customer?.accountName || '')
const email = computed(() => props.customer?.email || '')
const phone = computed(() => props.customer?.phone || '')
const address = computed(() => {
  const addr = props.customer?.address
  if (typeof addr === 'string') return addr
  if (typeof addr === 'object' && addr) {
    return [addr.streetLine1, addr.city].filter(Boolean).join(', ')
  }
  return ''
})

const tags = computed(() => props.customer?.tags || [])
const language = computed(() => props.customer?.language || 'Spanish') // Hardcoded fallback based on screenshot
const drivenVehicle = computed(() => {
  if (props.cars && props.cars.length > 0) {
    const car = props.cars[0]
    return `${car.brand} ${car.model}`
  }
  return props.customer?.drivenVehicle || 'Porsche Macan'
}) // Hardcoded fallback based on screenshot
</script>
