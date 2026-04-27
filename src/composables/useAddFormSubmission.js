import { ref, computed } from 'vue'

/**
 * Composable for UnifiedAddForm submission logic
 * 
 * @param {Object} params - Parameters object
 * @param {import('vue').Ref<string>} params.contactMode - Contact mode ('new' or 'existing')
 * @param {import('vue').Ref<Object|null>} params.selectedContact - Selected existing contact
 * @param {Object} params.contactFormData - Contact form data (reactive)
 * @param {Object} params.vehicleFormData - Vehicle form data (reactive)
 * @param {Object} [params.leadDetailsForm] - Lead details block (reactive)
 * @param {import('vue').Ref<boolean>} params.markAsLead - Mark as lead flag
 * @param {import('vue').Ref<boolean>} params.markAsOpportunity - Mark as opportunity flag
 * @param {Function} params.validateContactForm - Validation function
 * @param {Function} params.onSubmit - Submit callback function
 * @returns {Object} Object containing submission state and handlers
 */
export function useAddFormSubmission({
  contactMode,
  selectedContact,
  contactFormData,
  vehicleFormData,
  leadDetailsForm,
  markAsLead,
  markAsOpportunity,
  submitIntent,
  validateContactForm,
  onSubmit
}) {
  const isSubmitting = ref(false)

  const buildMoreDetailsFromStructured = () => {
    const lines = []
    const push = (label, value) => {
      const v = (value || '').toString().trim()
      if (!v) return
      lines.push(`${label}: ${v}`)
    }
    push('Address', contactFormData.detailsAddress)
    push('Address additional info', contactFormData.detailsAddressAdditionalInfo)
    push('State/Province', contactFormData.detailsStateProvince)
    push('Country', contactFormData.detailsCountry)
    push('Tax code', contactFormData.detailsTaxCode)
    push('Language', contactFormData.detailsLanguage)
    push('Date of birth', contactFormData.detailsDateOfBirth)
    push('Place of birth', contactFormData.detailsPlaceOfBirth)
    push('Gender', contactFormData.detailsGender)
    push('Job title', contactFormData.detailsJobTitle)
    push('Favorite contact method', contactFormData.detailsFavoriteContactMethod)
    return lines.join('\n').trim()
  }

  /**
   * Cleans vehicle data by removing empty values
   * @param {Object} vehicleData - Vehicle form data
   * @returns {Object} Cleaned vehicle data
   */
  const cleanVehicleData = (vehicleData) => {
    if (!vehicleData || typeof vehicleData !== 'object') return {}

    // Mutual exclusivity: stock, manual insert, or opportunity “Configure” placeholder.
    const hasStock = vehicleData.stockVehicleId != null
    const isManual = vehicleData.manualOpen === true
    const isConfigure = vehicleData.configureOpen === true

    if (hasStock) {
      const out = {
        stockVehicleId: vehicleData.stockVehicleId,
        brand: vehicleData.brand,
        model: vehicleData.model,
        vin: vehicleData.vin,
        plateNumber: vehicleData.plateNumber,
        label: vehicleData.label,
        summary: vehicleData.summary,
      }
      return Object.entries(out).reduce((acc, [key, value]) => {
        if (value !== null && value !== '' && value !== undefined) acc[key] = value
        return acc
      }, {})
    }

    if (isConfigure) {
      return { configureOpen: true }
    }

    if (isManual) {
      const out = {
        manualVehicleClass: vehicleData.manualVehicleClass,
        manualVehicleType: vehicleData.manualVehicleType,
        manualBrand: vehicleData.manualBrand,
        manualModel: vehicleData.manualModel,
        manualVersion: vehicleData.manualVersion,
        manualFuelType: vehicleData.manualFuelType,
        manualQuantity: vehicleData.manualQuantity,
        manualVehiclePrice: vehicleData.manualVehiclePrice,
      }
      return Object.entries(out).reduce((acc, [key, value]) => {
        if (value !== null && value !== '' && value !== undefined) acc[key] = value
        return acc
      }, {})
    }

    return {}
  }

  /**
   * Prepares contact data for submission
   * @returns {Object|null} Contact data or null if using existing contact
   */
  const prepareContactData = () => {
    if (contactMode.value === 'new') {
      const name =
        [contactFormData.firstName, contactFormData.lastName]
          .map((s) => (s || '').trim())
          .filter(Boolean)
          .join(' ')
          .trim() || (contactFormData.name || '').trim()
      const companyTrim = (contactFormData.company || '').trim()
      return {
        name,
        firstName: (contactFormData.firstName || '').trim(),
        lastName: (contactFormData.lastName || '').trim(),
        email: (contactFormData.email || '').trim(),
        phone: (contactFormData.phone || '').trim(),
        company: companyTrim,
        accountType: contactFormData.accountType || 'private',
        companyAccountMode: contactFormData.companyAccountMode || 'link',
        linkedAccountId:
          contactFormData.linkedAccount && contactFormData.linkedAccount.id != null
            ? contactFormData.linkedAccount.id
            : null,
        linkedAccount: contactFormData.linkedAccount
          ? JSON.parse(JSON.stringify(contactFormData.linkedAccount))
          : null,
        companyVat: (contactFormData.companyVat || '').trim(),
        companyEmployeeCount: (contactFormData.companyEmployeeCount || '').toString().trim(),
        companyIsDealer: !!contactFormData.companyIsDealer,
        fiscalEntityIds: Array.isArray(contactFormData.fiscalEntityIds) ? [...contactFormData.fiscalEntityIds] : [],
        secondaryPhones: (contactFormData.secondaryPhones || []).map((p) => (p || '').trim()).filter(Boolean),
        secondaryEmails: (contactFormData.secondaryEmails || []).map((e) => (e || '').trim()).filter(Boolean),
        town: (contactFormData.town || '').trim(),
        zip: (contactFormData.zip || '').trim(),
        moreDetails: buildMoreDetailsFromStructured() || (contactFormData.moreDetails || '').trim(),
        privacyConsents: contactFormData.privacyConsents
          ? JSON.parse(JSON.stringify(contactFormData.privacyConsents))
          : {}
      }
    }
    return null
  }

  /**
   * Handles form submission
   */
  const handleSubmit = () => {
    // Validate
    if (!validateContactForm()) {
      return
    }

    isSubmitting.value = true

    // Clean vehicle data (remove empty values)
    const cleanedVehicleData = cleanVehicleData(vehicleFormData)

    // Prepare contact data
    const contactData = prepareContactData()

    const leadDetails =
      leadDetailsForm && typeof leadDetailsForm === 'object'
        ? JSON.parse(JSON.stringify(leadDetailsForm))
        : null

    // Prepare submission data
    const submissionData = {
      intent: submitIntent?.value || 'save_and_close',
      contactMode: contactMode.value,
      selectedContact: selectedContact.value,
      contactData,
      vehicleData: Object.keys(cleanedVehicleData).length > 0 ? cleanedVehicleData : null,
      leadDetails,
      markAsLead: markAsLead.value,
      markAsOpportunity: markAsOpportunity.value
    }

    // Call onSubmit callback (emit function)
    if (onSubmit) {
      onSubmit(submissionData)
    }
  }

  /**
   * Resets submitting state
   */
  const resetSubmitting = () => {
    isSubmitting.value = false
  }

  return {
    isSubmitting: computed(() => isSubmitting.value),
    handleSubmit,
    resetSubmitting
  }
}

