export const FLOATING_LQ_TASK_CUSTOMER_ID = 2

export function isFloatingLqTaskPrototypeLead(request) {
  return request?.type === 'lead' && Number(request?.customerId) === FLOATING_LQ_TASK_CUSTOMER_ID
}
