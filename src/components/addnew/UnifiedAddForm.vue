<template>
  <form @submit.prevent="submitHandler" class="flex min-h-0 w-full min-w-0 flex-1 flex-col">
    <!-- Own scrollport so the footer is not "sticky" over content (avoids overlap). -->
    <div
      ref="manualFormScrollRef"
      class="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain -mx-6 px-6 [scrollbar-gutter:stable]"
    >
      <div class="mb-6 space-y-6">
        <div v-if="!hideContactSelection" class="space-y-6">
          <template v-if="!isCreatingContact">
            <SelectContactBox
              v-model="selectedContact"
              :duplicate-count="duplicateCount"
              @create-contact="startCreateContact"
            />
          </template>
          <ManualContactCreationPanel
            v-else
            :contact-form-data="contactFormData"
            :errors="errors"
            @request-close="onRequestCloseCreate"
          />
        </div>

        <Card v-else-if="selectedContact" class="bg-muted border-border">
          <CardContent class="p-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center text-sm font-bold border border-border">
                {{ selectedContact.initials }}
              </div>
              <div>
                <div class="text-sm font-semibold text-foreground">{{ selectedContact.name }}</div>
                <div class="text-sm text-muted-foreground">{{ selectedContact.email }}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <LeadDetailsSection
          v-if="showLeadDetails"
          :key="leadDetailsRemountKey"
          :lead-form="leadDetailsForm"
          :vehicle-form-data="vehicleFormData"
          :existing-contact-name="existingContactNameForVehicleSearch"
          :errors="errors"
        />
      </div>
    </div>

    <div
      class="shrink-0 z-20 -mx-6 border-t border-border bg-background/95 px-6 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur supports-[backdrop-filter]:bg-background/80"
    >
      <div class="flex items-center justify-end gap-4">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          :disabled="!canSubmit || isSubmitting"
          class="h-8 rounded-md w-full sm:w-auto"
          @click="submitSaveAndClose"
        >
          Save and close
        </Button>
        <Button
          type="submit"
          variant="default"
          size="sm"
          :disabled="!canSubmit || isSubmitting"
          class="h-8 rounded-md w-full sm:w-auto"
          @click="submitProceedToQualification"
        >
          Proceed to qualification
        </Button>
      </div>
    </div>

    <Dialog :open="showCloseCreateConfirm" @update:open="(o) => (showCloseCreateConfirm = o)">
      <DialogPortal>
        <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
        <DialogContent class="w-[90vw] max-w-none">
          <DialogHeader>
            <DialogTitle>{{ t('forms.addNew.manualContact.discardTitle') }}</DialogTitle>
            <p class="text-sm text-muted-foreground pt-1">{{ t('forms.addNew.manualContact.discardMessage') }}</p>
          </DialogHeader>
          <DialogFooter class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" class="w-full sm:w-auto" @click="showCloseCreateConfirm = false">
              {{ t('common.buttons.cancel') }}
            </Button>
            <Button variant="default" class="w-full sm:w-auto" @click="confirmDiscardCreate">
              {{ t('forms.addNew.manualContact.discardConfirm') }}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  </form>
</template>

<script setup>
import { ref, reactive, watch, onMounted, computed, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@motork/component-library/future/primitives'
import SelectContactBox from '@/components/addnew/SelectContactBox.vue'
import ManualContactCreationPanel from '@/components/addnew/ManualContactCreationPanel.vue'
import LeadDetailsSection from '@/components/addnew/LeadDetailsSection.vue'
import { useCustomersStore } from '@/stores/customers'
import { useUserStore } from '@/stores/user'
import {
  FISCAL_ENTITY_COMPANY_A,
  FISCAL_ENTITY_COMPANY_B,
  isKnownFiscalEntityId,
} from '@/constants/fiscalEntities'
import { useAddFormValidation } from '@/composables/useAddFormValidation'
import { useAddFormSubmission } from '@/composables/useAddFormSubmission'

const { t } = useI18n()

const props = defineProps({
  initialContact: {
    type: Object,
    default: null
  },
  hideContactSelection: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit'])

const customersStore = useCustomersStore()
const userStore = useUserStore()

function defaultFiscalEntityIdsForCreator() {
  const id = userStore.currentUser?.fiscalEntityId
  if (id && isKnownFiscalEntityId(id)) return [id]
  return [FISCAL_ENTITY_COMPANY_A]
}

function defaultLeadFiscalEntityId() {
  const id = userStore.currentUser?.fiscalEntityId
  if (id && isKnownFiscalEntityId(id)) return id
  return FISCAL_ENTITY_COMPANY_A
}

function createDefaultLeadDetailsForm() {
  return {
    department: 'sales',
    recordType: 'lead',
    requestType: '',
    channel: '',
    source: '',
    sourceDetail: '',
    fiscalEntity: defaultLeadFiscalEntityId(),
    dealership: '',
    requestMessage: '',
    notesToSellers: '',
    serviceName: '',
    serviceDescription: '',
    servicePrice: '',
    serviceOppNotes: '',
    assigneeId: '',
    assigneesFromRelationshipOnly: false,
  }
}

const contactMode = ref(props.initialContact ? 'existing' : 'new')
const selectedContact = ref(props.initialContact || null)
const isCreatingContact = ref(false)
const duplicateCount = 150
const showCloseCreateConfirm = ref(false)

function defaultPrivacyConsents() {
  const row = {
    dataProcessing: true,
    profiling: false,
    thirdParty: false,
    marketing: false,
    marketingChannels: {
      callPrimary: false,
      callSecondary: false,
      smsPrimary: false,
      smsSecondary: false,
      whatsappPrimary: false,
      whatsappSecondary: false,
      emailPrimary: false,
      emailSecondary: false,
      mailAddress: false,
    },
  }
  return {
    [FISCAL_ENTITY_COMPANY_A]: { ...row },
    [FISCAL_ENTITY_COMPANY_B]: { ...row },
  }
}

const contactFormData = reactive({
  name: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  company: '',
  /** When accountType === 'company': create new company vs link to existing account */
  companyAccountMode: 'link',
  /** Set when companyAccountMode is 'link': full account object from `fetchAccounts` */
  linkedAccount: null,
  companyVat: '',
  companyEmployeeCount: '',
  companyIsDealer: false,
  accountType: 'private',
  fiscalEntityIds: defaultFiscalEntityIdsForCreator(),
  secondaryPhones: [],
  secondaryEmails: [],
  town: '',
  zip: '',
  // "More details" accordion (structured) — submitted as a string via useAddFormSubmission
  detailsAddress: '',
  detailsAddressAdditionalInfo: '',
  detailsStateProvince: '',
  detailsCountry: 'IT',
  detailsTaxCode: '',
  detailsLanguage: '',
  detailsDateOfBirth: '',
  detailsPlaceOfBirth: '',
  detailsGender: '',
  detailsJobTitle: '',
  detailsFavoriteContactMethod: '',
  moreDetails: '',
  privacyConsents: defaultPrivacyConsents()
})

function createDefaultVehicleFormState() {
  return {
    stockVehicleId: null,
    /** Full selected vehicle object from inventory table (in-stock) */
    stockVehicle: null,
    label: '',
    summary: '',
    vin: '',
    plateNumber: '',
    brand: '',
    model: '',
    manualOpen: false,
    configureOpen: false,

    // Vehicle configurator (saved payload mirrored in useAddFormSubmission.cleanVehicleData)
    configImageUrl: '',
    configQuantity: null,
    configPrice: null,
    configSpecification: '',
    configPurchaseMethod: '',

    // Manual insert (Figma 1710:68242)
    manualVehicleClass: '',
    manualVehicleType: '',
    manualBrand: '',
    manualModel: '',
    manualVersion: '',
    manualFuelType: '',
    manualQuantity: '1',
    manualVehiclePrice: '',
  }
}

const vehicleFormData = reactive(createDefaultVehicleFormState())

const leadDetailsForm = reactive(createDefaultLeadDetailsForm())

const markAsLead = ref(false)
const markAsOpportunity = ref(false)
const lastContactKeyForAssignee = ref(null)

/** Lead details block is always visible in the scroll area (not gated on contact selection). */
const showLeadDetails = computed(() => true)

/** Existing picker contact only — used to prefill customer-vehicles search in Service + Lead modal. */
const existingContactNameForVehicleSearch = computed(() => {
  if (isCreatingContact.value) return ''
  return String(selectedContact.value?.name ?? '').trim()
})

function resolveDefaultAssigneeId() {
  const c = selectedContact.value
  if (c?.accountOwner?.id != null) return String(c.accountOwner.id)
  if (isCreatingContact.value) return String(userStore.currentUser?.id ?? '')
  return ''
}

function syncAssigneeFromContact() {
  leadDetailsForm.assigneeId = resolveDefaultAssigneeId()
}

watch(
  () => leadDetailsForm.recordType,
  (r) => {
    markAsLead.value = r === 'lead'
    markAsOpportunity.value = r === 'opportunity'
  },
  { immediate: true }
)

watch(
  [selectedContact, isCreatingContact, () => userStore.currentUser?.id],
  () => {
    let key = null
    if (selectedContact.value) {
      key = `c-${selectedContact.value.id}`
    } else if (isCreatingContact.value) {
      key = 'new'
    }
    if (key == null) return
    if (key !== lastContactKeyForAssignee.value) {
      lastContactKeyForAssignee.value = key
      syncAssigneeFromContact()
    }
  },
  { immediate: true }
)
const submitIntent = ref('save_and_close')
/** Bumps on full reset so LeadDetailsSection remounts (modal + local UI). */
const leadDetailsRemountKey = ref(0)
const manualFormScrollRef = ref(null)

watch(
  () => [contactFormData.firstName, contactFormData.lastName],
  () => {
    const n = [contactFormData.firstName, contactFormData.lastName]
      .map((s) => (s || '').trim())
      .filter(Boolean)
      .join(' ')
      .trim()
    contactFormData.name = n
  }
)

watch(
  () => props.initialContact,
  (newContact) => {
    if (newContact) {
      selectedContact.value = newContact
      contactMode.value = 'existing'
      isCreatingContact.value = false
    }
  },
  { immediate: true }
)

function clearCompanyAccountSubstate() {
  contactFormData.companyAccountMode = 'link'
  contactFormData.linkedAccount = null
  contactFormData.companyVat = ''
  contactFormData.companyEmployeeCount = ''
  contactFormData.companyIsDealer = false
  contactFormData.company = ''
}

watch(
  () => contactFormData.accountType,
  (t) => {
    if (t !== 'company') {
      clearCompanyAccountSubstate()
    } else {
      contactFormData.companyAccountMode = 'link'
    }
  }
)

watch(
  () => contactFormData.companyAccountMode,
  (mode, prev) => {
    if (mode === prev || prev === undefined) return
    if (mode === 'link') {
      contactFormData.linkedAccount = null
      contactFormData.company = ''
      contactFormData.companyVat = ''
      contactFormData.companyEmployeeCount = ''
      contactFormData.companyIsDealer = false
    } else {
      contactFormData.linkedAccount = null
      contactFormData.company = ''
    }
  }
)

function serializeForDirty() {
  return JSON.stringify({
    firstName: contactFormData.firstName,
    lastName: contactFormData.lastName,
    email: contactFormData.email,
    phone: contactFormData.phone,
    company: contactFormData.company,
    companyAccountMode: contactFormData.companyAccountMode,
    linkedAccount: contactFormData.linkedAccount ? { ...contactFormData.linkedAccount } : null,
    companyVat: contactFormData.companyVat,
    companyEmployeeCount: contactFormData.companyEmployeeCount,
    companyIsDealer: contactFormData.companyIsDealer,
    accountType: contactFormData.accountType,
    fiscalEntityIds: [...(contactFormData.fiscalEntityIds || [])].sort(),
    secondaryPhones: [...(contactFormData.secondaryPhones || [])],
    secondaryEmails: [...(contactFormData.secondaryEmails || [])],
    town: contactFormData.town,
    zip: contactFormData.zip,
    detailsAddress: contactFormData.detailsAddress,
    detailsAddressAdditionalInfo: contactFormData.detailsAddressAdditionalInfo,
    detailsStateProvince: contactFormData.detailsStateProvince,
    detailsCountry: contactFormData.detailsCountry,
    detailsTaxCode: contactFormData.detailsTaxCode,
    detailsLanguage: contactFormData.detailsLanguage,
    detailsDateOfBirth: contactFormData.detailsDateOfBirth,
    detailsPlaceOfBirth: contactFormData.detailsPlaceOfBirth,
    detailsGender: contactFormData.detailsGender,
    detailsJobTitle: contactFormData.detailsJobTitle,
    detailsFavoriteContactMethod: contactFormData.detailsFavoriteContactMethod,
    moreDetails: contactFormData.moreDetails,
    privacyConsents: JSON.parse(JSON.stringify(contactFormData.privacyConsents || {}))
  })
}

const createFormSnapshot = ref(serializeForDirty())

function resetContactFormData() {
  contactFormData.name = ''
  contactFormData.firstName = ''
  contactFormData.lastName = ''
  contactFormData.email = ''
  contactFormData.phone = ''
  contactFormData.company = ''
  contactFormData.companyAccountMode = 'link'
  contactFormData.linkedAccount = null
  contactFormData.companyVat = ''
  contactFormData.companyEmployeeCount = ''
  contactFormData.companyIsDealer = false
  contactFormData.accountType = 'private'
  contactFormData.fiscalEntityIds = defaultFiscalEntityIdsForCreator()
  contactFormData.secondaryPhones = []
  contactFormData.secondaryEmails = []
  contactFormData.town = ''
  contactFormData.zip = ''
  contactFormData.detailsAddress = ''
  contactFormData.detailsAddressAdditionalInfo = ''
  contactFormData.detailsStateProvince = ''
  contactFormData.detailsCountry = 'IT'
  contactFormData.detailsTaxCode = ''
  contactFormData.detailsLanguage = ''
  contactFormData.detailsDateOfBirth = ''
  contactFormData.detailsPlaceOfBirth = ''
  contactFormData.detailsGender = ''
  contactFormData.detailsJobTitle = ''
  contactFormData.detailsFavoriteContactMethod = ''
  contactFormData.moreDetails = ''
  contactFormData.privacyConsents = defaultPrivacyConsents()
  createFormSnapshot.value = serializeForDirty()
}

function isCreateDirty() {
  return serializeForDirty() !== createFormSnapshot.value
}

const { errors, canSubmit, validateContactForm, clearErrors } = useAddFormValidation({
  contactMode,
  selectedContact,
  isCreatingContact,
  contactFormData,
  hideContactSelection: computed(() => props.hideContactSelection),
  leadDetailsForm,
  vehicleFormData,
  showLeadDetailsBlock: showLeadDetails,
})

onMounted(() => {
  if (customersStore.customers.length === 0) {
    customersStore.fetchCustomers()
  }
})

watch(selectedContact, (v) => {
  if (v) {
    contactMode.value = 'existing'
    isCreatingContact.value = false
  }
})

function startCreateContact() {
  selectedContact.value = null
  contactMode.value = 'new'
  resetContactFormData()
  resetLeadDetailsForm()
  isCreatingContact.value = true
  syncAssigneeFromContact()
}

function exitCreateMode() {
  isCreatingContact.value = false
  resetContactFormData()
  resetLeadDetailsForm()
  clearErrors()
}

function onRequestCloseCreate() {
  if (!isCreateDirty()) {
    exitCreateMode()
    return
  }
  showCloseCreateConfirm.value = true
}

function confirmDiscardCreate() {
  showCloseCreateConfirm.value = false
  exitCreateMode()
}

const { isSubmitting, handleSubmit: submitHandler, resetSubmitting } = useAddFormSubmission({
  contactMode,
  selectedContact,
  contactFormData,
  vehicleFormData,
  leadDetailsForm,
  markAsLead,
  markAsOpportunity,
  submitIntent,
  validateContactForm,
  onSubmit: (submissionData) => {
    emit('submit', submissionData)
  }
})

function submitSaveAndClose() {
  submitIntent.value = 'save_and_close'
  submitHandler()
}

function submitProceedToQualification() {
  submitIntent.value = 'proceed_to_qualification'
  submitHandler()
}

function resetVehicleFormData() {
  Object.assign(vehicleFormData, createDefaultVehicleFormState())
}

function resetLeadDetailsForm() {
  const d = createDefaultLeadDetailsForm()
  Object.keys(d).forEach((k) => {
    leadDetailsForm[k] = d[k]
  })
  markAsLead.value = leadDetailsForm.recordType === 'lead'
  markAsOpportunity.value = leadDetailsForm.recordType === 'opportunity'
  lastContactKeyForAssignee.value = null
  resetVehicleFormData()
}

const handleClear = async () => {
  contactMode.value = 'new'
  selectedContact.value = null
  isCreatingContact.value = false
  submitIntent.value = 'save_and_close'
  leadDetailsRemountKey.value += 1
  resetContactFormData()
  resetLeadDetailsForm()
  clearErrors()
  await nextTick()
  const el = manualFormScrollRef.value
  if (el) {
    el.scrollTop = 0
  }
}

defineExpose({
  resetSubmitting,
  submit: submitHandler,
  clear: handleClear,
  canSubmit,
  isSubmitting
})
</script>
