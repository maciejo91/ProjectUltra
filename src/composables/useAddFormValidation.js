import { reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { validateEmailFormat, validateInternationalPhone } from '@/utils/contactFieldValidation'

const LEAD_ERROR_KEYS = [
  'requestType',
  'channel',
  'source',
  'fiscalEntity',
  'dealership',
  'assigneeId',
  'serviceName',
  'serviceDescription',
  'servicePrice',
  'vehicle',
]

/** Sales + Opportunity: stock pick, or label/summary, or brand+model, or Configure flow */
function hasRequiredVehicleInfo(v) {
  if (!v) return false
  if (v.configureOpen === true) return true
  if (v.stockVehicleId != null) return true
  if ((v.label || v.summary || '').toString().trim()) return true
  const b = (v.brand || '').toString().trim()
  const m = (v.model || '').toString().trim()
  if (b && m) return true
  return false
}

function clearLeadFields(errors) {
  for (const k of LEAD_ERROR_KEYS) {
    errors[k] = ''
  }
}

/**
 * @param {Object} params
 * @param {import('vue').Ref<string>} params.contactMode
 * @param {import('vue').Ref<Object|null>} params.selectedContact
 * @param {import('vue').Ref<boolean>} params.isCreatingContact
 * @param {import('vue').Ref<boolean>} [params.hideContactSelection] — when true, “contact chosen” = selectedContact
 * @param {import('vue').ComputedRef<boolean>|import('vue').Ref<boolean>} [params.showLeadDetailsBlock]
 * @param {Object} [params.leadDetailsForm] — reactive lead details (department, recordType, fields…)
 * @param {Object} [params.vehicleFormData] — vehicle block (reactive), required for sales+opportunity checks
 * @param {Object} params.contactFormData
 */
export function useAddFormValidation({
  contactMode,
  selectedContact,
  isCreatingContact,
  contactFormData,
  hideContactSelection = { value: false },
  showLeadDetailsBlock,
  leadDetailsForm,
  vehicleFormData = null,
}) {
  const { t } = useI18n()

  const errors = reactive({
    name: '',
    email: '',
    firstName: '',
    lastName: '',
    company: '',
    linkedAccount: '',
    companyEmployeeCount: '',
    fiscalEntities: '',
    phoneOrEmail: '',
    phone: '',
    secondaryPhone: '',
    requestType: '',
    channel: '',
    source: '',
    fiscalEntity: '',
    dealership: '',
    assigneeId: '',
    serviceName: '',
    serviceDescription: '',
    servicePrice: '',
    vehicle: '',
  })

  const validateEmail = validateEmailFormat

  const hasPhoneOrEmail = () => {
    const p = (contactFormData.phone || '').trim()
    const e = (contactFormData.email || '').trim()
    return !!(p || e)
  }

  const isManualFormStructurallyValid = () => {
    if (!(contactFormData.firstName || '').trim()) return false
    if (!(contactFormData.lastName || '').trim()) return false
    if (!((contactFormData.fiscalEntityIds || []).length > 0)) return false
    if (contactFormData.accountType === 'company') {
      if (contactFormData.companyAccountMode === 'link') {
        if (!contactFormData.linkedAccount || contactFormData.linkedAccount.id == null) return false
        if (!(contactFormData.company || '').trim()) return false
      } else if (!(contactFormData.company || '').trim()) {
        return false
      } else {
        const ec = (contactFormData.companyEmployeeCount || '').toString().trim()
        if (ec && !/^\d+$/.test(ec)) return false
        if (ec && parseInt(ec, 10) < 1) return false
      }
    }
    if (!hasPhoneOrEmail()) return false
    const e = (contactFormData.email || '').trim()
    if (e && !validateEmail(e)) return false
    const phoneTrim = (contactFormData.phone || '').trim()
    if (phoneTrim && !validateInternationalPhone(contactFormData.phone)) return false
    for (const ph of contactFormData.secondaryPhones || []) {
      const pt = (ph || '').trim()
      if (pt && !validateInternationalPhone(ph)) return false
    }
    for (const em of contactFormData.secondaryEmails || []) {
      const row = (em || '').trim()
      if (row && !validateEmail(row)) return false
    }
    return true
  }

  const isLeadBlockShown = () => {
    if (showLeadDetailsBlock && 'value' in showLeadDetailsBlock) {
      return !!showLeadDetailsBlock.value
    }
    if (hideContactSelection && hideContactSelection.value) {
      return !!selectedContact.value
    }
    return !!selectedContact.value || isCreatingContact.value
  }

  const isLeadDetailsStructurallyValid = () => {
    if (!leadDetailsForm) return true
    const f = leadDetailsForm
    const s = f.department === 'service' && f.recordType === 'opportunity'
    const o = f.recordType === 'opportunity'
    const salesLead = f.department === 'sales' && f.recordType === 'lead'
    const salesOpp = f.department === 'sales' && f.recordType === 'opportunity'

    const tStr = (v) => (v == null ? '' : String(v)).trim()

    const isManualVehicleValid = () => {
      if (!vehicleFormData) return false
      const qty = tStr(vehicleFormData.manualQuantity)
      const n = qty ? Number(qty) : NaN
      if (!tStr(vehicleFormData.manualBrand)) return false
      if (!tStr(vehicleFormData.manualModel)) return false
      if (!Number.isFinite(n) || n <= 0) return false
      return true
    }

    if (s) {
      if (!tStr(f.requestType)) return false
      if (!tStr(f.serviceName)) return false
      if (!tStr(f.channel)) return false
      if (!tStr(f.source)) return false
      if (!tStr(f.fiscalEntity)) return false
      if (!tStr(f.dealership)) return false
      if (!tStr(f.assigneeId)) return false
      return true
    }
    if (!tStr(f.requestType) || !tStr(f.channel) || !tStr(f.source) || !tStr(f.fiscalEntity) || !tStr(f.dealership)) {
      return false
    }
    if (o && !tStr(f.assigneeId)) return false
    if (salesLead) {
      // Vehicle required for Sales lead: either stock selection or valid manual insert
      const hasStock = vehicleFormData && vehicleFormData.stockVehicleId != null
      const hasManual = vehicleFormData && vehicleFormData.manualOpen === true
      if (!hasStock && !(hasManual && isManualVehicleValid())) return false
    }
    if (salesOpp && vehicleFormData && !hasRequiredVehicleInfo(vehicleFormData)) {
      return false
    }
    return true
  }

  const canSubmit = computed(() => {
    if (contactMode.value === 'existing') {
      if (!selectedContact.value) return false
      if (isLeadBlockShown() && !isLeadDetailsStructurallyValid()) return false
      return true
    }
    if (contactMode.value === 'new' && isCreatingContact.value) {
      if (!isManualFormStructurallyValid()) return false
      if (isLeadBlockShown() && !isLeadDetailsStructurallyValid()) return false
      return true
    }
    if (!!selectedContact.value) {
      if (isLeadBlockShown() && !isLeadDetailsStructurallyValid()) return false
      return true
    }
    return false
  })

  const validateLeadDetailsForm = () => {
    if (!leadDetailsForm) return true
    clearLeadFields(errors)
    const f = leadDetailsForm
    const tStr = (v) => (v == null ? '' : String(v)).trim()
    const setE = (key, i18nKey) => {
      errors[key] = t(`forms.addNew.leadDetails.errors.${i18nKey}`)
    }

    const s = f.department === 'service' && f.recordType === 'opportunity'
    const o = f.recordType === 'opportunity'
    const salesLead = f.department === 'sales' && f.recordType === 'lead'
    const salesOpp = f.department === 'sales' && f.recordType === 'opportunity'

    const isManualVehicleValid = () => {
      if (!vehicleFormData) return false
      const qty = tStr(vehicleFormData.manualQuantity)
      const n = qty ? Number(qty) : NaN
      if (!tStr(vehicleFormData.manualBrand)) return false
      if (!tStr(vehicleFormData.manualModel)) return false
      if (!Number.isFinite(n) || n <= 0) return false
      return true
    }

    if (s) {
      if (!tStr(f.requestType)) {
        setE('requestType', 'requestType')
      }
      if (!tStr(f.serviceName)) {
        setE('serviceName', 'serviceName')
      }
      if (!tStr(f.channel)) {
        setE('channel', 'channel')
      }
      if (!tStr(f.source)) {
        setE('source', 'source')
      }
      if (!tStr(f.fiscalEntity)) {
        setE('fiscalEntity', 'fiscalEntity')
      }
      if (!tStr(f.dealership)) {
        setE('dealership', 'dealership')
      }
      if (!tStr(f.assigneeId)) {
        setE('assigneeId', 'assignee')
      }
    } else {
      if (!tStr(f.requestType)) {
        setE('requestType', 'requestType')
      }
      if (!tStr(f.channel)) {
        setE('channel', 'channel')
      }
      if (!tStr(f.source)) {
        setE('source', 'source')
      }
      if (!tStr(f.fiscalEntity)) {
        setE('fiscalEntity', 'fiscalEntity')
      }
      if (!tStr(f.dealership)) {
        setE('dealership', 'dealership')
      }
      if (o && !tStr(f.assigneeId)) {
        setE('assigneeId', 'assignee')
      }
      if (salesLead) {
        const hasStock = vehicleFormData && vehicleFormData.stockVehicleId != null
        const hasManual = vehicleFormData && vehicleFormData.manualOpen === true
        if (!hasStock && !(hasManual && isManualVehicleValid())) {
          setE('vehicle', 'vehicle')
        }
      }
      if (salesOpp && vehicleFormData && !hasRequiredVehicleInfo(vehicleFormData)) {
        setE('vehicle', 'vehicle')
      }
    }

    return !LEAD_ERROR_KEYS.some((k) => !!errors[k])
  }

  const validateContactForm = () => {
    Object.keys(errors).forEach((k) => {
      errors[k] = ''
    })

    if (contactMode.value === 'existing') {
      if (!selectedContact.value) {
        errors.name = 'Select a contact'
        return false
      }
      if (isLeadBlockShown() && !validateLeadDetailsForm()) {
        return false
      }
      return true
    }

    if (contactMode.value === 'new' && !isCreatingContact.value) {
      if (!selectedContact.value) {
        errors.name = 'Select a contact or create a new one'
        return false
      }
      if (isLeadBlockShown() && !validateLeadDetailsForm()) {
        return false
      }
      return true
    }

    // manual create
    let ok = true
    if (!(contactFormData.firstName || '').trim()) {
      errors.firstName = 'First name is required'
      ok = false
    }
    if (!(contactFormData.lastName || '').trim()) {
      errors.lastName = 'Last name is required'
      ok = false
    }
    if (!((contactFormData.fiscalEntityIds || []).length > 0)) {
      errors.fiscalEntities = 'Select at least one fiscal entity'
      ok = false
    }
    if (contactFormData.accountType === 'company') {
      if (contactFormData.companyAccountMode === 'link') {
        if (!contactFormData.linkedAccount || contactFormData.linkedAccount.id == null) {
          errors.linkedAccount = t('forms.addNew.manualContact.companyAccount.errors.selectAccount')
          ok = false
        }
        if (!(contactFormData.company || '').trim()) {
          errors.company = t('forms.addNew.manualContact.errors.companyRequired')
          ok = false
        }
      } else {
        if (!(contactFormData.company || '').trim()) {
          errors.company = t('forms.addNew.manualContact.errors.companyRequired')
          ok = false
        }
        const ec = (contactFormData.companyEmployeeCount || '').toString().trim()
        if (ec) {
          if (!/^\d+$/.test(ec) || parseInt(ec, 10) < 1) {
            errors.companyEmployeeCount = t('forms.addNew.manualContact.companyAccount.errors.employeesInvalid')
            ok = false
          }
        }
      }
    }
    if (!hasPhoneOrEmail()) {
      errors.phoneOrEmail = t('forms.addNew.manualContact.errors.phoneOrEmailRequired')
      ok = false
    }
    const phoneTrim = (contactFormData.phone || '').trim()
    if (phoneTrim && !validateInternationalPhone(contactFormData.phone)) {
      errors.phone = t('forms.addNew.manualContact.errors.phoneInvalid')
      ok = false
    }
    for (const ph of contactFormData.secondaryPhones || []) {
      const pt = (ph || '').trim()
      if (pt && !validateInternationalPhone(ph)) {
        errors.secondaryPhone = t('forms.addNew.manualContact.errors.secondaryPhoneInvalid')
        ok = false
        break
      }
    }
    const emailTrim = (contactFormData.email || '').trim()
    if (emailTrim && !validateEmail(emailTrim)) {
      errors.email = t('forms.addNew.manualContact.errors.emailInvalid')
      ok = false
    }
    for (const em of contactFormData.secondaryEmails || []) {
      const row = (em || '').trim()
      if (row && !validateEmail(row)) {
        errors.email = t('forms.addNew.manualContact.errors.secondaryEmailInvalid')
        ok = false
        break
      }
    }
    if (ok && isLeadBlockShown() && !validateLeadDetailsForm()) {
      return false
    }
    return ok
  }

  const clearErrors = () => {
    Object.keys(errors).forEach((k) => {
      errors[k] = ''
    })
  }

  if (vehicleFormData) {
    watch(
      () => [
        vehicleFormData.stockVehicleId,
        vehicleFormData.label,
        vehicleFormData.summary,
        vehicleFormData.brand,
        vehicleFormData.model,
        vehicleFormData.manualOpen,
        vehicleFormData.configureOpen,
        vehicleFormData.manualBrand,
        vehicleFormData.manualModel,
        vehicleFormData.manualQuantity,
      ],
      () => {
        if (errors.vehicle) errors.vehicle = ''
      },
      { deep: true }
    )
  }

  return {
    errors,
    canSubmit,
    validateEmail,
    validateContactForm,
    clearErrors,
  }
}
