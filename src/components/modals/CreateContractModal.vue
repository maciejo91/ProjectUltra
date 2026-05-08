<template>
  <Dialog :open="show" @update:open="handleOpenChange">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent class="w-full sm:max-w-2xl max-h-[calc(100vh-4rem)] md:max-h-[calc(100vh-2rem)] flex flex-col p-0" :show-close-button="true">
        <DialogHeader class="shrink-0 border-b border-border px-6 py-4">
          <DialogTitle class="text-foreground text-xl font-bold">Create contract</DialogTitle>
        </DialogHeader>

        <div class="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-8">
          <nav class="flex items-center justify-center mb-6" aria-label="Steps">
            <ol class="flex items-start w-full justify-between">
              <template v-for="(s, i) in stepLabels" :key="s.key">
                <li class="flex flex-col items-center gap-2 shrink-0 w-16 sm:w-24">
                  <span
                    class="flex size-6 sm:size-7 shrink-0 items-center justify-center rounded-full text-[10px] sm:text-sm transition-colors"
                    :class="currentStepIndex === i ? 'bg-primary text-primary-foreground font-bold shadow-sm' : 'bg-muted text-muted-foreground'"
                  >
                    {{ i + 1 }}
                  </span>
                  <span
                    class="text-[9px] sm:text-[10px] font-bold uppercase tracking-tight text-center leading-tight transition-colors"
                    :class="currentStepIndex === i ? 'text-foreground' : 'text-muted-foreground'"
                  >
                    {{ s.label }}
                  </span>
                </li>
                <li v-if="i < stepLabels.length - 1" class="h-px flex-1 bg-border mt-3 sm:mt-3.5" aria-hidden="true" />
              </template>
            </ol>
          </nav>

          <!-- Step 1: Contract & Customer -->
          <div v-if="currentStepKey === 'contract_customer'" class="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div class="space-y-4">
              <div class="flex items-center gap-2 pb-2 border-b border-border">
                <FileText class="size-4 text-primary" />
                <h3 class="text-sm font-bold text-foreground uppercase tracking-tight">Contract Details</h3>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div class="space-y-1.5">
                  <Label class="text-sm font-semibold uppercase text-muted-foreground">Contract Status</Label>
                  <Select v-model="formData.core.contractStatus">
                    <SelectTrigger class="bg-background">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="signed">Signed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div class="space-y-1.5">
                  <Label class="text-sm font-semibold uppercase text-muted-foreground">Contract Date <span class="text-destructive">*</span></Label>
                  <Input
                    v-model="formData.core.contractDate"
                    type="date"
                    :max="maxContractDateComputed"
                    class="bg-background"
                  />
                </div>
                <div class="space-y-1.5">
                  <Label class="text-sm font-semibold uppercase text-muted-foreground">Time (Optional)</Label>
                  <Input v-model="formData.core.contractTime" type="time" class="bg-background" />
                </div>
                <div class="space-y-1.5">
                  <Label class="text-sm font-semibold uppercase text-muted-foreground">External ID</Label>
                  <Input v-model="formData.core.contractExternalId" placeholder="External reference" class="bg-background" />
                </div>
                <div class="space-y-1.5">
                  <Label class="text-sm font-semibold uppercase text-muted-foreground">Expected Delivery</Label>
                  <Input v-model="formData.core.expectedDeliveryDate" type="date" class="bg-background" />
                </div>
                <div class="space-y-1.5">
                  <Label class="text-sm font-semibold uppercase text-muted-foreground">Delivery Date</Label>
                  <Input v-model="formData.core.deliveryDate" type="date" class="bg-background" />
                </div>
              </div>
            </div>

            <div class="space-y-4">
              <div class="flex items-center gap-2 pb-2 border-b border-border">
                <User class="size-4 text-primary" />
                <h3 class="text-sm font-bold text-foreground uppercase tracking-tight">Customer Information</h3>
              </div>
              <div class="space-y-2">
                <Label class="text-sm font-semibold uppercase text-muted-foreground">Account Type</Label>
                <div class="outcome-toggle-group flex gap-3">
                  <Toggle
                    variant="outline"
                    class="outcome-toggle-item flex-1 font-medium"
                    :model-value="formData.contact.accountType === 'private'"
                    @update:model-value="(v) => formData.contact.accountType = v ? 'private' : 'company'"
                  >
                    Private
                  </Toggle>
                  <Toggle
                    variant="outline"
                    class="outcome-toggle-item flex-1 font-medium"
                    :model-value="formData.contact.accountType === 'company'"
                    @update:model-value="(v) => formData.contact.accountType = v ? 'company' : 'private'"
                  >
                    Company
                  </Toggle>
                </div>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div class="space-y-1.5">
                  <Label class="text-sm font-semibold uppercase text-muted-foreground">First Name</Label>
                  <Input v-model="formData.contact.firstName" placeholder="First name" class="bg-background" />
                </div>
                <div class="space-y-1.5">
                  <Label class="text-sm font-semibold uppercase text-muted-foreground">Last Name</Label>
                  <Input v-model="formData.contact.lastName" placeholder="Last name" class="bg-background" />
                </div>
                <div class="space-y-1.5">
                  <Label class="text-sm font-semibold uppercase text-muted-foreground">Email</Label>
                  <Input v-model="formData.contact.email" type="email" placeholder="email@example.com" class="bg-background" />
                </div>
                <div class="space-y-1.5">
                  <Label class="text-sm font-semibold uppercase text-muted-foreground">Phone</Label>
                  <Input v-model="formData.contact.phone" type="tel" placeholder="+49..." class="bg-background" />
                </div>
              </div>
              <div class="space-y-1.5">
                <Label class="text-sm font-semibold uppercase text-muted-foreground">Address</Label>
                <Input v-model="formData.contact.address" placeholder="Street address" class="bg-background" />
              </div>
              <div class="flex items-center gap-3 p-3 rounded-md bg-muted/30 border border-border/50">
                <Checkbox
                  :checked="formData.contact.privacyConsent"
                  @update:checked="formData.contact.privacyConsent = $event"
                  id="privacy-consent"
                />
                <Label for="privacy-consent" class="text-sm font-medium text-foreground cursor-pointer select-none">
                  Customer has provided privacy consent
                </Label>
              </div>
            </div>
          </div>

          <!-- Step 2: Vehicle Data -->
          <div v-if="currentStepKey === 'vehicle'" class="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div class="flex items-center gap-2 pb-2 border-b border-border">
              <Car class="size-4 text-primary" />
              <h3 class="text-sm font-bold text-foreground uppercase tracking-tight">Vehicle Specifications</h3>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <div class="space-y-1.5">
                <Label class="text-sm font-semibold uppercase text-muted-foreground">Make</Label>
                <Input v-model="formData.vehicle.make" placeholder="e.g., Volkswagen" class="bg-background" />
              </div>
              <div class="space-y-1.5">
                <Label class="text-sm font-semibold uppercase text-muted-foreground">Model</Label>
                <Input v-model="formData.vehicle.model" placeholder="e.g., ID.4" class="bg-background" />
              </div>
              <div class="space-y-1.5">
                <Label class="text-sm font-semibold uppercase text-muted-foreground">Version</Label>
                <Input v-model="formData.vehicle.version" placeholder="Version/trim" class="bg-background" />
              </div>
              <div class="space-y-1.5">
                <Label class="text-sm font-semibold uppercase text-muted-foreground">VIN</Label>
                <Input v-model="formData.vehicle.vin" placeholder="Vehicle ID number" class="bg-background" />
              </div>
              <div class="space-y-1.5">
                <Label class="text-sm font-semibold uppercase text-muted-foreground">Plate Number</Label>
                <Input v-model="formData.vehicle.plateNumber" placeholder="License plate" class="bg-background" />
              </div>
              <div class="space-y-1.5">
                <Label class="text-sm font-semibold uppercase text-muted-foreground">External ID</Label>
                <Input v-model="formData.vehicle.vehicleExternalId" placeholder="External reference" class="bg-background" />
              </div>
              <div class="space-y-1.5">
                <Label class="text-sm font-semibold uppercase text-muted-foreground">Vehicle Type</Label>
                <Select v-model="formData.vehicle.vehicleType">
                  <SelectTrigger class="bg-background">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="used">Used</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="space-y-1.5">
                <Label class="text-sm font-semibold uppercase text-muted-foreground">Registration Date</Label>
                <Input v-model="formData.vehicle.registrationDate" type="date" class="bg-background" />
              </div>
              <div class="space-y-1.5">
                <Label class="text-sm font-semibold uppercase text-muted-foreground">Gear Type</Label>
                <Select v-model="formData.vehicle.gearType">
                  <SelectTrigger class="bg-background">
                    <SelectValue placeholder="Select gear type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manual">Manual</SelectItem>
                    <SelectItem value="Automatic">Automatic</SelectItem>
                    <SelectItem value="CVT">CVT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="space-y-1.5">
                <Label class="text-sm font-semibold uppercase text-muted-foreground">Fuel Type</Label>
                <Select v-model="formData.vehicle.fuelType">
                  <SelectTrigger class="bg-background">
                    <SelectValue placeholder="Select fuel type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Petrol">Petrol</SelectItem>
                    <SelectItem value="Diesel">Diesel</SelectItem>
                    <SelectItem value="Electric">Electric</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                    <SelectItem value="Plug-in Hybrid">Plug-in Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="space-y-1.5 sm:col-span-2 bg-primary/5 p-4 rounded-lg border border-primary/10">
                <Label class="text-sm font-bold uppercase text-primary">Vehicle Pricing (€)</Label>
                <Input v-model="formData.vehicle.vehiclePricing" type="number" placeholder="0" class="bg-background mt-1 text-lg font-bold" />
              </div>
            </div>
          </div>

          <!-- Step 3: Trade-In -->
          <div v-if="currentStepKey === 'tradein'" class="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div class="flex items-center gap-2 pb-2 border-b border-border">
              <RefreshCw class="size-4 text-primary" />
              <h3 class="text-sm font-bold text-foreground uppercase tracking-tight">Trade-In Vehicle</h3>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <div class="space-y-1.5">
                <Label class="text-sm font-semibold uppercase text-muted-foreground">Make</Label>
                <Input v-model="formData.tradein.make" placeholder="Brand" class="bg-background" />
              </div>
              <div class="space-y-1.5">
                <Label class="text-sm font-semibold uppercase text-muted-foreground">Model</Label>
                <Input v-model="formData.tradein.model" placeholder="Model" class="bg-background" />
              </div>
              <div class="space-y-1.5">
                <Label class="text-sm font-semibold uppercase text-muted-foreground">Version</Label>
                <Input v-model="formData.tradein.version" placeholder="Version/trim" class="bg-background" />
              </div>
              <div class="space-y-1.5">
                <Label class="text-sm font-semibold uppercase text-muted-foreground">Mileage (km)</Label>
                <Input v-model="formData.tradein.mileage" type="number" placeholder="km" class="bg-background" />
              </div>
              <div class="space-y-1.5">
                <Label class="text-sm font-semibold uppercase text-muted-foreground">Plate Number</Label>
                <Input v-model="formData.tradein.plateNumber" placeholder="License plate" class="bg-background" />
              </div>
              <div class="space-y-1.5">
                <Label class="text-sm font-semibold uppercase text-muted-foreground">Offered Price (€)</Label>
                <Input v-model="formData.tradein.price" type="number" placeholder="0" class="bg-background" />
              </div>
              <div class="space-y-1.5">
                <Label class="text-sm font-semibold uppercase text-muted-foreground">Color</Label>
                <Input v-model="formData.tradein.color" placeholder="Color" class="bg-background" />
              </div>
              <div class="space-y-1.5">
                <Label class="text-sm font-semibold uppercase text-muted-foreground">Fuel Type</Label>
                <Select v-model="formData.tradein.fuelType">
                  <SelectTrigger class="bg-background">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Petrol">Petrol</SelectItem>
                    <SelectItem value="Diesel">Diesel</SelectItem>
                    <SelectItem value="Electric">Electric</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                    <SelectItem value="Plug-in Hybrid">Plug-in Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="space-y-1.5">
                <Label class="text-sm font-semibold uppercase text-muted-foreground">Gear Type</Label>
                <Select v-model="formData.tradein.gearType">
                  <SelectTrigger class="bg-background">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manual">Manual</SelectItem>
                    <SelectItem value="Automatic">Automatic</SelectItem>
                    <SelectItem value="CVT">CVT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="space-y-1.5">
                <Label class="text-sm font-semibold uppercase text-muted-foreground">Registration Date</Label>
                <Input v-model="formData.tradein.registrationDate" type="date" class="bg-background" />
              </div>
              <div class="space-y-1.5 sm:col-span-2">
                <Label class="text-sm font-semibold uppercase text-muted-foreground">Current Owner</Label>
                <Input v-model="formData.tradein.owner" placeholder="Full name of owner" class="bg-background" />
              </div>
            </div>
          </div>

          <!-- Step 4: Financial & Payment -->
          <div v-if="currentStepKey === 'financial_payment'" class="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div class="space-y-4">
              <div class="flex items-center gap-2 pb-2 border-b border-border">
                <CreditCard class="size-4 text-primary" />
                <h3 class="text-sm font-bold text-foreground uppercase tracking-tight">Financial Terms</h3>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div class="space-y-1.5">
                  <Label class="text-sm font-semibold uppercase text-muted-foreground">Service Type</Label>
                  <Select v-model="formData.financial.serviceType">
                    <SelectTrigger class="bg-background">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="financing">Financing</SelectItem>
                      <SelectItem value="lease">Lease</SelectItem>
                      <SelectItem value="rent">Rent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div class="space-y-1.5">
                  <Label class="text-sm font-semibold uppercase text-muted-foreground">Service Name</Label>
                  <Input v-model="formData.financial.serviceName" placeholder="e.g. Standard Financing" class="bg-background" />
                </div>
                <div class="space-y-1.5">
                  <Label class="text-sm font-semibold uppercase text-muted-foreground">Provider</Label>
                  <Input v-model="formData.financial.provider" placeholder="e.g. Bank Name" class="bg-background" />
                </div>
                <div class="space-y-1.5">
                  <Label class="text-sm font-semibold uppercase text-muted-foreground">Duration (months)</Label>
                  <Input v-model="formData.financial.contractDuration" type="number" placeholder="36" class="bg-background" />
                </div>
                <div class="space-y-1.5">
                  <Label class="text-sm font-semibold uppercase text-muted-foreground">Monthly Payment (€)</Label>
                  <Input v-model="formData.financial.monthlyQuote" type="number" placeholder="0.00" class="bg-background" />
                </div>
                <div class="space-y-1.5">
                  <Label class="text-sm font-semibold uppercase text-muted-foreground">Down Payment (€)</Label>
                  <Input v-model="formData.financial.downPayment" type="number" placeholder="0.00" class="bg-background" />
                </div>
              </div>
            </div>

            <div class="space-y-4 pt-4 border-t border-border">
              <div class="flex justify-between items-center">
                <div class="flex items-center gap-2">
                  <Wallet class="size-4 text-primary" />
                  <h3 class="text-sm font-bold text-foreground uppercase tracking-tight">Payment Schedule</h3>
                </div>
                <Button variant="outline" size="sm" @click="addPaymentMethod" class="h-8 rounded-full px-3">
                  <Plus class="size-3.5 mr-1.5" />
                  Add Method
                </Button>
              </div>
              <div class="space-y-3">
                <div
                  v-for="(pm, index) in formData.paymentMethods"
                  :key="index"
                  class="group relative p-4 rounded-xl border border-border bg-muted/20 hover:bg-muted/30 transition-colors space-y-4"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    class="absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
                    @click="removePaymentMethod(index)"
                  >
                    <Trash2 class="size-3.5" />
                  </Button>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="space-y-1">
                      <Label class="text-[10px] font-bold uppercase text-muted-foreground px-1">Type</Label>
                      <Select v-model="pm.type">
                        <SelectTrigger class="h-9 bg-background">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="card">Card</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="financing">Financing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div class="space-y-1">
                      <Label class="text-[10px] font-bold uppercase text-muted-foreground px-1">Name / Label</Label>
                      <Input v-model="pm.name" placeholder="e.g. Initial Deposit" class="h-9 bg-background" />
                    </div>
                    <div class="space-y-1">
                      <Label class="text-[10px] font-bold uppercase text-muted-foreground px-1">Amount (€)</Label>
                      <Input v-model="pm.amount" type="number" placeholder="0.00" class="h-9 bg-background" />
                    </div>
                    <div class="space-y-1">
                      <Label class="text-[10px] font-bold uppercase text-muted-foreground px-1">Description</Label>
                      <Input v-model="pm.description" placeholder="Optional notes" class="h-9 bg-background" />
                    </div>
                  </div>
                  <div class="flex items-center gap-2 pt-1">
                    <Checkbox :checked="pm.paid" @update:checked="pm.paid = $event" :id="'paid-'+index" />
                    <Label :for="'paid-'+index" class="text-sm font-semibold text-muted-foreground cursor-pointer select-none">
                      Mark as already paid
                    </Label>
                  </div>
                </div>
                <div v-if="!formData.paymentMethods.length" class="text-center py-8 border-2 border-dashed border-border rounded-xl">
                  <p class="text-sm font-medium text-muted-foreground uppercase tracking-wider">No payment methods defined</p>
                  <Button variant="link" size="sm" @click="addPaymentMethod" class="mt-1 text-primary">
                    Click to add your first payment method
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 5: Legal & Finalization -->
          <div v-if="currentStepKey === 'legal_final'" class="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div class="space-y-4">
              <div class="flex items-center gap-2 pb-2 border-b border-border">
                <Scale class="size-4 text-primary" />
                <h3 class="text-sm font-bold text-foreground uppercase tracking-tight">Legal & Compliance</h3>
              </div>
              <div class="space-y-4">
                <div class="space-y-1.5">
                  <Label class="text-sm font-semibold uppercase text-muted-foreground">Contract Terms & Conditions</Label>
                  <Textarea v-model="formData.legal.termsAndConditions" rows="3" placeholder="Enter full terms..." class="resize-none bg-background text-sm" />
                </div>
                <div class="space-y-1.5">
                  <Label class="text-sm font-semibold uppercase text-muted-foreground">Disclaimer Statement</Label>
                  <Textarea v-model="formData.legal.disclaimer" rows="2" placeholder="Legal disclaimer..." class="resize-none bg-background text-sm" />
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <div class="space-y-1.5">
                    <Label class="text-sm font-semibold uppercase text-muted-foreground">Signature Area Text</Label>
                    <Textarea v-model="formData.legal.signatureAreaStatement" rows="2" placeholder="Text near signature..." class="resize-none bg-background text-sm" />
                  </div>
                  <div class="space-y-1.5">
                    <Label class="text-sm font-semibold uppercase text-muted-foreground">Trade-in Statement</Label>
                    <Textarea v-model="formData.legal.tradeinLegalStatement" rows="2" placeholder="Specific trade-in terms..." class="resize-none bg-background text-sm" />
                  </div>
                </div>
              </div>
            </div>

            <div class="space-y-4 pt-4 border-t border-border">
              <div class="flex items-center gap-2 pb-2 border-b border-border">
                <Settings2 class="size-4 text-primary" />
                <h3 class="text-sm font-bold text-foreground uppercase tracking-tight">Assignment & Notes</h3>
              </div>
              <div class="space-y-5">
                <div class="space-y-1.5">
                  <Label class="text-sm font-semibold uppercase text-muted-foreground">Sales Representative / Owner</Label>
                  <Select v-model="formData.owner.contractOwner">
                    <SelectTrigger class="bg-background">
                      <SelectValue placeholder="Assign a representative" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="u in assignableUsers" :key="u.id" :value="u.name">
                        <div class="flex items-center gap-2">
                          <div class="size-4 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                            {{ u.name.charAt(0) }}
                          </div>
                          {{ u.name }}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <div class="space-y-1.5">
                    <Label class="text-sm font-semibold uppercase text-muted-foreground">Lead Source</Label>
                    <Input v-model="formData.additional.source" placeholder="e.g. Website, Walk-in" class="bg-background" />
                  </div>
                  <div class="space-y-1.5">
                    <Label class="text-sm font-semibold uppercase text-muted-foreground">Deal Location</Label>
                    <Input v-model="formData.additional.dealLocation" placeholder="e.g. Main Showroom" class="bg-background" />
                  </div>
                </div>
                <div class="space-y-1.5">
                  <Label class="text-sm font-semibold uppercase text-muted-foreground">Internal Notes</Label>
                  <Textarea v-model="formData.additional.notes" rows="3" placeholder="Private notes for the dealership..." class="resize-none bg-background text-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter class="shrink-0 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 border-t border-border px-6 py-4 bg-muted/10">
          <Button variant="outline" size="sm" @click="handleBackClick" class="rounded-sm w-full sm:w-auto font-semibold">
            <ChevronLeft v-if="currentStepIndex > 0" class="size-4 mr-2" />
            {{ currentStepIndex === 0 ? 'Cancel' : 'Back' }}
          </Button>

          <div class="flex flex-col sm:flex-row gap-3">
            <Button
              v-if="!isLastStep"
              variant="default"
              size="sm"
              class="rounded-sm w-full sm:w-auto font-bold shadow-md shadow-primary/20"
              @click="handleNext"
            >
              Continue to Step {{ currentStepIndex + 2 }}
            </Button>
            <Button
              v-else
              variant="default"
              size="sm"
              class="rounded-sm w-full sm:w-auto font-bold shadow-md shadow-primary/20"
              :disabled="!canSubmit"
              @click="handleConfirm"
            >
              Finalize & Create Contract
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </DialogPortal>
  </Dialog>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import {
  ChevronLeft,
  Plus,
  Trash2,
  FileText,
  User,
  Car,
  RefreshCw,
  CreditCard,
  Wallet,
  Scale,
  Settings2
} from 'lucide-vue-next'
import {
  Button,
  Checkbox,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Toggle
} from '@motork/component-library/future/primitives'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle
} from '@motork/component-library/future/primitives'
import { useUsersStore } from '@/stores/users'

const STEP_LABELS = [
  { key: 'contract_customer', label: 'Contract & Customer' },
  { key: 'vehicle', label: 'Vehicle Data' },
  { key: 'tradein', label: 'Trade-In' },
  { key: 'financial_payment', label: 'Finance & Payment' },
  { key: 'legal_final', label: 'Legal & Finalize' }
]

const props = defineProps({
  show: { type: Boolean, required: true },
  maxContractDate: { type: String, default: '' },
  context: { type: Object, default: null }
})

const emit = defineEmits(['confirm', 'cancel'])

const usersStore = useUsersStore()
const assignableUsers = computed(() => usersStore.assignableUsers || [])

const stepIndex = ref(0)
const stepLabels = STEP_LABELS
const stepKeys = computed(() => stepLabels.map(s => s.key))
const currentStepKey = computed(() => stepKeys.value[stepIndex.value] ?? 'contract_customer')
const currentStepIndex = computed(() => stepIndex.value)
const isLastStep = computed(() => stepIndex.value === stepKeys.value.length - 1)

const maxContractDateComputed = computed(() => {
  if (props.maxContractDate) return props.maxContractDate
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const formData = ref(createInitialFormData())

function createInitialFormData() {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const timeStr = today.toTimeString().slice(0, 5)
  return {
    core: {
      contractStatus: 'active',
      contractDate: todayStr,
      contractTime: timeStr,
      deliveryDate: '',
      expectedDeliveryDate: '',
      contractExternalId: ''
    },
    contact: {
      accountType: 'private',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      privacyConsent: false
    },
    vehicle: {
      vehicleExternalId: '',
      make: '',
      model: '',
      version: '',
      vin: '',
      plateNumber: '',
      vehicleType: '',
      registrationDate: '',
      gearType: '',
      fuelType: '',
      vehiclePricing: ''
    },
    tradein: {
      make: '',
      model: '',
      version: '',
      mileage: '',
      plateNumber: '',
      price: '',
      color: '',
      fuelType: '',
      gearType: '',
      owner: '',
      registrationDate: ''
    },
    financial: {
      serviceType: '',
      serviceName: '',
      provider: '',
      contractDuration: '',
      monthlyQuote: '',
      downPayment: ''
    },
    paymentMethods: [{ type: '', name: '', amount: 0, description: '', paid: false }],
    legal: {
      termsAndConditions: '',
      disclaimer: '',
      signatureAreaStatement: '',
      tradeinLegalStatement: '',
      proposedVehicleStatement: ''
    },
    owner: { contractOwner: '' },
    additional: { source: '', notes: '', dealLocation: '' }
  }
}

function prefillFromContext() {
  const ctx = props.context
  if (!ctx) return

  const fd = formData.value

  if (ctx.deliveryDate) {
    const d = new Date(ctx.deliveryDate)
    if (!isNaN(d.getTime())) {
      fd.core.expectedDeliveryDate = d.toISOString().split('T')[0]
      if (!fd.core.deliveryDate) fd.core.deliveryDate = fd.core.expectedDeliveryDate
    }
  }

  const customer = ctx.customer
  if (customer) {
    const fullName = customer.name || [customer.firstName, customer.lastName].filter(Boolean).join(' ') || ''
    const parts = fullName.trim().split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      fd.contact.firstName = fd.contact.firstName || parts[0]
      fd.contact.lastName = fd.contact.lastName || parts.slice(1).join(' ')
    } else if (parts.length === 1) {
      fd.contact.firstName = fd.contact.firstName || parts[0]
    }
    if (customer.email) fd.contact.email = fd.contact.email || customer.email
    if (customer.phone) fd.contact.phone = fd.contact.phone || customer.phone
    if (customer.address) fd.contact.address = fd.contact.address || customer.address
    if (customer.company) fd.contact.accountType = fd.contact.accountType || 'company'
  }

  const acceptedOffer = ctx.offers?.find(o => o.status === 'accepted' || o.acceptance_status === 'accepted')
  const vehicleSource = acceptedOffer?.data || ctx.selectedVehicle || ctx.vehicle || ctx.requestedCar
  if (vehicleSource) {
    if (vehicleSource.brand) fd.vehicle.make = fd.vehicle.make || vehicleSource.brand
    if (vehicleSource.model) fd.vehicle.model = fd.vehicle.model || vehicleSource.model
    if (vehicleSource.version) fd.vehicle.version = fd.vehicle.version || vehicleSource.version
    if (vehicleSource.vin) fd.vehicle.vin = fd.vehicle.vin || vehicleSource.vin
    if (vehicleSource.plates) fd.vehicle.plateNumber = fd.vehicle.plateNumber || vehicleSource.plates
    if (vehicleSource.gearType) fd.vehicle.gearType = fd.vehicle.gearType || vehicleSource.gearType
    if (vehicleSource.fuelType) fd.vehicle.fuelType = fd.vehicle.fuelType || vehicleSource.fuelType
    if (vehicleSource.price != null) fd.vehicle.vehiclePricing = fd.vehicle.vehiclePricing || String(vehicleSource.price)
    const status = vehicleSource.status?.toLowerCase?.()
    if (status === 'new' || status === 'used') fd.vehicle.vehicleType = fd.vehicle.vehicleType || status
  }

  const tradeInSource = acceptedOffer?.data?.selectedTradeInLabel
    ? ctx.tradeIns?.find(t => (t.label || `${t.brand} ${t.model}`) === acceptedOffer.data.selectedTradeInLabel)
    : ctx.tradeIns?.[0]
  if (tradeInSource) {
    if (tradeInSource.brand) fd.tradein.make = fd.tradein.make || tradeInSource.brand
    if (tradeInSource.model) fd.tradein.model = fd.tradein.model || tradeInSource.model
    if (tradeInSource.data?.version) fd.tradein.version = fd.tradein.version || tradeInSource.data.version
    if (tradeInSource.data?.mileage != null) fd.tradein.mileage = fd.tradein.mileage || String(tradeInSource.data.mileage)
    if (tradeInSource.valuation != null) fd.tradein.price = fd.tradein.price || String(tradeInSource.valuation)
    if (tradeInSource.data?.fuelType) fd.tradein.fuelType = fd.tradein.fuelType || tradeInSource.data.fuelType
    if (tradeInSource.data?.gearType) fd.tradein.gearType = fd.tradein.gearType || tradeInSource.data.gearType
  }

  if (acceptedOffer?.data) {
    const od = acceptedOffer.data
    if (od.selectedFinancingLabel) fd.financial.serviceName = fd.financial.serviceName || od.selectedFinancingLabel
    if (od.financingType) fd.financial.serviceType = fd.financial.serviceType || od.financingType
    if (od.downPayment != null) fd.financial.downPayment = fd.financial.downPayment || String(od.downPayment)
    if (od.monthlyPayment != null) fd.financial.monthlyQuote = fd.financial.monthlyQuote || String(od.monthlyPayment)
    if (od.term != null) fd.financial.contractDuration = fd.financial.contractDuration || String(od.term)
  }

  if (ctx.assignee) fd.owner.contractOwner = fd.owner.contractOwner || ctx.assignee
  if (ctx.source) fd.additional.source = fd.additional.source || ctx.source
}

function addPaymentMethod() {
  formData.value.paymentMethods.push({ type: '', name: '', amount: 0, description: '', paid: false })
}

function removePaymentMethod(index) {
  formData.value.paymentMethods.splice(index, 1)
}

const canSubmit = computed(() => !!formData.value.core.contractDate)

watch(() => props.show, (isOpen) => {
  if (isOpen) {
    formData.value = createInitialFormData()
    prefillFromContext()
    stepIndex.value = 0
  }
})

onMounted(() => {
  if (props.show) prefillFromContext()
})

function handleNext() {
  if (isLastStep.value) return
  stepIndex.value = Math.min(stepIndex.value + 1, stepLabels.length - 1)
}

function handleBackClick() {
  if (stepIndex.value > 0) {
    stepIndex.value--
    return
  }
  emit('cancel')
}

function handleConfirm() {
  if (!canSubmit.value) return
  const fd = formData.value
  emit('confirm', {
    contractDate: fd.core.contractDate,
    contractTime: fd.core.contractTime,
    notes: fd.additional.notes,
    ...fd.core,
    contact: fd.contact,
    vehicle: fd.vehicle,
    tradeIn: fd.tradein,
    financial: fd.financial,
    paymentMethods: fd.paymentMethods,
    legal: fd.legal,
    contractOwner: fd.owner.contractOwner,
    ...fd.additional
  })
}

function handleCancel() {
  emit('cancel')
}

function handleOpenChange(isOpen) {
  if (!isOpen) handleCancel()
}
</script>
