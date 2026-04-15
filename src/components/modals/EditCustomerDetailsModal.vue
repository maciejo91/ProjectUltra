<template>
  <Dialog :open="show" @update:open="handleOpenChange">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent
        class="w-full sm:max-w-2xl max-h-[calc(100vh-4rem)] flex flex-col"
        :show-close-button="true"
      >
        <DialogHeader class="shrink-0">
          <DialogTitle>{{ t('requestDetail.editCustomerModal.title') }}</DialogTitle>
        </DialogHeader>

        <div class="flex-1 overflow-y-auto py-4 w-full space-y-6">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div class="space-y-2">
              <Label class="block text-sm font-semibold text-foreground">{{
                t('requestDetail.editCustomerModal.firstName')
              }}</Label>
              <Input
                v-model="form.firstName"
                type="text"
                class="w-full"
                :placeholder="t('requestDetail.editCustomerModal.placeholders.firstName')"
              />
            </div>
            <div class="space-y-2">
              <Label class="block text-sm font-semibold text-foreground">{{
                t('requestDetail.editCustomerModal.surname')
              }}</Label>
              <Input
                v-model="form.surname"
                type="text"
                class="w-full"
                :placeholder="t('requestDetail.editCustomerModal.placeholders.surname')"
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label class="block text-sm font-semibold text-foreground">{{
              t('requestDetail.editCustomerModal.location')
            }}</Label>
            <Input
              v-model="form.location"
              type="text"
              class="w-full"
              :placeholder="t('requestDetail.editCustomerModal.placeholders.location')"
            />
          </div>

          <div class="space-y-2">
            <Label class="block text-sm font-semibold text-foreground">{{
              t('requestDetail.editCustomerModal.address')
            }}</Label>
            <Input
              v-model="form.address"
              type="text"
              class="w-full"
              :placeholder="t('requestDetail.editCustomerModal.placeholders.address')"
            />
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div class="space-y-2">
              <Label class="block text-sm font-semibold text-foreground">{{
                t('requestDetail.editCustomerModal.email')
              }}</Label>
              <Input
                v-model="form.email"
                type="email"
                class="w-full"
                autocomplete="email"
                :placeholder="t('requestDetail.editCustomerModal.placeholders.email')"
              />
            </div>
            <div class="space-y-2">
              <Label class="block text-sm font-semibold text-foreground">{{
                t('requestDetail.editCustomerModal.phone')
              }}</Label>
              <Input
                v-model="form.phone"
                type="tel"
                class="w-full"
                autocomplete="tel"
                :placeholder="t('requestDetail.editCustomerModal.placeholders.phone')"
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label class="block text-sm font-semibold text-foreground">{{
              t('requestDetail.editCustomerModal.tags')
            }}</Label>
            <Input
              v-model="form.tagsInput"
              type="text"
              class="w-full"
              :placeholder="t('requestDetail.editCustomerModal.placeholders.tags')"
            />
            <p class="text-sm text-muted-foreground">
              {{ t('requestDetail.editCustomerModal.tagsHint') }}
            </p>
          </div>
        </div>

        <DialogFooter
          class="shrink-0 flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3"
        >
          <Button
            type="button"
            variant="outline"
            class="rounded-sm w-full sm:w-auto"
            @click="handleOpenChange(false)"
          >
            {{ t('common.buttons.cancel') }}
          </Button>
          <Button
            type="button"
            variant="default"
            class="rounded-sm w-full sm:w-auto"
            :disabled="saveDisabled || saving"
            @click="submit"
          >
            {{
              saving
                ? t('requestDetail.editCustomerModal.saving')
                : t('common.buttons.save')
            }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogPortal>
  </Dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  Input,
  Label
} from '@motork/component-library/future/primitives'
import {
  buildCustomerDisplayName,
  getCustomerCityLabel,
  parseCustomerNameForEdit
} from '@/utils/customerDisplay'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  customer: {
    type: Object,
    default: null
  },
  saving: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:open', 'save'])

const { t } = useI18n()

const form = ref({
  firstName: '',
  surname: '',
  location: '',
  address: '',
  email: '',
  phone: '',
  tagsInput: ''
})

function normalizeTagsList(tags) {
  return (tags || []).map((item) =>
    typeof item === 'string'
      ? { name: item, color: null }
      : { name: item.name, color: item.color || null }
  )
}

function tagsToInputString(tags) {
  return normalizeTagsList(tags)
    .map((t) => t.name)
    .filter(Boolean)
    .join(', ')
}

function parseTagsInputToPayload(tagsInput, previousTags) {
  const prev = normalizeTagsList(previousTags)
  const names = String(tagsInput || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const seen = new Set()
  const unique = names.filter((n) => {
    const k = n.toLowerCase()
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
  return unique.map((name) => {
    const old = prev.find((p) => p.name === name)
    return { name, color: old?.color ?? null }
  })
}

function customerAddressString(customer) {
  if (!customer) return ''
  const addr = customer.address
  if (typeof addr === 'string') return addr
  if (!addr) return ''
  return [
    addr.streetLine1 || addr.streetAddress || addr.street,
    addr.streetLine2,
    [addr.city, addr.region, addr.postalCode].filter(Boolean).join(', '),
    addr.country
  ]
    .filter(Boolean)
    .join(', ')
}

function resetFormFromCustomer(customer) {
  if (!customer) return
  const parsed = parseCustomerNameForEdit(customer.name || '')
  let location = parsed.location
  if (!location) location = getCustomerCityLabel(customer)
  form.value = {
    firstName: parsed.firstName,
    surname: parsed.surname,
    location,
    address: customerAddressString(customer),
    email: customer.email || '',
    phone: customer.phone || '',
    tagsInput: tagsToInputString(customer.tags)
  }
}

watch(
  () => [props.show, props.customer],
  () => {
    if (props.show && props.customer) {
      resetFormFromCustomer(props.customer)
    }
  },
  { immediate: true }
)

const saveDisabled = computed(() => {
  const core = [form.value.firstName, form.value.surname]
    .map((s) => (s ?? '').trim())
    .filter(Boolean)
    .join(' ')
  return !core
})

function handleOpenChange(open) {
  emit('update:open', open)
}

function submit() {
  if (saveDisabled.value || props.saving || !props.customer) return
  const name = buildCustomerDisplayName({
    firstName: form.value.firstName,
    surname: form.value.surname,
    location: form.value.location
  })
  const tags = parseTagsInputToPayload(form.value.tagsInput, props.customer.tags)
  emit('save', {
    name,
    phone: (form.value.phone ?? '').trim() || null,
    email: (form.value.email ?? '').trim() || null,
    address: (form.value.address ?? '').trim() || null,
    tags
  })
}
</script>
