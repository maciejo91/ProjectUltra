<template>
  <div
    class="flex w-full min-w-0 rounded-md border border-input bg-background shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/50 focus-within:ring-offset-2 focus-within:ring-offset-background"
    :class="error ? 'border-destructive ring-1 ring-destructive/30' : ''"
  >
    <InputGroup class="h-10 min-h-10 w-full border-0 bg-transparent shadow-none focus-within:ring-0">
      <InputGroupAddon align="inline-start" class="shrink-0 border-0 bg-transparent pl-[3px] pr-0">
        <Popover :open="countryOpen" @update:open="(v) => (countryOpen = v)">
          <PopoverTrigger as-child>
            <Button
              type="button"
              variant="ghost"
              :disabled="disabled"
              class="m-1 h-8 min-h-8 shrink-0 gap-1 rounded-md bg-muted px-2.5 text-sm font-medium hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              :aria-label="t('forms.addNew.manualContact.phoneCountrySelectAria')"
            >
              {{ selectedCountry.iso2 }}
              <ChevronDown class="size-4 text-muted-foreground" aria-hidden="true" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            class="w-[min(100vw-2rem,320px)] max-w-[320px] p-0"
            align="start"
            side="bottom"
            :side-offset="4"
            @open-auto-focus.prevent
          >
            <Command class="rounded-md border-0 bg-background">
              <CommandInput :placeholder="t('forms.addNew.manualContact.phoneCountrySearchPlaceholder')" />
              <CommandList class="max-h-64 overflow-y-auto">
                <CommandEmpty class="py-4 text-center text-sm text-muted-foreground">
                  {{ t('forms.addNew.manualContact.phoneCountryEmpty') }}
                </CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    v-for="c in pickerCountries"
                    :key="c.iso2"
                    :value="commandValue(c)"
                    class="cursor-pointer"
                    @select="() => pickCountry(c)"
                  >
                    <span class="truncate">{{ c.name }}</span>
                    <span class="ml-auto shrink-0 pl-2 text-muted-foreground tabular-nums">+ {{ c.dial }}</span>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </InputGroupAddon>
      <InputGroupAddon align="inline-start" class="shrink-0 border-0 bg-transparent pl-[3px] pr-0 text-sm tabular-nums text-muted-foreground">
        + {{ selectedCountry.dial }}
      </InputGroupAddon>
      <InputGroupInput
        :id="inputId"
        :model-value="nationalDigits"
        type="tel"
        inputmode="numeric"
        autocomplete="tel-national"
        class="min-w-0 border-0 shadow-none focus-visible:ring-0"
        :placeholder="nationalPlaceholderText"
        :disabled="disabled"
        :aria-invalid="error ? true : undefined"
        @update:model-value="onNationalUpdate"
      />
    </InputGroup>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ChevronDown } from 'lucide-vue-next'
import {
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@motork/component-library/future/primitives'
import {
  countryByIso2,
  countriesForPicker,
  composeInternational,
  parseInternationalParts,
} from '@/data/countryDialCodes'

const props = defineProps({
  modelValue: { type: String, default: '' },
  defaultCountry: { type: String, default: 'IT' },
  error: { type: [String, Boolean], default: '' },
  disabled: { type: Boolean, default: false },
  /** Optional override for national-part placeholder */
  nationalPlaceholder: { type: String, default: '' },
  /** For <Label for="…"> association */
  inputId: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

const { t } = useI18n()

const countryOpen = ref(false)
const selectedIso2 = ref(props.defaultCountry)
const nationalDigits = ref('')

const selectedCountry = computed(() => countryByIso2(selectedIso2.value))
const pickerCountries = computed(() => countriesForPicker())

const nationalPlaceholderText = computed(
  () => props.nationalPlaceholder || ''
)

function commandValue(c) {
  return `${c.name} ${c.iso2} ${c.dial}`
}

function commit() {
  emit('update:modelValue', composeInternational(countryByIso2(selectedIso2.value), nationalDigits.value))
}

function pickCountry(c) {
  selectedIso2.value = c.iso2
  countryOpen.value = false
  commit()
}

function onNationalUpdate(v) {
  nationalDigits.value = String(v ?? '').replace(/\D/g, '')
  commit()
}

watch(
  () => props.modelValue,
  (v) => {
    const { country, nationalDigits: nd } = parseInternationalParts(v, props.defaultCountry)
    selectedIso2.value = country.iso2
    nationalDigits.value = nd
  },
  { immediate: true }
)
</script>
