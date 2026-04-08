export function getRequestAttributionProps(request) {
  if (!request) {
    return {
      utmSource: '',
      utmTerm: '',
      utmCampaign: '',
      webSparkCampaign: '',
      advertisementUrl: '',
      originalEmailUrl: ''
    }
  }
  const rc = request.requestedCar
  return {
    utmSource: request.utmSource || rc?.adSource || '',
    utmTerm: request.utmTerm || rc?.adMedium || '',
    utmCampaign: request.utmCampaign || rc?.adCampaign || '',
    webSparkCampaign: request.webSparkCampaign || rc?.webSparkCampaign || '',
    advertisementUrl: rc?.listingUrl || request.sourceUrl || '',
    originalEmailUrl: request.originalMessageUrl || ''
  }
}
