---
name: Purchase modal scrollbar UX
overview: Migliorare la resa visiva della scrollbar nella modale Purchase method (gutter tra contenuto e barra), oltre al corretto contenimento dello scroll in flex. **Implementazione annullata (rollback completo nel codice).**
todos:
  - id: flex-scroll-fix
    content: DialogContent + body scroll con min-h-0 (contenimento); overscroll-contain opzionale
    status: cancelled
  - id: visual-gutter
    content: Padding coerente (px-6) + margine/gutter a destra tra campi e scrollbar (pr aggiuntivo o wrapper)
    status: cancelled
isProject: true
---

# Scrollbar modale Purchase method — resa visiva

## Problema reale (feedback)

La scrollbar risulta **attaccata lateralmente ai contenuti**: poco piacevole. Obiettivo principale: **più respiro visivo** tra area del form e track/thumb della scrollbar, senza stravolgere la modale.

## Cosa fare (in sintesi)

### 1. Contenimento flex (base tecnica)

Come prima: **`min-h-0`** su `DialogContent` e sul `div` con `overflow-y-auto`, così lo scroll resta dentro la modale e header/footer fermi ([`PurchaseMethodConfiguratorModal.vue`](src/components/addnew/configurator/PurchaseMethodConfiguratorModal.vue)). Opzionale: `overscroll-contain`.

### 2. Gutter visivo contenuto ↔ scrollbar (focus estetico)

- **`padding` orizzontale uniforme** (`px-6`) su header, body scrollabile e footer, allineati come in [`VehicleSelectionModal.vue`](src/components/modals/VehicleSelectionModal.vue): il contenuto non va più a filo del bordo interno e la barra non “abbraccia” i campi sul lato destro nello stesso modo.
- **Extra spazio a destra** se serve: sul wrapper che ha `overflow-y-auto`, usare ad esempio **`pr-8` o `pr-10`** (sempre classi Tailwind del tema, niente valori arbitrari tipo `pr-[13px]`) **oppure** un **wrapper interno** con `pr-*` / `max-w-full` così l’ultima colonna di input non arriva fino alla track. L’effetto è una **striscia di respiro** dedicata alla scrollbar.

Ordine consigliato nel DOM: stesso file modale, solo classi e eventualmente un `div` interno avvolgente senza duplicare logica.

### 3. Stile “sottile” della scrollbar (solo se necessario)

Firefox: `scrollbar-width: thin` non ha sempre utility Tailwind nel preset: **valutare** se è accettabile una riga in [`main.css`](src/main.css) solo per una classe dedicata (es. `.mk-modal-scroll`) **oppure** evitare e restare su padding/gutter. **Non** introdurre colori hex arbitrari: restare su varianti compatibili col tema se si customizza.

### 4. Verifica

Modale con form lungo (es. LTR): controllare che tra **ultimo bordo dei campi** e **scrollbar** ci sia margine chiaro; titolo e pulsanti allineati ai lati del contenuto.

## Fuori scope

- Spostare la scrollbar “fuori” dalla modale (overlay globale): fragile e poco standard.
- Librerie terze solo per la scrollbar se il padding risolve già il problema.
