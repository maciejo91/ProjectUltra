# Simulation (prototype only)

This folder contains **simulated** behaviour for the LQTask “interested” path. It is isolated so it can be removed when the prototype becomes a real product.

## Call extraction simulation

- **File:** `callExtractionSimulation.js`
- **Purpose:** Simulates extracting data from a phone call and filling the LQTask “interested” path (enrich lead + trade-in/financing preferences).
- **Trigger:** User clicks “Extract information” in the call panel after a (simulated) call ends.

### Enabling

Set in `.env` or `.env.local`:

```bash
VITE_LQ_SIMULATE_EXTRACTION=true
```

Restart the dev server after changing env.

### Disabling / removing for production

1. Set `VITE_LQ_SIMULATE_EXTRACTION=false` or remove the variable (default is off).
2. In `LQTask.vue`: remove the import of `isSimulationEnabled` and `simulateCallExtraction`, and change `@extract-information="handleExtractInformation"` back to `@extract-information="showComingSoonModal = true"`; remove the `handleExtractInformation` function.
3. Delete this folder and `callExtractionSimulation.js`.

No other app code should import from `@/simulation/`.
