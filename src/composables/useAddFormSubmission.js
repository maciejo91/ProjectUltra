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
  const pickNonEmpty = (obj) =>
    Object.entries(obj).reduce((acc, [key, value]) => {
      if (value !== null && value !== '' && value !== undefined) acc[key] = value
      return acc
    }, {})

  const parseManualPrice = (raw) => {
    const s = String(raw ?? '')
      .trim()
      .replace(/€/g, '')
      .replace(/\s/g, '')
      .replace(',', '.')
    if (!s) return null
    const n = Number.parseFloat(s)
    return Number.isFinite(n) ? n : null
  }

  const cleanVehicleData = (vehicleData) => {
    if (!vehicleData || typeof vehicleData !== 'object') return {}

    // Mutual exclusivity: stock, manual insert, or opportunity “Configure” flow.
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
      return pickNonEmpty(out)
    }

    if (isConfigure) {
      const summary = String(vehicleData.summary || '').trim()
      const spec = String(vehicleData.configSpecification || '').trim()
      const purchase = String(vehicleData.configPurchaseMethod || '').trim()
      const msgParts = [summary, spec, purchase ? `Purchase: ${purchase}` : ''].filter(Boolean)
      const requestMessage = msgParts.join('\n\n').trim() || undefined
      const priceRaw = vehicleData.configPrice
      const price =
        priceRaw != null && priceRaw !== '' && Number.isFinite(Number(priceRaw)) ? Number(priceRaw) : undefined
      const image = String(vehicleData.configImageUrl || '').trim() || undefined
      const out = {
        brand: String(vehicleData.brand || '').trim(),
        model: String(vehicleData.model || '').trim(),
        label: String(vehicleData.label || '').trim(),
        summary: summary || undefined,
        image,
        price,
        requestMessage,
      }
      return pickNonEmpty(out)
    }

    if (isManual) {
      const isServiceDept = leadDetailsForm?.department === 'service'

      if (isServiceDept) {
        const brand = String(vehicleData.manualBrand || '').trim()
        const model = String(vehicleData.manualModel || '').trim()
        const kmRaw = String(vehicleData.manualMileage ?? '')
          .trim()
          .replace(/\./g, '')
          .replace(/km/gi, '')
          .replace(/\s/g, '')
        const kmParsed = kmRaw ? Number.parseInt(kmRaw, 10) : NaN
        const kilometers = Number.isFinite(kmParsed) ? kmParsed : undefined

        const yearRaw = String(vehicleData.manualModelYear ?? '').trim()
        const yearParsed = yearRaw ? Number.parseInt(yearRaw, 10) : NaN
        const year = Number.isFinite(yearParsed) ? yearParsed : undefined

        const vin = String(vehicleData.vin || '').trim()
        const plate = String(vehicleData.plateNumber || '').trim()

        const out = {
          brand,
          model,
          year,
          vehicleClass: String(vehicleData.manualVehicleClass || '').trim() || undefined,
          fuelType: String(vehicleData.manualFuelType || '').trim() || undefined,
          gearType: String(vehicleData.manualGearType || '').trim() || undefined,
          vin: vin || undefined,
          plateNumber: plate || undefined,
          plates: plate || undefined,
          kilometers,
          registration: String(vehicleData.manualRegistration || '').trim() || undefined,
          owner: String(vehicleData.manualOwner || '').trim() || undefined,
          ownedSince: String(vehicleData.manualOwnedSince || '').trim() || undefined,
          displacement: String(vehicleData.manualDisplacement || '').trim() || undefined,
          hp: String(vehicleData.manualHp || '').trim() || undefined,
          kw: String(vehicleData.manualKw || '').trim() || undefined,
          colour: String(vehicleData.manualColour || '').trim() || undefined,
          tractionType: String(vehicleData.manualTractionType || '').trim() || undefined,
          doors: String(vehicleData.manualDoors || '').trim() || undefined,
          seats: String(vehicleData.manualSeats || '').trim() || undefined,
          lastKmUpdate: String(vehicleData.manualLastKmUpdate || '').trim() || undefined,
          warrantyStart: String(vehicleData.manualWarrantyStart || '').trim() || undefined,
          warrantyDurationMonths:
            String(vehicleData.manualWarrantyDurationMonths || '').trim() || undefined,
          warrantyEnd: String(vehicleData.manualWarrantyEnd || '').trim() || undefined,
        }
        return pickNonEmpty(out)
      }

      const brand = String(vehicleData.manualBrand || '').trim()
      const modelLine = [vehicleData.manualModel, vehicleData.manualVersion]
        .map((s) => String(s || '').trim())
        .filter(Boolean)
        .join(' ')
      const fuelType = String(vehicleData.manualFuelType || '').trim()
      const price = parseManualPrice(vehicleData.manualVehiclePrice)
      const cls = String(vehicleData.manualVehicleClass || '').trim()
      const vtype = String(vehicleData.manualVehicleType || '').trim()
      const metaParts = [cls, vtype].filter(Boolean)
      const requestMessage = metaParts.length ? metaParts.join(' · ') : undefined
      const out = {
        brand,
        model: modelLine,
        fuelType: fuelType || undefined,
        price: price != null ? price : undefined,
        requestMessage,
      }
      return pickNonEmpty(out)
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

