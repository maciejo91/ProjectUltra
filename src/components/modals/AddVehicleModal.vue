<template>
  <Dialog :open="show" @update:open="handleOpenChange">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-[100] bg-black/50" />
      <DialogContent
        class="w-full sm:max-w-5xl max-h-[calc(100vh-4rem)] flex flex-col z-[100]"
        :show-close-button="true"
      >
        <DialogHeader class="flex-shrink-0">
          <DialogTitle>{{ getTitle() }}</DialogTitle>
          <DialogDescription v-if="!isTradeIn">{{ getDescription() }}</DialogDescription>
        </DialogHeader>

        <div class="flex-1 overflow-y-auto py-4 w-full">
          <div class="grid gap-4">
            <div v-if="mode === 'vehicle' && !item && !selectedVehicleType" class="grid gap-4">
          <p class="text-sm text-muted-foreground">Select the type of vehicle you want to add:</p>
          <div class="grid grid-cols-1 gap-3">
            <Button
              variant="outline"
              class="w-full justify-start"
              @click="selectedVehicleType = 'drove'"
            >
              Drove
            </Button>
            <Button
              variant="outline"
              class="w-full justify-start"
              @click="selectedVehicleType = 'requested'"
            >
              Requested
            </Button>
            <Button
              variant="outline"
              class="w-full justify-start"
              @click="selectedVehicleType = 'tradein'"
            >
              Trade-In
            </Button>
            </div>
            </div>

            <div v-else class="grid gap-4">
          <!-- Trade-In Fields -->
          <template v-if="isTradeIn">
            <!-- Brand and Model in same row -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label class="block text-sm font-medium text-foreground">Brand <span class="text-muted-foreground">*</span></Label>
                <Popover :open="showBrandDropdown" @update:open="(v) => (showBrandDropdown = v)">
                  <PopoverAnchor class="block w-full">
                    <Input
                      v-model="vehicleData.brand"
                      type="text"
                      class="w-full"
                      required
                      @focus="showBrandDropdown = true"
                    />
                  </PopoverAnchor>
                  <PopoverContent
                    class="z-[110] w-(--radix-popover-trigger-width) min-w-(--radix-popover-trigger-width) p-0"
                    align="start"
                    @open-auto-focus.prevent
                  >
                    <Command class="rounded-md border border-border bg-background" :filter-disabled="true">
                      <CommandList class="max-h-64 overflow-y-auto">
                        <CommandEmpty class="py-4 text-center text-sm text-muted-foreground">No brand found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            v-for="b in filteredBrands"
                            :key="b"
                            :value="b"
                            class="cursor-pointer"
                            @select="selectBrand(b)"
                          >
                            {{ b }}
                          </CommandItem>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div class="space-y-2">
                <Label class="block text-sm font-medium text-foreground">Model <span class="text-muted-foreground">*</span></Label>
                <Popover :open="showModelDropdown" @update:open="(v) => (showModelDropdown = v)">
                  <PopoverAnchor class="block w-full">
                    <Input
                      v-model="vehicleData.model"
                      type="text"
                      class="w-full"
                      required
                      @focus="showModelDropdown = true"
                    />
                  </PopoverAnchor>
                  <PopoverContent
                    class="z-[110] w-(--radix-popover-trigger-width) min-w-(--radix-popover-trigger-width) p-0"
                    align="start"
                    @open-auto-focus.prevent
                  >
                    <Command class="rounded-md border border-border bg-background" :filter-disabled="true">
                      <CommandList class="max-h-64 overflow-y-auto">
                        <CommandEmpty class="py-4 text-center text-sm text-muted-foreground">No model found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            v-for="m in filteredModels"
                            :key="m"
                            :value="m"
                            class="cursor-pointer"
                            @select="selectModel(m)"
                          >
                            {{ m }}
                          </CommandItem>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <!-- Year and Kilometers in same row -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label class="block text-sm font-medium text-foreground">Registration year <span class="text-muted-foreground">*</span></Label>
                <Input 
                  v-model="vehicleData.year"
                  type="number" 
                  placeholder="e.g., 2024" 
                  class="w-full"
                  min="1900"
                  :max="new Date().getFullYear() + 1"
                  required
                />
              </div>
              <div class="space-y-2">
                <Label class="block text-sm font-medium text-foreground">Kilometers</Label>
                <Input 
                  v-model.number="vehicleData.kilometers"
                  type="number" 
                  placeholder="0" 
                  class="w-full"
                  min="0"
                />
              </div>
            </div>

            <CollapsibleSection
              title="More details"
              :is-expanded="moreDetailsExpanded"
              :no-side-padding="true"
              @toggle="moreDetailsExpanded = !moreDetailsExpanded"
            >
              <div class="space-y-4">
                <div class="space-y-2">
                  <Label class="block text-sm font-medium text-foreground">Valuation (€)</Label>
                  <Input 
                    v-model.number="vehicleData.valuation"
                    type="number"
                    placeholder="0"
                    class="w-full"
                    min="0"
                    step="1"
                  />
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <Label class="block text-sm font-medium text-foreground">Fuel Type</Label>
                    <Select v-model="vehicleData.fuelType">
                      <SelectTrigger class="w-full">
                        <SelectValue placeholder="Select fuel type..." />
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
                  <div class="space-y-2">
                    <Label class="block text-sm font-medium text-foreground">Gear Type</Label>
                    <Select v-model="vehicleData.gearType">
                      <SelectTrigger class="w-full">
                        <SelectValue placeholder="Select gear type..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Manual">Manual</SelectItem>
                        <SelectItem value="Automatic">Automatic</SelectItem>
                        <SelectItem value="CVT">CVT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div class="space-y-2">
                  <Label class="block text-sm font-medium text-foreground">Plates</Label>
                  <Input 
                    v-model="vehicleData.plates"
                    type="text" 
                    placeholder="License plate number" 
                    class="w-full"
                  />
                  <p class="text-sm text-muted-foreground mt-1">These can be relevant for automatically retrieving other information.</p>
                </div>
              </div>
            </CollapsibleSection>

            <!-- Note field -->
            <div class="space-y-2">
              <Label class="block text-sm font-medium text-foreground">Note</Label>
              <Textarea 
                v-model="vehicleData.note"
                rows="6"
                class="w-full resize-none"
              />
            </div>
          </template>

          <!-- Regular Vehicle Fields (for non-trade-in mode) -->
          <template v-else>
            <!-- Owned vehicle (Service Figma) -->
            <template v-if="selectedVehicleType === 'drove'">
              <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div class="space-y-2">
                  <Label class="block text-sm font-medium text-foreground">Vehicle class</Label>
                  <Select v-model="vehicleData.vehicleClass">
                    <SelectTrigger class="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Passenger car">Passenger car</SelectItem>
                      <SelectItem value="SUV">SUV</SelectItem>
                      <SelectItem value="LCV">LCV</SelectItem>
                      <SelectItem value="Motorcycle">Motorcycle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div class="space-y-2">
                  <Label class="block text-sm font-medium text-foreground">Brand</Label>
                  <Popover :open="showBrandDropdown" @update:open="(v) => (showBrandDropdown = v)">
                    <PopoverAnchor class="block w-full">
                      <Input
                        v-model="vehicleData.brand"
                        type="text"
                        class="w-full"
                        placeholder="Select"
                        @focus="showBrandDropdown = true"
                      />
                    </PopoverAnchor>
                    <PopoverContent
                      class="z-[110] w-(--radix-popover-trigger-width) min-w-(--radix-popover-trigger-width) p-0"
                      align="start"
                      @open-auto-focus.prevent
                    >
                      <Command class="rounded-md border border-border bg-background" :filter-disabled="true">
                        <CommandList class="max-h-64 overflow-y-auto">
                          <CommandEmpty class="py-4 text-center text-sm text-muted-foreground"
                            >No brand found.</CommandEmpty
                          >
                          <CommandGroup>
                            <CommandItem
                              v-for="b in filteredBrands"
                              :key="b"
                              :value="b"
                              class="cursor-pointer"
                              @select="selectBrand(b)"
                            >
                              {{ b }}
                            </CommandItem>
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div class="space-y-2">
                  <Label class="block text-sm font-medium text-foreground">Model</Label>
                  <Popover :open="showModelDropdown" @update:open="(v) => (showModelDropdown = v)">
                    <PopoverAnchor class="block w-full">
                      <Input
                        v-model="vehicleData.model"
                        type="text"
                        class="w-full"
                        placeholder="Select model"
                        :disabled="!vehicleData.brand"
                        @focus="showModelDropdown = true"
                      />
                    </PopoverAnchor>
                    <PopoverContent
                      class="z-[110] w-(--radix-popover-trigger-width) min-w-(--radix-popover-trigger-width) p-0"
                      align="start"
                      @open-auto-focus.prevent
                    >
                      <Command class="rounded-md border border-border bg-background" :filter-disabled="true">
                        <CommandList class="max-h-64 overflow-y-auto">
                          <CommandEmpty class="py-4 text-center text-sm text-muted-foreground"
                            >No model found.</CommandEmpty
                          >
                          <CommandGroup>
                            <CommandItem
                              v-for="m in filteredModels"
                              :key="m"
                              :value="m"
                              class="cursor-pointer"
                              @select="selectModel(m)"
                            >
                              {{ m }}
                            </CommandItem>
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div class="space-y-2">
                  <Label class="block text-sm font-medium text-foreground">Registration date</Label>
                  <MiniCalendarDateField
                    v-model="vehicleData.registration"
                    aria-label="Registration date"
                    input-class="h-10 w-full min-w-0"
                    calendar-button-class="rounded-md"
                    popover-content-class="z-[110]"
                  />
                </div>
                <div class="space-y-2">
                  <Label class="block text-sm font-medium text-foreground">Mileage</Label>
                  <Input v-model="vehicleData.kilometers" type="text" placeholder="Km" class="w-full" />
                </div>
                <div class="space-y-2">
                  <Label class="block text-sm font-medium text-foreground">Plate</Label>
                  <Input v-model="vehicleData.plates" type="text" placeholder="Insert..." class="w-full" />
                </div>
              </div>

              <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div class="space-y-2">
                  <Label class="block text-sm font-medium text-foreground">VIN number</Label>
                  <Input v-model="vehicleData.vin" type="text" placeholder="Insert..." class="w-full" />
                </div>
                <div class="space-y-2">
                  <Label class="block text-sm font-medium text-foreground">Fuel type</Label>
                  <Select v-model="vehicleData.fuelType">
                    <SelectTrigger class="w-full">
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
                <div class="space-y-2">
                  <Label class="block text-sm font-medium text-foreground">Gear type</Label>
                  <Select v-model="vehicleData.gearType">
                    <SelectTrigger class="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Manual">Manual</SelectItem>
                      <SelectItem value="Automatic">Automatic</SelectItem>
                      <SelectItem value="CVT">CVT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div class="space-y-2">
                  <Label class="block text-sm font-medium text-foreground">Ownership (Account name)</Label>
                  <Input v-model="vehicleData.owner" type="text" placeholder="Insert..." class="w-full" />
                </div>
                <div class="space-y-2">
                  <Label class="block text-sm font-medium text-foreground">Ownership starting date</Label>
                  <MiniCalendarDateField
                    v-model="vehicleData.ownedSince"
                    aria-label="Ownership starting date"
                    input-class="h-10 w-full min-w-0"
                    calendar-button-class="rounded-md"
                    popover-content-class="z-[110]"
                  />
                </div>
              </div>

              <CollapsibleSection
                title="More details"
                :is-expanded="moreDetailsExpanded"
                :no-side-padding="true"
                @toggle="moreDetailsExpanded = !moreDetailsExpanded"
              >
                <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <div class="space-y-2">
                    <Label class="block text-sm font-medium text-foreground">Displacement</Label>
                    <Input v-model="vehicleData.displacement" type="text" placeholder="Insert..." class="w-full" />
                  </div>
                  <div class="space-y-2">
                    <Label class="block text-sm font-medium text-foreground">HP</Label>
                    <Input v-model="vehicleData.hp" type="text" placeholder="Insert..." class="w-full" />
                  </div>
                  <div class="space-y-2">
                    <Label class="block text-sm font-medium text-foreground">kW</Label>
                    <Input v-model="vehicleData.kw" type="text" placeholder="Insert..." class="w-full" />
                  </div>

                  <div class="space-y-2">
                    <Label class="block text-sm font-medium text-foreground">Colour</Label>
                    <Input v-model="vehicleData.colour" type="text" placeholder="Insert..." class="w-full" />
                  </div>
                  <div class="space-y-2">
                    <Label class="block text-sm font-medium text-foreground">Traction type</Label>
                    <Select v-model="vehicleData.tractionType">
                      <SelectTrigger class="w-full">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FWD">FWD</SelectItem>
                        <SelectItem value="RWD">RWD</SelectItem>
                        <SelectItem value="AWD">AWD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div class="space-y-2">
                    <Label class="block text-sm font-medium text-foreground">Doors</Label>
                    <Input v-model="vehicleData.doors" type="text" placeholder="Insert..." class="w-full" />
                  </div>

                  <div class="space-y-2">
                    <Label class="block text-sm font-medium text-foreground">Seats</Label>
                    <Input v-model="vehicleData.seats" type="text" placeholder="Insert..." class="w-full" />
                  </div>
                  <div class="space-y-2">
                    <Label class="block text-sm font-medium text-foreground">Model year</Label>
                    <Input v-model="vehicleData.year" type="text" placeholder="Insert..." class="w-full" />
                  </div>
                  <div class="space-y-2">
                    <Label class="block text-sm font-medium text-foreground">Last Km update</Label>
                    <MiniCalendarDateField
                      v-model="vehicleData.lastKmUpdate"
                      aria-label="Last Km update"
                      input-class="h-10 w-full min-w-0"
                      calendar-button-class="rounded-md"
                      popover-content-class="z-[110]"
                    />
                  </div>

                  <div class="space-y-2">
                    <Label class="block text-sm font-medium text-foreground">Warranty starting date</Label>
                    <MiniCalendarDateField
                      v-model="vehicleData.warrantyStart"
                      aria-label="Warranty starting date"
                      input-class="h-10 w-full min-w-0"
                      calendar-button-class="rounded-md"
                      popover-content-class="z-[110]"
                    />
                  </div>
                  <div class="space-y-2">
                    <Label class="block text-sm font-medium text-foreground">Warranty duration (months)</Label>
                    <Input v-model="vehicleData.warrantyDurationMonths" type="text" placeholder="Insert..." class="w-full" />
                  </div>
                  <div class="space-y-2">
                    <Label class="block text-sm font-medium text-foreground">Warranty ending date</Label>
                    <MiniCalendarDateField
                      v-model="vehicleData.warrantyEnd"
                      aria-label="Warranty ending date"
                      input-class="h-10 w-full min-w-0"
                      calendar-button-class="rounded-md"
                      popover-content-class="z-[110]"
                    />
                  </div>
                </div>
              </CollapsibleSection>
            </template>

            <!-- Default (requested / generic) keeps legacy layout -->
            <template v-else>
              <!-- Vehicle Information -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="space-y-2">
                  <Label class="block text-sm font-semibold text-foreground">Brand</Label>
                  <Input 
                    v-model="vehicleData.brand"
                    type="text" 
                    placeholder="e.g., Volkswagen" 
                    class="w-full"
                    required
                  />
                </div>
                <div class="space-y-2">
                  <Label class="block text-sm font-semibold text-foreground">Model</Label>
                  <Input 
                    v-model="vehicleData.model"
                    type="text" 
                    placeholder="e.g., ID.4" 
                    class="w-full"
                    required
                  />
                </div>
                <div class="space-y-2">
                  <Label class="block text-sm font-semibold text-foreground">Registration year</Label>
                  <Input 
                    v-model="vehicleData.year"
                    type="number" 
                    placeholder="e.g., 2024" 
                    class="w-full"
                    min="1900"
                    :max="new Date().getFullYear() + 1"
                    required
                  />
                </div>
              </div>

              <!-- Version/Trim -->
              <div class="space-y-2">
                <Label class="block text-sm font-semibold text-foreground">Version/Trim</Label>
                <Input 
                  v-model="vehicleData.version"
                  type="text" 
                  placeholder="e.g., Premium Plus" 
                  class="w-full"
                />
              </div>

              <!-- Identification -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label class="block text-sm font-semibold text-foreground">VIN</Label>
                  <Input 
                    v-model="vehicleData.vin"
                    type="text" 
                    placeholder="Vehicle Identification Number" 
                    class="w-full"
                  />
                </div>
                <div class="space-y-2">
                  <Label class="block text-sm font-semibold text-foreground">Plates</Label>
                  <Input 
                    v-model="vehicleData.plates"
                    type="text" 
                    placeholder="License plate number" 
                    class="w-full"
                  />
                </div>
              </div>

              <!-- Vehicle Details -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="space-y-2">
                  <Label class="block text-sm font-semibold text-foreground">Fuel Type</Label>
                  <Select v-model="vehicleData.fuelType">
                    <SelectTrigger class="w-full">
                      <SelectValue placeholder="Select fuel type..." />
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
                <div class="space-y-2">
                  <Label class="block text-sm font-semibold text-foreground">Gear Type</Label>
                  <Select v-model="vehicleData.gearType">
                    <SelectTrigger class="w-full">
                      <SelectValue placeholder="Select gear type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Manual">Manual</SelectItem>
                      <SelectItem value="Automatic">Automatic</SelectItem>
                      <SelectItem value="CVT">CVT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div class="space-y-2">
                  <Label class="block text-sm font-semibold text-foreground">Mileage (km)</Label>
                  <Input 
                    v-model.number="vehicleData.kilometers"
                    type="number" 
                    placeholder="0" 
                    class="w-full"
                    min="0"
                  />
                </div>
              </div>

              <!-- Registration -->
              <div class="space-y-2">
                <Label class="block text-sm font-semibold text-foreground">Registration Year/Month</Label>
                <Input 
                  v-model="vehicleData.registration"
                  type="text" 
                  class="w-full"
                />
              </div>

              <!-- Owner Information -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label class="block text-sm font-semibold text-foreground">Owned Since</Label>
                  <MiniCalendarDateField
                    v-model="vehicleData.ownedSince"
                    aria-label="Owned since"
                    input-class="h-10 w-full min-w-0"
                    calendar-button-class="rounded-md"
                    popover-content-class="z-[110]"
                  />
                </div>
                <div class="space-y-2">
                  <Label class="block text-sm font-semibold text-foreground">Owner</Label>
                  <Input 
                    v-model="vehicleData.owner"
                    type="text" 
                    placeholder="Owner name" 
                    class="w-full"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label class="block text-sm font-semibold text-foreground">Ownership Type</Label>
                  <Select v-model="vehicleData.ownershipType">
                    <SelectTrigger class="w-full">
                      <SelectValue placeholder="Select ownership type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Private">Private</SelectItem>
                      <SelectItem value="Company">Company</SelectItem>
                      <SelectItem value="Lease">Lease</SelectItem>
                      <SelectItem value="Fleet">Fleet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div class="space-y-2">
                <Label class="block text-sm font-semibold text-foreground">Warranty Info</Label>
                <Textarea 
                  v-model="vehicleData.warrantyInfo"
                  rows="4"
                  placeholder="Warranty information..." 
                  class="w-full resize-none"
                />
              </div>
            </template>
            </template>
            </div>
          </div>
        </div>

        <DialogFooter class="flex-shrink-0 flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
          <div class="flex gap-3 order-2 sm:order-1">
            <Button
              v-if="item"
              variant="destructive"
              class="rounded-sm w-full sm:w-auto"
              @click="$emit('delete')"
            >
              Delete
            </Button>
          </div>
          <div class="flex flex-col-reverse sm:flex-row gap-3 flex-1 sm:justify-end order-1 sm:order-2">
            <Button
              variant="outline"
              class="rounded-sm w-full sm:w-auto"
              @click="$emit('close')"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              class="rounded-sm w-full sm:w-auto inline-flex items-center gap-2"
              :disabled="!isValid || loading"
              @click="handleSubmit"
            >
              <Spinner
                v-if="loading"
                class="size-4 shrink-0"
                aria-hidden
              />
              <span>{{
                item
                  ? (isTradeIn ? 'Update Trade-In' : 'Update Vehicle')
                  : (isTradeIn ? 'Save Trade-In' : (selectedVehicleType === 'drove' ? 'Save' : 'Add Vehicle'))
              }}</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </DialogPortal>
  </Dialog>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import {
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  Popover,
  PopoverAnchor,
  PopoverContent,
  Command,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  Spinner
} from '@motork/component-library/future/primitives'
import CollapsibleSection from '@/components/shared/CollapsibleSection.vue'
import MiniCalendarDateField from '@/components/shared/forms/MiniCalendarDateField.vue'
import { VEHICLE_BRANDS, getModelsForBrand, getAllModels } from '@/constants/vehicleSuggestions'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  /** Optional UI context (e.g. 'service') to allow scoped redesigns. */
  context: {
    type: String,
    default: ''
  },
  mode: {
    type: String,
    default: 'vehicle', // 'vehicle' or 'tradein'
    validator: (value) => ['vehicle', 'tradein'].includes(value)
  },
  item: {
    type: Object,
    default: null
  },
  taskType: {
    type: String,
    default: 'lead'
  },
  taskId: {
    type: [String, Number],
    default: null
  },
  /** When true, modal cannot be closed (save/delete in progress). */
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'save', 'delete'])

// Auto-set to 'tradein' when mode is 'tradein', otherwise null
const selectedVehicleType = ref(props.mode === 'tradein' ? 'tradein' : null) // 'drove', 'requested', 'tradein', or null
const moreDetailsExpanded = ref(false)

// Watch for mode changes to auto-set vehicle type
watch(() => props.mode, (newMode) => {
  if (newMode === 'tradein') {
    selectedVehicleType.value = 'tradein'
  } else if (!props.item) {
    selectedVehicleType.value = null
  }
})

// Computed to determine if we're in trade-in mode
const isTradeIn = computed(() => {
  return props.mode === 'tradein' || selectedVehicleType.value === 'tradein'
})

const showBrandDropdown = ref(false)
const showModelDropdown = ref(false)

const filteredBrands = computed(() => {
  const q = (vehicleData.value.brand || '').trim().toLowerCase()
  if (!q) return VEHICLE_BRANDS.slice(0, 15)
  return VEHICLE_BRANDS.filter(b => b.toLowerCase().includes(q)).slice(0, 15)
})

const filteredModels = computed(() => {
  const q = (vehicleData.value.model || '').trim().toLowerCase()
  const forBrand = getModelsForBrand(vehicleData.value.brand)
  const pool = forBrand.length ? forBrand : getAllModels()
  if (!q) return pool.slice(0, 15)
  return pool.filter(m => m.toLowerCase().includes(q)).slice(0, 15)
})

function selectBrand(brand) {
  vehicleData.value.brand = brand
  showBrandDropdown.value = false
}

function selectModel(model) {
  vehicleData.value.model = model
  showModelDropdown.value = false
}

function inferVehicleTypeFromItem(item) {
  if (!item) return null
  const t =
    (item.vehicleType || item.type || item.data?.vehicleType || item.vehicle?.vehicleType || '')
      .toString()
      .trim()
      .toLowerCase()
  if (t === 'drove' || t === 'requested' || t === 'tradein') return t
  // Heuristic: trade-in items usually carry valuation details
  if (item.valuationDetail || item.valuation != null || item.data?.tradeInPrice != null) return 'tradein'
  return null
}

// Get modal title based on context
const getTitle = () => {
  if (props.item) {
    if (selectedVehicleType.value === 'tradein') return 'Edit Trade-In'
    if (selectedVehicleType.value === 'drove') return 'Owned vehicle'
    if (selectedVehicleType.value === 'requested') return 'Edit Requested Vehicle'
    return 'Edit Vehicle'
  }
  if (props.mode === 'tradein') return 'Add Trade-In Vehicle'
  if (selectedVehicleType.value === 'tradein') return 'Add Trade-In Vehicle'
  if (selectedVehicleType.value === 'drove') return 'Owned vehicle'
  if (selectedVehicleType.value === 'requested') return 'Add Requested Vehicle'
  return 'Add Vehicle'
}

// Get modal description based on context
const getDescription = () => {
  if (props.mode === 'tradein' || selectedVehicleType.value === 'tradein') {
    return 'Record details of the customer\'s trade-in vehicle'
  }
  if (selectedVehicleType.value === 'drove') {
    return ''
  }
  if (selectedVehicleType.value === 'requested') {
    return 'Record details of a vehicle the customer requested'
  }
  return 'Fill in the details for the new vehicle'
}

const vehicleData = ref({
  brand: '',
  model: '',
  year: '',
  version: '',
  vin: '',
  plates: '',
  vehicleClass: '',
  fuelType: '',
  gearType: '',
  kilometers: '',
  registration: '',
  owner: '',
  ownershipType: '',
  ownedSince: '',
  warrantyInfo: '',
  // Owned vehicle - more details (Figma)
  displacement: '',
  hp: '',
  kw: '',
  colour: '',
  tractionType: '',
  doors: '',
  seats: '',
  lastKmUpdate: '',
  warrantyStart: '',
  warrantyDurationMonths: '',
  warrantyEnd: '',
  note: '',
  stockDays: null,
  valuation: null
})


function parseLabelToVehicle(label) {
  if (!label || typeof label !== 'string') return { brand: '', model: '', year: '' }
  const withYear = label.match(/^(.+?)\s*\((\d{4})\)\s*$/)
  if (withYear) {
    const rest = withYear[1].trim()
    const year = withYear[2]
    const parts = rest.split(/\s+/)
    const brand = parts[0] || ''
    const model = parts.slice(1).join(' ') || ''
    return { brand, model, year }
  }
  const parts = label.trim().split(/\s+/)
  const brand = parts[0] || ''
  const model = parts.slice(1).join(' ') || ''
  return { brand, model, year: '' }
}

function loadItemIntoForm(item) {
  if (!item) return
  if (item.data) {
    vehicleData.value = {
      brand: item.data.brand || '',
      model: item.data.model || '',
      year: item.data.year || '',
      version: item.data.version || '',
      vin: item.data.vin || '',
      plates: item.data.plate || item.data.plates || '',
      vehicleClass: item.data.vehicleClass || '',
      fuelType: item.data.fuelType || '',
      gearType: item.data.gearType || '',
      kilometers: item.data.km || item.data.kilometers || '',
      registration: item.data.date || item.data.registration || '',
      owner: item.data.owner || '',
      ownershipType: item.data.ownershipType || '',
      ownedSince: item.data.ownedSince || '',
      warrantyInfo: item.data.warrantyInfo || '',
      displacement: item.data.displacement || '',
      hp: item.data.hp || '',
      kw: item.data.kw || '',
      colour: item.data.colour || '',
      tractionType: item.data.tractionType || '',
      doors: item.data.doors || '',
      seats: item.data.seats || '',
      lastKmUpdate: item.data.lastKmUpdate || '',
      warrantyStart: item.data.warrantyStart || '',
      warrantyDurationMonths: item.data.warrantyDurationMonths || '',
      warrantyEnd: item.data.warrantyEnd || '',
      note: item.data.note || '',
      stockDays: null,
      valuation: item.data.tradeInPrice ?? null
    }
  } else if (item.vehicle) {
    const v = item.vehicle
    vehicleData.value = {
      brand: v.brand || '',
      model: v.model || '',
      year: v.year || '',
      version: v.version || '',
      vin: v.vin || '',
      plates: v.plates || '',
      vehicleClass: v.vehicleClass || '',
      fuelType: v.fuelType || '',
      gearType: v.gearType || '',
      kilometers: v.kilometers ?? '',
      registration: v.registration || '',
      owner: v.owner || '',
      ownershipType: v.ownershipType || '',
      ownedSince: v.ownedSince || '',
      warrantyInfo: v.warrantyInfo || '',
      displacement: v.displacement || '',
      hp: v.hp || '',
      kw: v.kw || '',
      colour: v.colour || '',
      tractionType: v.tractionType || '',
      doors: v.doors || '',
      seats: v.seats || '',
      lastKmUpdate: v.lastKmUpdate || '',
      warrantyStart: v.warrantyStart || '',
      warrantyDurationMonths: v.warrantyDurationMonths || '',
      warrantyEnd: v.warrantyEnd || '',
      note: v.note || '',
      stockDays: null,
      valuation: item.valuation ?? (item.valuationDetail?.tradeInPrice ?? null)
    }
  } else {
    const { brand, model, year } = parseLabelToVehicle(item.label)
    const valuation = item.valuation != null ? (typeof item.valuation === 'number' ? item.valuation : parseFloat(item.valuation)) : null
    vehicleData.value = {
      brand,
      model,
      year: year || '',
      version: '',
      vin: '',
      plates: '',
      vehicleClass: '',
      fuelType: '',
      gearType: '',
      kilometers: '',
      registration: '',
      owner: '',
      ownershipType: '',
      ownedSince: '',
      warrantyInfo: '',
      displacement: '',
      hp: '',
      kw: '',
      colour: '',
      tractionType: '',
      doors: '',
      seats: '',
      lastKmUpdate: '',
      warrantyStart: '',
      warrantyDurationMonths: '',
      warrantyEnd: '',
      note: '',
      stockDays: null,
      valuation
    }
  }
}

onMounted(() => {
  if (props.item) loadItemIntoForm(props.item)
})

const resetForm = () => {
  vehicleData.value = {
    brand: '',
    model: '',
    year: '',
    version: '',
    vin: '',
    plates: '',
    fuelType: '',
    gearType: '',
    kilometers: '',
    registration: '',
    owner: '',
    ownershipType: '',
    ownedSince: '',
    warrantyInfo: '',
    note: '',
    stockDays: null,
    valuation: null
  }
}

watch(() => [props.show, props.item], ([isOpen, item]) => {
  if (isOpen && item) {
    const inferred = inferVehicleTypeFromItem(item)
    selectedVehicleType.value = props.mode === 'tradein' ? 'tradein' : (inferred || null)
    loadItemIntoForm(item)
  } else if (isOpen && !item) {
    selectedVehicleType.value = props.mode === 'tradein' ? 'tradein' : null
    resetForm()
  }
  if (!isOpen) {
    selectedVehicleType.value = null
    showBrandDropdown.value = false
    showModelDropdown.value = false
    resetForm()
  }
}, { immediate: true })

const isValid = computed(() => {
  if (isTradeIn.value) {
    return !!vehicleData.value.brand && !!vehicleData.value.model && !!vehicleData.value.year
  }
  if (selectedVehicleType.value === 'drove' || selectedVehicleType.value === 'requested') {
    return !!vehicleData.value.brand && !!vehicleData.value.model
  }
  return !!vehicleData.value.brand && !!vehicleData.value.model
})

const handleOpenChange = (isOpen) => {
  if (!isOpen) {
    emit('close')
  }
}

const handleSubmit = () => {
  if (!isValid.value) return

  const data = {
    vehicle: {
      brand: vehicleData.value.brand,
      model: vehicleData.value.model,
      year: parseInt(vehicleData.value.year) || null,
      version: vehicleData.value.version || null,
      vin: vehicleData.value.vin || null,
      plates: vehicleData.value.plates || null,
      vehicleClass: vehicleData.value.vehicleClass || null,
      fuelType: vehicleData.value.fuelType || null,
      gearType: vehicleData.value.gearType || null,
      kilometers: parseInt(vehicleData.value.kilometers) || 0,
      registration: vehicleData.value.registration || null,
      owner: vehicleData.value.owner || null,
      ownershipType: vehicleData.value.ownershipType || null,
      ownedSince: vehicleData.value.ownedSince || null,
      warrantyInfo: vehicleData.value.warrantyInfo || null,
      displacement: vehicleData.value.displacement || null,
      hp: vehicleData.value.hp || null,
      kw: vehicleData.value.kw || null,
      colour: vehicleData.value.colour || null,
      tractionType: vehicleData.value.tractionType || null,
      doors: vehicleData.value.doors || null,
      seats: vehicleData.value.seats || null,
      lastKmUpdate: vehicleData.value.lastKmUpdate || null,
      warrantyStart: vehicleData.value.warrantyStart || null,
      warrantyDurationMonths: vehicleData.value.warrantyDurationMonths || null,
      warrantyEnd: vehicleData.value.warrantyEnd || null,
      note: vehicleData.value.note || null,
      stockDays: null,
      status: 'Available'
    }
  }

  if (selectedVehicleType.value) {
    data.vehicleType = selectedVehicleType.value
  }

  if (isTradeIn.value) {
    const v = vehicleData.value.valuation
    data.valuation = {
      tradeInPrice: v != null && v !== '' ? Number(v) : null
    }
  }

  if (props.item) {
    data.id = props.item.id
    data.isEdit = true
    data.timestamp = props.item.timestamp || new Date().toISOString()
  }

  emit('save', data)
}
</script>
