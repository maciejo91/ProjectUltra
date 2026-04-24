/** IDs aligned with manual contact creation / API payloads */
export const FISCAL_ENTITY_COMPANY_A = 'company-a'
export const FISCAL_ENTITY_COMPANY_B = 'company-b'

export const FISCAL_ENTITY_IDS = [FISCAL_ENTITY_COMPANY_A, FISCAL_ENTITY_COMPANY_B]

export function isKnownFiscalEntityId(id) {
  return FISCAL_ENTITY_IDS.includes(id)
}
