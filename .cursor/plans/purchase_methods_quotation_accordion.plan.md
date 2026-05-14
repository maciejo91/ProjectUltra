---
name: Purchase methods quotation accordion
overview: Accordion Purchase methods nel configurator (Quotation) con stato vuoto + Add, modale dedicata per tre tipi (Financing / Leasing / Long term rent), lista di card collassabili con menu azioni da icona ⋮ (Modifica / Elimina) e espansione dettaglio. I metodi non impattano i calcoli del preventivo in questa iterazione (solo UI + stato mock).
todos:
  - id: empty-accordion
    content: Replicare pattern empty CollapsibleSection + Add come Discounts/Trade-in in QuotationPanel.vue
    status: pending
  - id: modal-shell
    content: Nuovo PurchaseMethodConfiguratorModal.vue (Dialog Motork, body scroll, footer Cancel/Save)
    status: pending
  - id: modal-forms
    content: Form per tipo FIN / LEA / LTR allineati agli screenshot; LTR include Services included con preset + Add funzionale per voci custom
    status: pending
  - id: state-composable
    content: useVehicleConfigurator — lista userPurchaseMethods + CRUD; selectedPurchaseMethodIds[] per checkbox card (multi, senza effetto totali V1); rimuovere o convivere con toggle catalogo PURCHASE_METHODS
    status: pending
  - id: cards-menu
    content: PurchaseMethodQuotationCard — header (checkbox, badge tipo, titolo, DropdownMenu su MoreVertical, chevron expand); corpo espanso griglia label/valore; emit edit/delete
    status: pending
isProject: true
---

# Purchase methods — accordion + modale (piano aggiornato)

## Decisioni prodotto (già confermate)

- **Modale**: nuova modale dedicata al configurator (non riuso diretto di `PurchaseMethodModal.vue` da altri contesti).
- **Impatto preventivo**: i metodi aggiunti sono **solo visualizzazione / annotazione** in questa iterazione — **nessun** aggancio ai totali della quotazione.

## Riferimenti design — modale (forniti)

Asset salvati nel workspace (fonte visiva per implementazione):

| Tipo | File |
|------|------|
| Financing | `assets/Type_Financing-223567c8-7f97-48b2-bdd4-d6dc243d70b2.png` |
| Leasing | `assets/Type_Leasing-8bfcb7df-926b-4ab6-ada1-51a318e4a321.png` |
| Long term rent | `assets/Type_Long_time_rent-34bb94d0-3407-407c-b247-1158923d0e25.png` |

Percorso assoluto tipico (Cursor project):  
`/Users/andreaconti/.cursor/projects/Users-andreaconti-Desktop-Cursor-ProjectUltra/assets/`

## Struttura modale (da allineare agli screenshot)

### Comune a tutti i tipi

- Titolo dialog: **Purchase method**; chiusura standard.
- Selettore tipo: tre **Toggle** `variant="outline"` in riga (pattern `outcome-toggle-group` / `outcome-toggle-item` come da regole progetto), etichette design: **Financing**, **Long term rent**, **Leasing** (mapping interno tipi da definire: es. `FIN` / `LTR` / `LEA` o stringhe dedicate configurator).
- Campo **Name** (testo, placeholder tipo “Insert a name for the configuration”).
- Sezioni in contenitori con bordo `border-border`, titolo sezione in `text-muted-foreground` (es. “Configuration”, “Financial details and costs”, “Timing and provider”).
- **Notes**: `textarea` full width.
- Footer: **Cancel** `variant="outline"`, **Save** `variant="default"` (pattern dialog esistente).

### Financing (screenshot 1)

- **Configuration**: Vehicle price (€); riga 3 colonne — Down payment, Financed amount, Balloon payment; Duration (months) select.
- **Financial details and costs**: Monthly installment, TAN, TAEG.
- **Timing and provider**: Starting date, Expiring date (date field + icona calendario — riuso `MiniCalendarDateField` dove possibile); Provider type Captive/Independent (Toggle o RadioGroup coerente con design); Provider name; Financial product name.

### Leasing (screenshot 2)

- **Configuration**: Vehicle price; Down payment, Financed amount, **Residual Value**; Duration; Annual mileage limit (Km); Total mileage contract (Km).
- **Financial details and costs**: Monthly installment (gross), Monthly installment (net), Estimated total lease cost.
- **Timing and provider**: Starting date, Expiring date, **Leasing type** select; Provider row come sopra.

### Long term rent (screenshot 3)

- **Configuration**: Down payment; Duration; Annual mileage limit; Total mileage contract (layout da screenshot — verificare se Vehicle price compare o no).
- **Financial details and costs**: Monthly installment (gross), Monthly installment (net), **Estimated total rental cost**.
- **Services included**: checklist (Kasko insurance, Full Maintenance, Roadside Assistance, Claims & Fines Management) + pulsante **+ Add** — **V1 funzionale**: aggiunge righe servizio custom editabili (label testuale + checkbox o solo testo; dettaglio UX da rifinire in implementazione, coerente con card in arrivo).
- **Timing and provider**: Starting date, Expiring date, **Rental type** select; Provider row come sopra.

## Accordion vuoto (informazioni già sufficienti)

- Quando `userPurchaseMethods.length === 0`: stesso pattern di **Discounts** in [`QuotationPanel.vue`](src/components/addnew/configurator/QuotationPanel.vue) — `CollapsibleSection` con `static-header`, `show-chevron="false"`, `card-style`, slot `#afterTitle` con `Button` **Add** (`Plus` + testo), click apre modale in modalità “add”.
- Quando la lista ha elementi: `CollapsibleSection` espandibile come oggi, corpo = lista **card** (vedi sotto).

## Riferimenti design — card (forniti)

| Stato | File |
|--------|------|
| Collassata | `assets/Expanded_False__Selected_False-273610bb-fefc-4a08-aa2a-13cb20672ecb.png` |
| Espansa | `assets/Expanded_True__Selected_False-7dbe8ca0-5472-449c-8c36-48727d49a30d.png` |

Stesso path base `assets/` sotto il progetto Cursor (vedi tabella modale).

## Card — struttura e comportamento (allineamento design)

Componente indicativo: `PurchaseMethodQuotationCard.vue`.

### Contenitore

- Card con `rounded-lg` (o `rounded-md` coerente con altre card quotazione), `border border-border`, `bg-background`, padding interno (`p-4` o equivalente token).

### Header (sempre visibile)

Ordine da sinistra a destra:

1. **Checkbox** — **V1**: multi-selezione persistente sul modello (`selectedPurchaseMethodIds: string[]` o `includedIds` sulle righe); **nessun** effetto sui totali del preventivo in questa iterazione. UI: stato checked da quel flag.
2. **Badge tipo** — pill `bg-muted` / `text-muted-foreground` (es. testo “Financing”, “Leasing”, “Long term rent” da mapping `type`).
3. **Titolo** — nome configurazione (es. “Finance 72”), `font-semibold text-foreground`.
4. **Azioni a destra**:
   - **Menu contestuale**: icona **MoreVertical** (`lucide-vue-next`) che apre **DropdownMenu** (o Popover con lista azioni) con voci **Modifica** e **Elimina** — allineato allo screenshot (tre punti verticali), non pulsante “Info” separato.
   - **Espandi / collassa**: **ChevronDown** / **ChevronUp** (o rotazione su un solo chevron) toggle stato interno `expanded` della card.

### Riga riassuntiva (solo stato collassato)

- Sotto l’header, una riga in `text-sm text-muted-foreground` con metriche chiave in linea (esempio **Financing** da design): rata mensile (`€ 138,00/mo`), durata (`72 months`), down payment, financed amount, balloon payment — etichetta + valore; valori mancanti come **`--`** (doppio trattino).

### Corpo espanso

- Area interna con **bordo** proprio (`border border-border rounded-lg`) e padding, separata visivamente dall’header.
- Griglia **label sopra / valore sotto** (label `text-muted-foreground text-sm`, valore `text-foreground`). Layout responsive: es. `grid-cols-2 md:grid-cols-4` dove la riga design ha 4 colonne; riga 3 del design ha 5 campi (Starting date … Financial product name) — usare `md:grid-cols-5` o wrap su due righe senza scroll orizzontale su mobile.
- **Righe dati (esempio Financing espanso)**:
  - R1: Vehicle price, Down payment, Financed amount, Balloon payment
  - R2: Duration, Monthly installment, TAN, TAEG
  - R3: Starting date, Expiring date, Provider type, Provider name, Financial product name
  - R4: Notes (può occupare colonna intera)
- **Formattazione valori**: euro con separatore migliaia `.` e decimali `,` come in design (`14.600,00`); percentuali come `% 7,95`; date `DD.MM.YYYY`; vuoti `--`.

### Mapping tipo → campi visibili

- La card **espansa** deve mostrare solo i campi pertinenti al `type` del metodo (Financing vs Leasing vs Long term rent), coerenti con i form modale; stessa logica per la **riga collassata** (scegliere 3–5 snippet più rappresentativi per tipo o fallback generico).

### Eventi verso parent

- `@edit` → apre modale in modalità edit con payload riga.
- `@delete` → rimuove riga (conferma dialog opzionale; non specificato in design — default consigliato: conferma se elimina irreversibile).
- `@update:selected` — toggle id nella lista `selectedPurchaseMethodIds` (multi-selezione); non altera calcoli quotazione in V1.

## File principali previsti

| Area | File |
|------|------|
| Lista + empty + emit | [`src/components/addnew/configurator/QuotationPanel.vue`](src/components/addnew/configurator/QuotationPanel.vue) |
| Stato + mock | [`src/composables/useVehicleConfigurator.js`](src/composables/useVehicleConfigurator.js) |
| Wiring modal | [`src/components/addnew/VehicleConfiguratorModal.vue`](src/components/addnew/VehicleConfiguratorModal.vue) |
| Nuova modale | `src/components/addnew/configurator/PurchaseMethodConfiguratorModal.vue` (nome indicativo) |
| Nuova card | `src/components/addnew/configurator/PurchaseMethodQuotationCard.vue` (nome indicativo) |
| Catalogo legacy | [`src/constants/vehicleConfiguratorCatalog.js`](src/constants/vehicleConfiguratorCatalog.js) — `PURCHASE_METHODS` da sostituire o mantenere solo come etichette seed se serve |

## Note implementative

- Rispettare regole dialog Motork (overlay `z-50`, `DialogContent` `max-h`, body `overflow-y-auto`, ecc.).
- **Niente** `w-[350px]` o valori arbitrari non token — usare classi tema e grid responsive (`grid-cols-1 md:grid-cols-3`).
- Validazione minima su Save (nome obbligatorio; campi numerici opzionali o required secondo allineamento finale con design).
- Dati persistiti come oggetto per riga (id locale) serializzabile; nessun repository obbligatorio se resta mock nel composable (coerente con “display only”).

## Decisione “Services included” (+ Add)

- **V1**: **+ Add** è **funzionale** — consente di aggiungere voci servizio custom oltre ai quattro preset (struttura dati: array di `{ id, label, included }` o equivalente nel payload del metodo).
