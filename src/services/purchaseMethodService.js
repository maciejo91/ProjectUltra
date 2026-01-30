import { PurchaseMethodRepository } from '@/repositories/PurchaseMethodRepository'

/**
 * Purchase Method Service
 * 
 * Handles business logic for purchase methods:
 * - Calculates total amounts based on type
 * - Validates purchase method data
 * - Enriches purchase methods with related data
 */
class PurchaseMethodService {
  constructor() {
    this.repository = new PurchaseMethodRepository()
  }

  /**
   * Calculate total amount for a purchase method based on type
   * @param {Object} purchaseMethod - Purchase method object
   * @returns {number} Calculated total amount
   */
  calculateTotal(purchaseMethod) {
    const { type, fields } = purchaseMethod
    
    if (!fields) return 0
    
    const monthly = parseFloat(fields.monthlyInstalment) || 0
    const downPayment = parseFloat(fields.downPayment) || 0
    const duration = parseInt(fields.duration) || 0
    
    switch (type) {
      case 'FIN':
        // Financing: monthly × duration + down payment
        return (monthly * duration) + downPayment
        
      case 'LEA':
        // Leasing: monthly × duration + down payment + final instalment
        const finalInstalment = parseFloat(fields.finalInstalment) || 0
        return (monthly * duration) + downPayment + finalInstalment
        
      case 'LTR':
        // Long-term rental: monthly × duration + down payment
        return (monthly * duration) + downPayment
        
      default:
        return 0
    }
  }

  /**
   * Validate purchase method data
   * @param {Object} data - Purchase method data to validate
   * @returns {Object} Validation result with isValid flag and errors array
   */
  validate(data) {
    const errors = []
    const { type, fields } = data
    
    if (!type || !['FIN', 'LEA', 'LTR'].includes(type)) {
      errors.push('Purchase method type is required and must be FIN, LEA, or LTR')
    }
    
    if (!fields) {
      errors.push('Purchase method fields are required')
      return { isValid: false, errors }
    }
    
    // Common validations
    const monthly = parseFloat(fields.monthlyInstalment)
    if (!monthly || monthly <= 0) {
      errors.push('Monthly Instalment must be greater than 0')
    }
    
    const downPayment = parseFloat(fields.downPayment)
    if (downPayment === undefined || downPayment === null || downPayment < 0) {
      errors.push('Down Payment must be greater than or equal to 0')
    }
    
    if (type === 'LTR') {
      const duration = parseInt(fields.duration)
      if (!duration || duration < 12 || duration > 60) {
        errors.push('Duration must be between 12 and 60 months')
      }
    }
    
    // Type-specific validations
    if (type === 'FIN') {
      // Captive Financing validations
      const interestRate = parseFloat(fields.interestRate)
      if (interestRate !== undefined && interestRate !== null) {
        if (interestRate < 0 || interestRate > 99.99) {
          errors.push('Interest Rate must be between 0 and 99.99%')
        }
      }
      
      const effectiveInterestRate = parseFloat(fields.effectiveInterestRate)
      if (effectiveInterestRate !== undefined && effectiveInterestRate !== null) {
        if (effectiveInterestRate < 0 || effectiveInterestRate > 99.99) {
          errors.push('Effective Interest Rate (TAEG) must be between 0 and 99.99%')
        }
      }
    }
    
    if (type === 'LEA') {
      // Leasing validations
      const mileageLimit = parseFloat(fields.mileageLimit)
      if (mileageLimit !== undefined && mileageLimit !== null && mileageLimit <= 0) {
        errors.push('Mileage Limit must be greater than 0 if provided')
      }
      
      const finalInstalment = parseFloat(fields.finalInstalment)
      if (finalInstalment !== undefined && finalInstalment !== null && finalInstalment < 0) {
        errors.push('Final Instalment must be greater than or equal to 0')
      }
      
      const interestRate = parseFloat(fields.interestRate)
      if (interestRate !== undefined && interestRate !== null) {
        if (interestRate < 0 || interestRate > 99.99) {
          errors.push('Interest Rate must be between 0 and 99.99%')
        }
      }
    }
    
    if (type === 'LTR') {
      // Long-term Rental validations
      const mileageLimit = parseFloat(fields.mileageLimit)
      if (mileageLimit !== undefined && mileageLimit !== null && mileageLimit <= 0) {
        errors.push('Mileage Limit must be greater than 0 if provided')
      }
      
      if (!fields.customerType || !['Private', 'Business', 'Fleet'].includes(fields.customerType)) {
        errors.push('Customer Type is required and must be Private, Business, or Fleet')
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Find all purchase methods matching filters
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} Array of purchase methods
   */
  async findAll(filters = {}) {
    return await this.repository.findAll(filters)
  }

  /**
   * Find a purchase method by ID
   * @param {number|string} id - Purchase method ID
   * @returns {Promise<Object|null>} Purchase method or null
   */
  async findById(id) {
    return await this.repository.findById(id)
  }

  /**
   * Create a new purchase method
   * @param {Object} data - Purchase method data
   * @returns {Promise<Object>} Created purchase method with calculated totals
   */
  async create(data) {
    // Validate before creating
    const validation = this.validate(data)
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
    }
    
    // Calculate total amount
    const purchaseMethod = await this.repository.create(data)
    
    // Add calculated total to fields
    const total = this.calculateTotal(purchaseMethod)
    purchaseMethod.fields = {
      ...purchaseMethod.fields,
      totalAmount: total
    }
    
    // Update with calculated field
    return await this.repository.update(purchaseMethod.id, {
      fields: purchaseMethod.fields
    })
  }

  /**
   * Update an existing purchase method
   * @param {number|string} id - Purchase method ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated purchase method
   */
  async update(id, updates) {
    // Get existing purchase method
    const existing = await this.repository.findById(id)
    if (!existing) {
      throw new Error('Purchase method not found')
    }
    
    // Merge updates
    const updatedData = {
      ...existing,
      ...updates,
      fields: {
        ...existing.fields,
        ...updates.fields
      }
    }
    
    // Validate updated data
    const validation = this.validate(updatedData)
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
    }
    
    // Calculate new total
    const total = this.calculateTotal(updatedData)
    updatedData.fields.totalAmount = total
    
    return await this.repository.update(id, {
      ...updates,
      fields: updatedData.fields
    })
  }

  /**
   * Delete a purchase method
   * @param {number|string} id - Purchase method ID
   * @returns {Promise<Object>} Success object
   */
  async delete(id) {
    return await this.repository.delete(id)
  }
}

// Export singleton instance
export const purchaseMethodService = new PurchaseMethodService()
