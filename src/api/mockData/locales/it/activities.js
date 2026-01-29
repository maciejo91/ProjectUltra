export const mockActivities = [
  // Opportunity 2 activities
  {
    id: 8,
    type: 'call',
    user: 'Sarah Jenkins',
    action: 'ha fatto una chiamata',
    content: 'Discusse preferenze di colore. Il cliente è interessato a Taycan nero o bianco.',
    timestamp: '2025-03-25T11:30:00',
    opportunityId: 1
  },
  {
    id: 9,
    type: 'note',
    user: 'Sarah Jenkins',
    action: 'ha aggiunto una nota',
    content: 'Il cliente sta aspettando la disponibilità di un colore specifico. Follow-up tra 2 settimane.',
    timestamp: '2025-03-23T16:20:00',
    opportunityId: 1
  },
  {
    id: 23,
    type: 'note',
    user: 'Sarah Jenkins',
    action: 'ha aggiunto una nota',
    content: 'Il cliente preferisce esterno nero con interno beige. Verificando disponibilità.',
    timestamp: '2025-03-24T09:00:00',
    opportunityId: 1
  },
  {
    id: 10,
    type: 'email',
    user: 'Sarah Jenkins',
    action: 'ha inviato un\'email',
    content: 'Inviate opzioni di colore disponibili e informazioni sui prezzi.',
    timestamp: '2025-03-15T10:00:00',
    opportunityId: 1
  },
  {
    id: 1850,
    type: 'customer-email',
    user: 'Emma Watson',
    action: 'sent an email',
    content: 'Hi Sarah, thank you for the color options. I would like to schedule a test drive for the black Taycan next week if possible. Best, Emma',
    timestamp: '2025-03-16T14:20:00',
    opportunityId: 1
  },
  {
    id: 11,
    type: 'opportunity-created',
    user: 'System',
    action: 'Opportunità creata da richiesta sito web',
    timestamp: '2025-03-01T09:00:00',
    opportunityId: 1
  },
  // Opportunity 3 activities (DFB - Delivery completed, 3+ days ago)
  {
    id: 12,
    type: 'delivery',
    user: 'David Miller',
    action: 'ha completato la consegna',
    content: 'Veicolo consegnato con successo. Cliente soddisfatto dell\'acquisto.',
    timestamp: '2024-12-25T16:45:00', // 3+ days ago - perfect for DFB
    opportunityId: 3
  },
  {
    id: 13,
    type: 'note',
    user: 'David Miller',
    action: 'ha aggiunto una nota',
    content: 'Documentazione finale completata. Pagamento ricevuto per intero.',
    timestamp: '2024-12-25T14:00:00',
    opportunityId: 3
  },
  {
    id: 24,
    type: 'note',
    user: 'David Miller',
    action: 'ha aggiunto una nota',
    content: 'Cliente molto soddisfatto del processo di acquisto. Potenziale opportunità di referral.',
    timestamp: '2024-12-24T11:00:00',
    opportunityId: 3
  },
  {
    id: 14,
    type: 'call',
    user: 'David Miller',
    action: 'ha fatto una chiamata',
    content: 'Confermata data e ora di consegna. Il cliente ritirerà presso il concessionario.',
    timestamp: '2024-12-23T10:30:00',
    opportunityId: 3
  },
  {
    id: 1852,
    type: 'customer-whatsapp',
    user: 'Liam Johnson',
    action: 'sent a WhatsApp message',
    content: 'Thanks for the EQS brochure. When can I come in for a test drive? I am free this weekend.',
    timestamp: '2024-12-22T16:00:00',
    opportunityId: 3
  },
  {
    id: 15,
    type: 'opportunity-won',
    user: 'David Miller',
    action: 'ha contrassegnato l\'opportunità come vinta',
    timestamp: '2024-12-20T15:00:00', // Contract signed date
    opportunityId: 3
  },
  {
    id: 16,
    type: 'opportunity-created',
    user: 'System',
    action: 'Opportunità creata da visita showroom',
    timestamp: '2024-11-15T10:00:00',
    opportunityId: 3
  },
  // Opportunity 4 activities
  {
    id: 17,
    type: 'call',
    user: 'Salsabeel Khaleel',
    action: 'ha fatto una chiamata',
    content: 'Discusse opzioni di finanziamento e valore permuta. Il cliente sta negoziando il prezzo finale.',
    timestamp: '2025-03-26T14:20:00',
    opportunityId: 100
  },
  {
    id: 18,
    type: 'note',
    user: 'Salsabeel Khaleel',
    action: 'ha aggiunto una nota',
    content: 'Cliente ha richiesto uno sconto aggiuntivo. Preparazione controfferta.',
    timestamp: '2025-03-25T11:00:00',
    opportunityId: 100
  },
  {
    id: 25,
    type: 'note',
    user: 'Salsabeel Khaleel',
    action: 'ha aggiunto una nota',
    content: 'Cliente interessato a garanzia estesa e pacchetto manutenzione. Discussione opzioni.',
    timestamp: '2025-03-24T15:30:00',
    opportunityId: 100
  },
  {
    id: 19,
    type: 'email',
    user: 'Salsabeel Khaleel',
    action: 'ha inviato un\'email',
    content: 'Inviate opzioni di finanziamento dettagliate e specifiche del veicolo.',
    timestamp: '2025-03-22T09:30:00',
    opportunityId: 100
  },
  {
    id: 20,
    type: 'meeting',
    user: 'Salsabeel Khaleel',
    action: 'ha programmato un incontro',
    content: 'Test drive programmato per la prossima settimana. Il cliente visiterà il concessionario.',
    timestamp: '2025-03-20T15:00:00',
    opportunityId: 100
  },
  {
    id: 21,
    type: 'opportunity-created',
    user: 'System',
    action: 'Opportunità creata da richiesta sito web',
    timestamp: '2025-03-15T11:00:00',
    opportunityId: 100
  },
  // Opportunity 5 activities (OOFB - Open for 7+ days without offers)
  {
    id: 26,
    type: 'note',
    user: 'Michael Thomas',
    action: 'ha aggiunto una nota',
    content: 'Primo contatto effettuato. Cliente interessato alle caratteristiche EQS.',
    timestamp: '2024-12-20T10:30:00',
    opportunityId: 204
  },
  {
    id: 27,
    type: 'opportunity-created',
    user: 'System',
    action: 'Opportunità creata da richiesta sito web',
    timestamp: '2024-12-20T10:00:00',
    opportunityId: 204
  },
  // Opportunity 6 activities (UFB - Open for 14+ days without offers)
  {
    id: 28,
    type: 'call',
    user: 'Sarah Jenkins',
    action: 'ha fatto una chiamata',
    content: 'Prima chiamata. Cliente ha chiesto sulla disponibilità ID.4.',
    timestamp: '2024-12-10T09:30:00',
    opportunityId: 37
  },
  {
    id: 29,
    type: 'opportunity-created',
    user: 'System',
    action: 'Opportunità creata da campagna marketing',
    timestamp: '2024-12-10T09:00:00',
    opportunityId: 37
  },
  // Opportunity 7 activities (OFB - In Negotiation for 5+ days without contract)
  {
    id: 30,
    type: 'offer',
    user: 'David Miller',
    action: 'ha creato un\'offerta',
    content: 'Offerta iniziale inviata per BMW i4',
    timestamp: '2024-12-20T14:00:00',
    opportunityId: 36
  },
  {
    id: 31,
    type: 'call',
    user: 'David Miller',
    action: 'ha fatto una chiamata',
    content: 'Discussi dettagli offerta. Cliente sta rivedendo opzioni di finanziamento.',
    timestamp: '2024-12-19T11:00:00',
    opportunityId: 36
  },
  {
    id: 32,
    type: 'opportunity-created',
    user: 'System',
    action: 'Opportunità creata da richiesta sito web',
    timestamp: '2024-12-15T11:00:00',
    opportunityId: 36
  },
  // Opportunity 8 activities (NFU - In Negotiation with no contract date)
  {
    id: 33,
    type: 'offer',
    user: 'Michael Thomas',
    action: 'ha creato un\'offerta',
    content: 'Offerta inviata per Audi Q4 e-tron',
    timestamp: '2024-12-25T15:00:00',
    opportunityId: 223
  },
  {
    id: 34,
    type: 'email',
    user: 'Michael Thomas',
    action: 'ha inviato un\'email',
    content: 'Inviati dettagli offerta e specifiche.',
    timestamp: '2024-12-24T10:00:00',
    opportunityId: 223
  },
  {
    id: 35,
    type: 'opportunity-created',
    user: 'System',
    action: 'Opportunità creata da campagna marketing',
    timestamp: '2024-12-18T10:00:00',
    opportunityId: 223
  },
  // Opportunity 9 activities (CFB - Contract signed but not delivered)
  {
    id: 36,
    type: 'opportunity-won',
    user: 'Sarah Jenkins',
    action: 'ha contrassegnato l\'opportunità come vinta',
    content: 'Contratto firmato. Preparazione veicolo in corso.',
    timestamp: '2024-12-22T16:00:00',
    opportunityId: 38
  },
  {
    id: 37,
    type: 'note',
    user: 'Sarah Jenkins',
    action: 'ha aggiunto una nota',
    content: 'Contratto finalizzato. Pagamento ricevuto. Preparazione veicolo per consegna.',
    timestamp: '2024-12-22T14:00:00',
    opportunityId: 38
  },
  {
    id: 38,
    type: 'offer',
    user: 'Sarah Jenkins',
    action: 'ha creato un\'offerta',
    content: 'Offerta finale accettata per Macan Electric',
    timestamp: '2024-12-20T11:00:00',
    opportunityId: 38
  },
  {
    id: 39,
    type: 'opportunity-created',
    user: 'System',
    action: 'Opportunità creata da richiesta sito web',
    timestamp: '2024-12-01T09:00:00',
    opportunityId: 38
  },
  // Opportunity 16 activities (UFB - In Negotiation for 10+ days without contract)
  {
    id: 40,
    type: 'offer',
    user: 'David Miller',
    action: 'ha creato un\'offerta',
    content: 'Offerta iniziale inviata per Mercedes-Benz EQC',
    timestamp: '2024-12-15T11:00:00',
    opportunityId: 16
  },
  {
    id: 41,
    type: 'call',
    user: 'David Miller',
    action: 'ha fatto una chiamata',
    content: 'Discussi dettagli offerta. Cliente sta rivedendo termini.',
    timestamp: '2024-12-14T10:00:00',
    opportunityId: 16
  },
  {
    id: 42,
    type: 'opportunity-created',
    user: 'System',
    action: 'Opportunità creata da richiesta sito web',
    timestamp: '2024-12-05T10:00:00',
    opportunityId: 16
  },
  // Opportunity 11 activities (In Negotiation with contract date - no task widgets)
  {
    id: 43,
    type: 'opportunity-won',
    user: 'Michael Thomas',
    action: 'ha contrassegnato l\'opportunità come vinta',
    content: 'Contratto firmato. Preparazione veicolo in corso.',
    timestamp: '2024-12-20T14:00:00',
    opportunityId: 223
  },
  {
    id: 44,
    type: 'offer',
    user: 'Michael Thomas',
    action: 'ha creato un\'offerta',
    content: 'Offerta finale accettata per BMW iX3',
    timestamp: '2024-12-18T11:00:00',
    opportunityId: 223
  },
  {
    id: 45,
    type: 'note',
    user: 'Michael Thomas',
    action: 'ha aggiunto una nota',
    content: 'Cliente soddisfatto dell\'offerta. Termini contratto concordati.',
    timestamp: '2024-12-19T15:00:00',
    opportunityId: 223
  },
  {
    id: 46,
    type: 'opportunity-created',
    user: 'System',
    action: 'Opportunità creata da campagna marketing',
    timestamp: '2024-12-10T09:00:00',
    opportunityId: 223
  },
  // Opportunity 12 activities (In Negotiation with future appointment - no NFU)
  {
    id: 47,
    type: 'offer',
    user: 'Sarah Jenkins',
    action: 'ha creato un\'offerta',
    content: 'Offerta iniziale inviata per Audi A6 e-tron',
    timestamp: '2024-12-18T10:00:00',
    opportunityId: 39
  },
  {
    id: 48,
    type: 'call',
    user: 'Sarah Jenkins',
    action: 'ha fatto una chiamata',
    content: 'Discussa offerta e programmato test drive per il prossimo mese.',
    timestamp: '2024-12-17T14:00:00',
    opportunityId: 39
  },
  {
    id: 49,
    type: 'note',
    user: 'Sarah Jenkins',
    action: 'ha aggiunto una nota',
    content: 'Cliente interessato a test drive. Appuntamento programmato.',
    timestamp: '2024-12-16T11:00:00',
    opportunityId: 39
  },
  {
    id: 50,
    type: 'opportunity-created',
    user: 'System',
    action: 'Opportunità creata da richiesta sito web',
    timestamp: '2024-12-12T11:00:00',
    opportunityId: 39
  },
  // Opportunity 13 activities (Open for 14+ days - stale but no task widget)
  {
    id: 51,
    type: 'note',
    user: 'David Miller',
    action: 'ha aggiunto una nota',
    content: 'Primo contatto effettuato. Cliente interessato alle caratteristiche ID.3.',
    timestamp: '2024-12-01T08:30:00',
    opportunityId: 51
  },
  {
    id: 52,
    type: 'opportunity-created',
    user: 'System',
    action: 'Opportunità creata da campagna marketing',
    timestamp: '2024-12-01T08:00:00',
    opportunityId: 51
  },
  // Opportunity 18 activities (Awaiting Appointment - has future appointment)
  {
    id: 53,
    type: 'appointment',
    user: 'Salsabeel Khaleel',
    action: 'ha programmato un appuntamento',
    content: 'Appuntamento programmato per test drive Audi A4',
    timestamp: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 1)
      return date.toISOString()
    })(),
    opportunityId: 18
  },
  {
    id: 54,
    type: 'opportunity-created',
    user: 'System',
    action: 'Opportunità creata da richiesta sito web',
    timestamp: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 2)
      return date.toISOString()
    })(),
    opportunityId: 18
  },
  // Opportunity 20 activities (Offer Sent - offer less than 3 days old)
  {
    id: 57,
    type: 'offer',
    user: 'Sarah Jenkins',
    action: 'ha creato un\'offerta',
    content: 'Offerta iniziale inviata per Mercedes-Benz C-Class',
    timestamp: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 1) // 1 day ago (less than 3 days)
      return date.toISOString()
    })(),
    opportunityId: 10
  },
  {
    id: 58,
    type: 'opportunity-created',
    user: 'System',
    action: 'Opportunità creata da richiesta sito web',
    timestamp: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 10)
      return date.toISOString()
    })(),
    opportunityId: 10
  },
  // Opportunity 21 activities (Awaiting Response - offer 3+ days old)
  {
    id: 59,
    type: 'offer',
    user: 'Michael Thomas',
    action: 'ha creato un\'offerta',
    content: 'Offerta iniziale inviata per BMW Serie 3',
    timestamp: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 4) // 4 days ago (3+ days)
      return date.toISOString()
    })(),
    opportunityId: 223
  },
  {
    id: 60,
    type: 'note',
    user: 'Michael Thomas',
    action: 'ha aggiunto una nota',
    content: 'Cliente sta rivedendo offerta. In attesa di risposta.',
    timestamp: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 3)
      return date.toISOString()
    })(),
    opportunityId: 223
  },
  {
    id: 61,
    type: 'opportunity-created',
    user: 'System',
    action: 'Opportunità creata da campagna marketing',
    timestamp: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 15)
      return date.toISOString()
    })(),
    opportunityId: 223
  },
  // Opportunity 22 activities (Contract Pending - has contractDate)
  {
    id: 62,
    type: 'contract',
    user: 'Salsabeel Khaleel',
    action: 'data contratto impostata',
    content: 'Data contratto impostata per Porsche 911',
    timestamp: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 2)
      return date.toISOString()
    })(),
    opportunityId: 39
  },
  {
    id: 63,
    type: 'offer',
    user: 'Salsabeel Khaleel',
    action: 'ha creato un\'offerta',
    content: 'Offerta finale accettata per Porsche 911',
    timestamp: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 5)
      return date.toISOString()
    })(),
    opportunityId: 39
  },
  {
    id: 64,
    type: 'opportunity-created',
    user: 'System',
    action: 'Opportunità creata da richiesta sito web',
    timestamp: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 20)
      return date.toISOString()
    })(),
    opportunityId: 39
  },
  // Opportunity 23 activities (Closed Won - Awaiting Delivery - has deliveryDate but no delivery activity)
  {
    id: 65,
    type: 'opportunity-won',
    user: 'David Miller',
    action: 'ha contrassegnato l\'opportunità come vinta',
    timestamp: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 10)
      return date.toISOString()
    })(),
    opportunityId: 51
  },
  {
    id: 66,
    type: 'contract',
    user: 'David Miller',
    action: 'contratto firmato',
    content: 'Contratto firmato per Tesla Model Y',
    timestamp: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 10)
      return date.toISOString()
    })(),
    opportunityId: 51
  },
  {
    id: 67,
    type: 'note',
    user: 'David Miller',
    action: 'ha aggiunto una nota',
    content: 'Consegna programmata tra 5 giorni.',
    timestamp: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 3)
      return date.toISOString()
    })(),
    opportunityId: 51
  },
  {
    id: 68,
    type: 'opportunity-created',
    user: 'System',
    action: 'Opportunità creata da richiesta sito web',
    timestamp: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 30)
      return date.toISOString()
    })(),
    opportunityId: 51
  },
  
  // ========== LEAD ACTIVITIES (Leads 2-22) ==========
  
  // Lead 2 (Emma Watson) - Mercedes EQS
  {
    id: 69,
    type: 'call',
    user: 'Sarah Jenkins',
    action: 'ha tentato una chiamata',
    content: 'Nessuna risposta. Riproverò più tardi.',
    timestamp: '2025-03-26T10:15:00',
    leadId: 8
  },
  {
    id: 70,
    type: 'note',
    user: 'Sarah Jenkins',
    action: 'ha aggiunto una nota',
    content: 'Cliente preferisce contatto dopo le 14:00. Interessato a test drive EQS.',
    timestamp: '2025-03-25T16:30:00',
    leadId: 8
  },
  {
    id: 71,
    type: 'email',
    user: 'Sarah Jenkins',
    action: 'ha inviato un\'email',
    content: 'Inviate specifiche dettagliate EQS e informazioni sui prezzi.',
    timestamp: '2025-03-24T14:00:00',
    leadId: 8
  },
  
  // Lead 3 (Liam Johnson) - Mercedes EQS
  {
    id: 72,
    type: 'sms',
    user: 'David Miller',
    action: 'ha inviato un SMS',
    content: 'Ciao Liam! Il nostro concessionario Milano è in Via Roma 45. Aperto Lun-Sab 9-19. Fammi sapere quando puoi visitarci!',
    timestamp: '2025-03-26T09:00:00',
    leadId: 7
  },
  {
    id: 73,
    type: 'attachment',
    user: 'David Miller',
    action: 'ha caricato un allegato',
    content: 'Brochure Mercedes-Benz EQS e specifiche tecniche',
    fileName: 'Mercedes_EQS_Brochure_2024.pdf',
    timestamp: '2025-03-25T11:30:00',
    leadId: 7
  },
  {
    id: 74,
    type: 'note',
    user: 'David Miller',
    action: 'ha aggiunto una nota',
    content: 'Cliente vuole veicolo elettrico con autonomia elevata. EQS perfetto.',
    timestamp: '2025-03-24T10:00:00',
    leadId: 7
  },
  
  // Lead 4 (Sophie Mueller) - BMW X5
  {
    id: 75,
    type: 'whatsapp',
    user: 'Salsabeel Khaleel',
    action: 'ha inviato un messaggio WhatsApp',
    content: 'Ciao Sophie! Grazie per il tuo interesse nella BMW X5. Vorresti programmare un test drive questa settimana?',
    timestamp: '2025-03-26T15:00:00',
    leadId: 4
  },
  {
    id: 76,
    type: 'attachment',
    user: 'Salsabeel Khaleel',
    action: 'ha caricato un allegato',
    content: 'Foto esterno e interno BMW X5',
    fileName: 'BMW_X5_Photos.jpg',
    timestamp: '2025-03-25T14:00:00',
    leadId: 4
  },
  {
    id: 77,
    type: 'call',
    user: 'Salsabeel Khaleel',
    action: 'ha fatto una chiamata',
    content: 'Parlato con cliente. Molto interessata a pacchetto X5 M Sport. Discusse opzioni di finanziamento.',
    timestamp: '2025-03-24T11:00:00',
    leadId: 4
  },
  {
    id: 1851,
    type: 'customer-whatsapp',
    user: 'Sophie Mueller',
    action: 'sent a WhatsApp message',
    content: 'Hi! I received the BMW X5 photos, thank you. Can we schedule a test drive for Saturday morning?',
    timestamp: '2025-03-25T09:15:00',
    leadId: 4
  },
  
  // Lead 5 (Marco Rossi) - Volkswagen ID.4
  {
    id: 78,
    type: 'email',
    user: 'Salsabeel Khaleel',
    action: 'ha inviato un\'email',
    content: 'Inviato confronto tra modelli ID.4 e ID.5 con prezzi.',
    timestamp: '2025-03-26T10:00:00',
    leadId: 5
  },
  {
    id: 79,
    type: 'call',
    user: 'Salsabeel Khaleel',
    action: 'ha fatto una chiamata',
    content: 'Discusse benefici veicoli elettrici e infrastruttura di ricarica nell\'area di Firenze.',
    timestamp: '2025-03-25T15:30:00',
    leadId: 5
  },
  {
    id: 80,
    type: 'note',
    user: 'Salsabeel Khaleel',
    action: 'ha aggiunto una nota',
    content: 'Cliente preoccupato per tempi di ricarica. Spiegate capacità di ricarica rapida.',
    timestamp: '2025-03-24T09:00:00',
    leadId: 5
  },
  
  // Lead 6 (Klaus Schmidt) - Porsche 911
  {
    id: 81,
    type: 'attachment',
    user: 'Sarah Jenkins',
    action: 'ha caricato un allegato',
    content: 'Opzioni di configurazione Porsche 911 Carrera',
    fileName: 'Porsche_911_Configurator.pdf',
    timestamp: '2025-03-26T11:00:00',
    leadId: 6
  },
  {
    id: 82,
    type: 'whatsapp',
    user: 'Sarah Jenkins',
    action: 'ha inviato un messaggio WhatsApp',
    content: 'Ciao Klaus! Ho preparato una configurazione 911 personalizzata in base alle tue preferenze. Controlla l\'allegato!',
    timestamp: '2025-03-25T16:00:00',
    leadId: 6
  },
  {
    id: 83,
    type: 'call',
    user: 'Sarah Jenkins',
    action: 'ha fatto una chiamata',
    content: 'Discusse opzioni di personalizzazione 911. Cliente vuole pacchetto Sport Chrono.',
    timestamp: '2025-03-24T14:30:00',
    leadId: 6
  },
  
  // Lead 7 (Anna Becker) - Tesla Model 3
  {
    id: 84,
    type: 'sms',
    user: 'David Miller',
    action: 'ha inviato un SMS',
    content: 'Ciao Anna! Il tuo test drive Tesla Model 3 è confermato per venerdì alle 15:00. Ci vediamo allora!',
    timestamp: '2025-03-26T12:00:00',
    leadId: 7
  },
  {
    id: 85,
    type: 'note',
    user: 'David Miller',
    action: 'ha aggiunto una nota',
    content: 'Cliente molto entusiasta di Tesla. Preferisce variante Performance.',
    timestamp: '2025-03-25T10:00:00',
    leadId: 7
  },
  {
    id: 86,
    type: 'email',
    user: 'David Miller',
    action: 'ha inviato un\'email',
    content: 'Inviate specifiche Tesla Model 3 Performance e panoramica funzionalità Autopilot.',
    timestamp: '2025-03-24T13:00:00',
    leadId: 7
  },
  
  // Lead 8 (Thomas Weber) - Audi e-tron GT - assignee Sarah Jenkins
  {
    id: 87,
    type: 'call',
    user: 'Sarah Jenkins',
    action: 'ha fatto una chiamata',
    content: 'Discussione dettagliata su prestazioni e caratteristiche di lusso e-tron GT.',
    timestamp: '2025-03-26T14:00:00',
    leadId: 8
  },
  {
    id: 88,
    type: 'attachment',
    user: 'Sarah Jenkins',
    action: 'ha caricato un allegato',
    content: 'Documento di confronto Audi e-tron GT RS',
    fileName: 'Audi_etron_GT_Comparison.pdf',
    timestamp: '2025-03-25T11:00:00',
    leadId: 8
  },
  {
    id: 89,
    type: 'whatsapp',
    user: 'Sarah Jenkins',
    action: 'ha inviato un messaggio WhatsApp',
    content: 'Thomas, ho trovato una bellissima e-tron GT in Daytona Gray. Vorresti vederla?',
    timestamp: '2025-03-24T16:00:00',
    leadId: 8
  },
  
  // Lead 9 (Julia Fischer) - Mercedes-Benz GLE
  {
    id: 74,
    type: 'note',
    user: 'Salsabeel Khaleel',
    action: 'ha aggiunto una nota',
    content: 'Cliente ha bisogno di SUV a 7 posti. GLE perfetto con opzione terza fila.',
    timestamp: '2025-03-26T09:30:00',
    leadId: 10
  },
  {
    id: 75,
    type: 'email',
    user: 'Salsabeel Khaleel',
    action: 'ha inviato un\'email',
    content: 'Inviata configurazione GLE a 7 posti con opzioni pacchetto famiglia.',
    timestamp: '2025-03-25T14:00:00',
    leadId: 10
  },
  {
    id: 76,
    type: 'sms',
    user: 'Salsabeel Khaleel',
    action: 'ha inviato un SMS',
    content: 'Ciao Julia! La GLE 450 con 7 posti è disponibile per la visione. Quando puoi visitarci?',
    timestamp: '2025-03-24T10:30:00',
    leadId: 10
  },
  
  // Lead 10 (Michael Hoffmann) - BMW iX
  {
    id: 77,
    type: 'call',
    user: 'Sarah Jenkins',
    action: 'ha tentato una chiamata',
    content: 'Lasciato messaggio vocale su disponibilità BMW iX e opzioni test drive.',
    timestamp: '2025-03-26T11:30:00',
    leadId: 10
  },
  {
    id: 78,
    type: 'attachment',
    user: 'Sarah Jenkins',
    action: 'ha caricato un allegato',
    content: 'Caratteristiche di sostenibilità e tecnologia BMW iX',
    fileName: 'BMW_iX_Technology_Guide.pdf',
    timestamp: '2025-03-25T09:00:00',
    leadId: 10
  },
  {
    id: 79,
    type: 'note',
    user: 'Sarah Jenkins',
    action: 'ha aggiunto una nota',
    content: 'Cliente interessato a mobilità sostenibile. iX perfetta per acquirenti attenti all\'ambiente.',
    timestamp: '2025-03-24T15:00:00',
    leadId: 10
  },
  
  // Lead 11 (Laura Zimmermann) - Porsche Cayenne
  {
    id: 80,
    type: 'whatsapp',
    user: 'David Miller',
    action: 'ha inviato un messaggio WhatsApp',
    content: 'Laura, abbiamo una splendida Cayenne S bianca in arrivo la prossima settimana. Interessata a un\'anteprima?',
    timestamp: '2025-03-26T13:00:00',
    leadId: 11
  },
  {
    id: 81,
    type: 'call',
    user: 'David Miller',
    action: 'ha fatto una chiamata',
    content: 'Discusse varianti Cayenne e differenze di prestazioni tra S e Turbo.',
    timestamp: '2025-03-25T16:30:00',
    leadId: 11
  },
  {
    id: 82,
    type: 'email',
    user: 'David Miller',
    action: 'ha inviato un\'email',
    content: 'Inviato confronto Cayenne S vs Turbo con ripartizione prezzi.',
    timestamp: '2025-03-24T12:00:00',
    leadId: 11
  },
  
  // Lead 12 (Stefan Braun) - Porsche Macan
  {
    id: 83,
    type: 'note',
    user: 'Sarah Jenkins',
    action: 'ha aggiunto una nota',
    content: 'Multipli tentativi di contatto. Cliente sembra occupato. Proverò in orari diversi.',
    timestamp: '2025-03-26T10:00:00',
    leadId: 12
  },
  {
    id: 84,
    type: 'sms',
    user: 'Sarah Jenkins',
    action: 'ha inviato un SMS',
    content: 'Ciao Stefan! Ancora interessato alla Porsche Macan? Abbiamo ottime offerte di finanziamento questo mese!',
    timestamp: '2025-03-25T14:30:00',
    leadId: 12
  },
  {
    id: 85,
    type: 'call',
    user: 'Sarah Jenkins',
    action: 'ha tentato una chiamata',
    content: 'Nessuna risposta. Quinto tentativo.',
    timestamp: '2025-03-24T11:00:00',
    leadId: 12
  },
  
  // Lead 13 (Nina Keller) - Audi e-tron GT (Hot/Urgent)
  {
    id: 86,
    type: 'call',
    user: 'Sarah Jenkins',
    action: 'ha fatto una chiamata',
    content: 'Richiesta urgente. Cliente ha bisogno di e-tron GT per evento aziendale la prossima settimana.',
    timestamp: '2025-03-26T16:00:00',
    leadId: 13
  },
  {
    id: 87,
    type: 'whatsapp',
    user: 'Sarah Jenkins',
    action: 'ha inviato un messaggio WhatsApp',
    content: 'Nina, posso organizzare una visione immediata oggi alle 17:00. La e-tron GT è pronta!',
    timestamp: '2025-03-26T15:30:00',
    leadId: 13
  },
  {
    id: 88,
    type: 'attachment',
    user: 'Sarah Jenkins',
    action: 'ha caricato un allegato',
    content: 'Opzioni di consegna express e processo documentazione accelerato',
    fileName: 'Express_Delivery_Process.pdf',
    timestamp: '2025-03-26T15:00:00',
    leadId: 13
  },
  
  // Lead 14 (Oliver Lang) - Mercedes C-Class
  {
    id: 89,
    type: 'email',
    user: 'David Miller',
    action: 'ha inviato un\'email',
    content: 'Inviato confronto benefici ibrido Classe C e consumo carburante.',
    timestamp: '2025-03-26T10:30:00',
    leadId: 14
  },
  {
    id: 90,
    type: 'note',
    user: 'David Miller',
    action: 'ha aggiunto una nota',
    content: 'Cliente interessato a tecnologia ibrida per spostamenti quotidiani.',
    timestamp: '2025-03-25T13:00:00',
    leadId: 14
  },
  {
    id: 91,
    type: 'call',
    user: 'David Miller',
    action: 'ha fatto una chiamata',
    content: 'Discusse sistema ibrido e costi di manutenzione. Cliente soddisfatto delle informazioni.',
    timestamp: '2025-03-24T14:00:00',
    leadId: 14
  },
  
  // Lead 15 (Petra Schulz) - Volkswagen ID.4 - assignee Sarah Jenkins
  {
    id: 92,
    type: 'sms',
    user: 'Sarah Jenkins',
    action: 'ha inviato un SMS',
    content: 'Petra, il tuo test drive ID.4 è programmato per domani alle 11:00. Non vedo l\'ora di vederti!',
    timestamp: '2025-03-26T17:00:00',
    leadId: 15
  },
  {
    id: 93,
    type: 'attachment',
    user: 'Sarah Jenkins',
    action: 'ha caricato un allegato',
    content: 'ID.4 charging network map for Berlin area',
    fileName: 'ID4_Charging_Network_Berlin.pdf',
    timestamp: '2025-03-25T10:00:00',
    leadId: 15
  },
  {
    id: 94,
    type: 'whatsapp',
    user: 'Sarah Jenkins',
    action: 'ha inviato un messaggio WhatsApp',
    content: 'Ciao Petra! Ho trovato una bellissima ID.4 nel tuo colore preferito - Moonstone Gray. Vuoi vedere le foto?',
    timestamp: '2025-03-24T16:30:00',
    leadId: 15
  },
  
  // Lead 16 (Robert Klein) - BMW M4
  {
    id: 95,
    type: 'call',
    user: 'Salsabeel Khaleel',
    action: 'ha fatto una chiamata',
    content: 'Discusse specifiche prestazioni M4 Competition e capacità su pista.',
    timestamp: '2025-03-26T14:30:00',
    leadId: 16
  },
  {
    id: 96,
    type: 'note',
    user: 'Salsabeel Khaleel',
    action: 'ha aggiunto una nota',
    content: 'Appassionato di prestazioni. Interessato a M4 Competition con M xDrive.',
    timestamp: '2025-03-25T11:30:00',
    leadId: 16
  },
  {
    id: 97,
    type: 'email',
    user: 'Salsabeel Khaleel',
    action: 'ha inviato un\'email',
    content: 'Inviati dati prestazioni M4 Competition e caratteristiche modalità pista.',
    timestamp: '2025-03-24T09:30:00',
    leadId: 16
  },
  
  // Lead 17 (Sabine Vogel) - Audi Q5
  {
    id: 98,
    type: 'whatsapp',
    user: 'Sarah Jenkins',
    action: 'ha inviato un messaggio WhatsApp',
    content: 'Sabine, la Q5 45 TFSI di cui hai chiesto è disponibile. Puoi visitarci questa settimana?',
    timestamp: '2025-03-26T12:30:00',
    leadId: 17
  },
  {
    id: 99,
    type: 'attachment',
    user: 'Sarah Jenkins',
    action: 'ha caricato un allegato',
    content: 'Foto interno Audi Q5 e lista equipaggiamento',
    fileName: 'Audi_Q5_Interior_Photos.jpg',
    timestamp: '2025-03-25T15:00:00',
    leadId: 17
  },
  {
    id: 100,
    type: 'call',
    user: 'Sarah Jenkins',
    action: 'ha fatto una chiamata',
    content: 'Parlato di caratteristiche comfort Q5 e sistemi avanzati di assistenza alla guida.',
    timestamp: '2025-03-24T13:30:00',
    leadId: 17
  },
  
  // Lead 18 (Dr. Andreas Werner) - Porsche Taycan
  {
    id: 101,
    type: 'email',
    user: 'David Miller',
    action: 'ha inviato un\'email',
    content: 'Inviate specifiche Taycan Turbo S e confronto prestazioni con Tesla.',
    timestamp: '2025-03-26T09:00:00',
    leadId: 18
  },
  {
    id: 102,
    type: 'note',
    user: 'David Miller',
    action: 'ha aggiunto una nota',
    content: 'Cliente di alto valore. Interessato a Taycan Turbo S per prestazioni elettriche di lusso.',
    timestamp: '2025-03-25T14:00:00',
    leadId: 18
  },
  {
    id: 103,
    type: 'attachment',
    user: 'David Miller',
    action: 'ha caricato un allegato',
    content: 'Catalogo opzioni colori esclusivi Porsche Taycan',
    fileName: 'Taycan_Exclusive_Colors.pdf',
    timestamp: '2025-03-24T10:00:00',
    leadId: 18
  },
  
  // Lead 19 (Christina Bauer) - BMW X3 - assignee Salsabeel Khaleel
  {
    id: 104,
    type: 'sms',
    user: 'Salsabeel Khaleel',
    action: 'ha inviato un SMS',
    content: 'Christina, abbiamo un\'offerta speciale su X3 xDrive30i questa settimana. Risparmia fino a €5.000!',
    timestamp: '2025-03-26T11:00:00',
    leadId: 19
  },
  {
    id: 105,
    type: 'call',
    user: 'Salsabeel Khaleel',
    action: 'ha fatto una chiamata',
    content: 'Discusse caratteristiche familiari X3 e spazio bagagliaio. Christina Bauer ha due figli.',
    timestamp: '2025-03-25T16:00:00',
    leadId: 19
  },
  {
    id: 106,
    type: 'whatsapp',
    user: 'Salsabeel Khaleel',
    action: 'ha inviato un messaggio WhatsApp',
    content: 'Ciao Christina! Posso organizzare un test drive familiare con seggiolini installati. Fammi sapere!',
    timestamp: '2025-03-24T12:00:00',
    leadId: 19
  },
  
  // Lead 20 (Martin Richter) - BMW M4 Competition (Hot)
  {
    id: 107,
    type: 'call',
    user: 'Sarah Jenkins',
    action: 'ha fatto una chiamata',
    content: 'Cliente molto entusiasta. Vuole M4 Competition in Isle of Man Green.',
    timestamp: '2025-03-26T15:00:00',
    leadId: 80
  },
  {
    id: 108,
    type: 'attachment',
    user: 'Sarah Jenkins',
    action: 'ha caricato un allegato',
    content: 'M4 Competition in Isle of Man Green - foto esclusive',
    fileName: 'M4_Isle_of_Man_Green.jpg',
    timestamp: '2025-03-26T14:30:00',
    leadId: 80
  },
  {
    id: 109,
    type: 'note',
    user: 'Sarah Jenkins',
    action: 'ha aggiunto una nota',
    content: 'Appassionato di prestazioni con esperienza su pista. Pronto a procedere rapidamente.',
    timestamp: '2025-03-26T14:00:00',
    leadId: 80
  },
  
  // ========== OPPORTUNITY ACTIVITIES - MISSING TYPES ==========
  
  // Opportunity 1 activities removed - empty for demo
  
  // Opportunity 2 (Oliver Brown) - Add financing and SMS
  {
    id: 113,
    type: 'financing',
    user: 'Salsabeel Khaleel',
    action: 'ha inviato richiesta di finanziamento',
    content: 'Finanziamento approvato: durata 60 mesi al 3,5% APR',
    data: {
      term: 60,
      apr: 3.5,
      amount: 120000,
      downPayment: 30000,
      monthlyPayment: 1635,
      status: 'approved'
    },
    timestamp: '2025-03-24T14:00:00',
    opportunityId: 1
  },
  {
    id: 114,
    type: 'sms',
    user: 'Salsabeel Khaleel',
    action: 'ha inviato un SMS',
    content: 'Oliver, il tuo finanziamento è approvato! Pronto a finalizzare l\'acquisto Taycan.',
    timestamp: '2025-03-24T15:00:00',
    opportunityId: 1
  },
  {
    id: 115,
    type: 'attachment',
    user: 'Salsabeel Khaleel',
    action: 'ha caricato un allegato',
    content: 'Lettera di approvazione finanziamento e piano di pagamento',
    fileName: 'Financing_Approval_Oliver_Brown.pdf',
    timestamp: '2025-03-24T14:30:00',
    opportunityId: 1
  },
  
  // Opportunity 3 (Sophia Martinez) - Add WhatsApp and attachment
  {
    id: 116,
    type: 'whatsapp',
    user: 'David Miller',
    action: 'ha inviato un messaggio WhatsApp',
    content: 'Sophia, la tua BMW iX è stata consegnata! Spero ti piaccia. Fammi sapere se hai bisogno di qualcosa!',
    timestamp: '2024-12-26T09:00:00',
    opportunityId: 3
  },
  {
    id: 117,
    type: 'attachment',
    user: 'David Miller',
    action: 'ha caricato un allegato',
    content: 'Ricevuta di consegna e checklist consegna veicolo',
    fileName: 'Delivery_Receipt_Sophia_Martinez.pdf',
    timestamp: '2024-12-25T17:00:00',
    opportunityId: 3
  },
  {
    id: 118,
    type: 'sms',
    user: 'David Miller',
    action: 'ha inviato un SMS',
    content: 'Consegna confermata per domani alle 16:00. Tutta la documentazione pronta!',
    timestamp: '2024-12-24T16:00:00',
    opportunityId: 3
  },
  
  // Opportunity 4 (Alexander Chen) - Add trade-in and financing
  {
    id: 119,
    type: 'tradein',
    user: 'Salsabeel Khaleel',
    action: 'ha aggiunto informazioni permuta',
    content: 'Permuta cliente: Tesla Model S 2019, valutata €45.000',
    data: {
      make: 'Tesla',
      model: 'Model S',
      year: 2019,
      mileage: 38000,
      condition: 'Very Good',
      value: 45000
    },
    timestamp: '2025-03-25T10:00:00',
    opportunityId: 100
  },
  {
    id: 120,
    type: 'financing',
    user: 'Salsabeel Khaleel',
    action: 'ha inviato richiesta di finanziamento',
    content: 'Richiesta finanziamento: durata 48 mesi al 3,9% APR',
    data: {
      term: 48,
      apr: 3.9,
      amount: 50000,
      downPayment: 45000,
      monthlyPayment: 1130,
      status: 'pending'
    },
    timestamp: '2025-03-25T11:00:00',
    opportunityId: 100
  },
  {
    id: 121,
    type: 'attachment',
    user: 'Salsabeel Khaleel',
    action: 'ha caricato un allegato',
    content: 'Rapporto di valutazione permuta e foto ispezione',
    fileName: 'TradeIn_Valuation_Tesla_ModelS.pdf',
    timestamp: '2025-03-25T09:30:00',
    opportunityId: 100
  },
  
  // Opportunity 5 (Emma Wilson) - Add attachment and SMS
  {
    id: 122,
    type: 'attachment',
    user: 'Michael Thomas',
    action: 'ha caricato un allegato',
    content: 'Documenti assicurazione e carte di circolazione',
    fileName: 'Insurance_Registration_Emma_Wilson.pdf',
    timestamp: '2025-03-24T13:00:00',
    opportunityId: 204
  },
  {
    id: 123,
    type: 'sms',
    user: 'Michael Thomas',
    action: 'ha inviato un SMS',
    content: 'Emma, promemoria: la consegna della tua Mercedes EQE è programmata per venerdì alle 10:00!',
    timestamp: '2025-03-23T15:00:00',
    opportunityId: 204
  },
  {
    id: 124,
    type: 'whatsapp',
    user: 'Michael Thomas',
    action: 'ha inviato un messaggio WhatsApp',
    content: 'Tutti i documenti sono pronti! Non vedo l\'ora di consegnarti la tua nuova EQE.',
    timestamp: '2025-03-22T11:00:00',
    opportunityId: 204
  },
  
  // Opportunity 6 (Robert Taylor) - Full activity history
  {
    id: 125,
    type: 'call',
    user: 'Sarah Jenkins',
    action: 'ha fatto una chiamata',
    content: 'Discusse caratteristiche BMW X7 e opzioni di lusso.',
    timestamp: '2025-03-26T10:00:00',
    opportunityId: 37
  },
  {
    id: 126,
    type: 'note',
    user: 'Sarah Jenkins',
    action: 'ha aggiunto una nota',
    content: 'Cliente vuole X7 M60i con pacchetto Executive Drive Pro.',
    timestamp: '2025-03-25T14:00:00',
    opportunityId: 37
  },
  {
    id: 127,
    type: 'email',
    user: 'Sarah Jenkins',
    action: 'ha inviato un\'email',
    content: 'Inviata configurazione X7 M60i con tutte le opzioni richieste.',
    timestamp: '2025-03-24T11:00:00',
    opportunityId: 37
  },
  {
    id: 128,
    type: 'attachment',
    user: 'Sarah Jenkins',
    action: 'ha caricato un allegato',
    content: 'Scheda specifiche dettagliate BMW X7 M60i',
    fileName: 'BMW_X7_M60i_Specs.pdf',
    timestamp: '2025-03-23T15:00:00',
    opportunityId: 37
  },
  {
    id: 129,
    type: 'tradein',
    user: 'Sarah Jenkins',
    action: 'ha aggiunto informazioni permuta',
    content: 'Permuta cliente: BMW X5 2021, valutata €55.000',
    data: {
      make: 'BMW',
      model: 'X5',
      year: 2021,
      mileage: 28000,
      condition: 'Excellent',
      value: 55000
    },
    timestamp: '2025-03-22T10:00:00',
    opportunityId: 37
  },
  {
    id: 130,
    type: 'financing',
    user: 'Sarah Jenkins',
    action: 'ha inviato richiesta di finanziamento',
    content: 'Finanziamento approvato: durata 36 mesi al 2,9% APR',
    data: {
      term: 36,
      apr: 2.9,
      amount: 65000,
      downPayment: 55000,
      monthlyPayment: 1890,
      status: 'approved'
    },
    timestamp: '2025-03-21T14:00:00',
    opportunityId: 37
  },
  {
    id: 131,
    type: 'sms',
    user: 'Sarah Jenkins',
    action: 'ha inviato un SMS',
    content: 'Robert, ottime notizie! Il tuo finanziamento è approvato. Pronto a ordinare la tua X7!',
    timestamp: '2025-03-21T15:00:00',
    opportunityId: 37
  },
  {
    id: 132,
    type: 'whatsapp',
    user: 'Sarah Jenkins',
    action: 'ha inviato un messaggio WhatsApp',
    content: 'Ho trovato la X7 perfetta in Tanzanite Blue. Vuoi vedere le foto?',
    timestamp: '2025-03-20T12:00:00',
    opportunityId: 37
  },
  
  // Opportunity 7 (Lisa Anderson) - Add missing types
  {
    id: 133,
    type: 'attachment',
    user: 'Michael Thomas',
    action: 'ha caricato un allegato',
    content: 'Brochure e prezzi Audi Q8 e-tron',
    fileName: 'Audi_Q8_etron_Brochure.pdf',
    timestamp: '2025-03-24T10:00:00',
    opportunityId: 36
  },
  {
    id: 134,
    type: 'sms',
    user: 'Michael Thomas',
    action: 'ha inviato un SMS',
    content: 'Lisa, il tuo test drive Q8 e-tron è confermato per sabato alle 11:00!',
    timestamp: '2025-03-23T16:00:00',
    opportunityId: 36
  },
  {
    id: 135,
    type: 'whatsapp',
    user: 'Michael Thomas',
    action: 'ha inviato un messaggio WhatsApp',
    content: 'La Q8 e-tron che ti è piaciuta è ancora disponibile. Fammi sapere se vuoi procedere!',
    timestamp: '2025-03-22T14:00:00',
    opportunityId: 36
  },
  
  // Opportunity 8 (James White) - Add missing types
  {
    id: 136,
    type: 'financing',
    user: 'Michael Thomas',
    action: 'ha inviato richiesta di finanziamento',
    content: 'Finanziamento in attesa: durata 48 mesi al 4,2% APR',
    data: {
      term: 48,
      apr: 4.2,
      amount: 78000,
      downPayment: 15000,
      monthlyPayment: 1445,
      status: 'pending'
    },
    timestamp: '2024-12-24T11:00:00',
    opportunityId: 223
  },
  {
    id: 137,
    type: 'attachment',
    user: 'Michael Thomas',
    action: 'ha caricato un allegato',
    content: 'Confronto opzioni finanziamento Audi Q4 e-tron',
    fileName: 'Q4_Financing_Options.pdf',
    timestamp: '2024-12-23T15:00:00',
    opportunityId: 223
  },
  {
    id: 138,
    type: 'sms',
    user: 'Michael Thomas',
    action: 'ha inviato un SMS',
    content: 'James, ho inviato la tua domanda di finanziamento. Dovresti ricevere risposta entro 24-48 ore.',
    timestamp: '2024-12-24T12:00:00',
    opportunityId: 223
  },
  
  // Opportunity 9 (Maria Garcia) - Add missing types
  {
    id: 139,
    type: 'tradein',
    user: 'Sarah Jenkins',
    action: 'ha aggiunto informazioni permuta',
    content: 'Permuta cliente: Porsche Cayenne 2018, valutata €48.000',
    data: {
      make: 'Porsche',
      model: 'Cayenne',
      year: 2018,
      mileage: 52000,
      condition: 'Good',
      value: 48000
    },
    timestamp: '2024-12-21T10:00:00',
    opportunityId: 38
  },
  {
    id: 140,
    type: 'attachment',
    user: 'Sarah Jenkins',
    action: 'ha caricato un allegato',
    content: 'Contratto finale e programma di consegna',
    fileName: 'Contract_Maria_Garcia.pdf',
    timestamp: '2024-12-22T15:00:00',
    opportunityId: 38
  },
  {
    id: 141,
    type: 'whatsapp',
    user: 'Sarah Jenkins',
    action: 'ha inviato un messaggio WhatsApp',
    content: 'Maria, la tua Macan Electric è in preparazione per la consegna. Che emozione!',
    timestamp: '2024-12-21T14:00:00',
    opportunityId: 38
  },
  
  // Opportunity 11 (Jennifer Lee) - Add missing types
  {
    id: 142,
    type: 'attachment',
    user: 'Michael Thomas',
    action: 'ha caricato un allegato',
    content: 'Dettagli garanzia e pacchetto assistenza BMW iX3',
    fileName: 'BMW_iX3_Warranty.pdf',
    timestamp: '2024-12-19T11:00:00',
    opportunityId: 223
  },
  {
    id: 143,
    type: 'sms',
    user: 'Michael Thomas',
    action: 'ha inviato un SMS',
    content: 'Jennifer, il tuo contratto iX3 è pronto per la firma. Puoi passare questa settimana?',
    timestamp: '2024-12-18T15:00:00',
    opportunityId: 223
  },
  {
    id: 144,
    type: 'whatsapp',
    user: 'Michael Thomas',
    action: 'ha inviato un messaggio WhatsApp',
    content: 'Ottime notizie! Abbiamo assicurato la iX3 nel tuo colore preferito Sophisto Gray!',
    timestamp: '2024-12-17T10:00:00',
    opportunityId: 223
  },
  
  // Opportunity 12 (Daniel Kim) - Add missing types
  {
    id: 145,
    type: 'tradein',
    user: 'Sarah Jenkins',
    action: 'ha aggiunto informazioni permuta',
    content: 'Permuta cliente: Audi A4 2020, valutata €28.000',
    data: {
      make: 'Audi',
      model: 'A4',
      year: 2020,
      mileage: 42000,
      condition: 'Very Good',
      value: 28000
    },
    timestamp: '2024-12-17T14:00:00',
    opportunityId: 39
  },
  {
    id: 146,
    type: 'financing',
    user: 'Sarah Jenkins',
    action: 'ha inviato richiesta di finanziamento',
    content: 'Finanziamento approvato: durata 60 mesi al 3,8% APR',
    data: {
      term: 60,
      apr: 3.8,
      amount: 62000,
      downPayment: 28000,
      monthlyPayment: 1140,
      status: 'approved'
    },
    timestamp: '2024-12-17T15:00:00',
    opportunityId: 39
  },
  {
    id: 147,
    type: 'attachment',
    user: 'Sarah Jenkins',
    action: 'ha caricato un allegato',
    content: 'Configurazione A6 e-tron e riepilogo finanziamento',
    fileName: 'A6_etron_Config_Daniel_Kim.pdf',
    timestamp: '2024-12-16T13:00:00',
    opportunityId: 39
  },
  
  // Opportunity 13 (Rachel Green) - Add missing types
  {
    id: 148,
    type: 'attachment',
    user: 'David Miller',
    action: 'ha caricato un allegato',
    content: 'Guida ricarica VW ID.3 e informazioni installazione caricatore domestico',
    fileName: 'ID3_Charging_Guide.pdf',
    timestamp: '2024-12-01T09:00:00',
    opportunityId: 51
  },
  {
    id: 149,
    type: 'sms',
    user: 'David Miller',
    action: 'ha inviato un SMS',
    content: 'Rachel, la ID.3 è disponibile per test drive. Quando vorresti visitarci?',
    timestamp: '2024-12-01T10:00:00',
    opportunityId: 51
  },
  
  // Opportunity 14 (Monica Geller) - Communication-focused
  {
    id: 150,
    type: 'call',
    user: 'Michael Thomas',
    action: 'ha fatto una chiamata',
    content: 'Discusse caratteristiche Tesla Model 3 e capacità Autopilot.',
    timestamp: '2025-03-16T10:00:00',
    opportunityId: 14
  },
  {
    id: 151,
    type: 'email',
    user: 'Michael Thomas',
    action: 'ha inviato un\'email',
    content: 'Inviato confronto Model 3 con altre berline elettriche.',
    timestamp: '2025-03-15T15:00:00',
    opportunityId: 14
  },
  {
    id: 152,
    type: 'whatsapp',
    user: 'Michael Thomas',
    action: 'ha inviato un messaggio WhatsApp',
    content: 'Monica, la Model 3 che hai provato è ancora disponibile. Pronta a procedere?',
    timestamp: '2025-03-14T11:00:00',
    opportunityId: 14
  },
  {
    id: 153,
    type: 'sms',
    user: 'Michael Thomas',
    action: 'ha inviato un SMS',
    content: 'Follow-up sul tuo interesse per Model 3. Fammi sapere se hai domande!',
    timestamp: '2025-03-13T14:00:00',
    opportunityId: 14
  },
  {
    id: 154,
    type: 'note',
    user: 'Michael Thomas',
    action: 'ha aggiunto una nota',
    content: 'Cliente ha adorato il test drive. Sta considerando esterno bianco vs blu.',
    timestamp: '2025-03-12T16:00:00',
    opportunityId: 14
  },
  
  // Opportunity 15 (Ross Geller) - Document-focused
  {
    id: 155,
    type: 'attachment',
    user: 'David Miller',
    action: 'ha caricato un allegato',
    content: 'Specifiche dettagliate Mercedes-Benz GLC',
    fileName: 'Mercedes_GLC_Specs.pdf',
    timestamp: '2025-03-20T10:00:00',
    opportunityId: 15
  },
  {
    id: 156,
    type: 'attachment',
    user: 'David Miller',
    action: 'ha caricato un allegato',
    content: 'Opzioni finanziamento GLC e calcolatore pagamento',
    fileName: 'GLC_Financing_Calculator.pdf',
    timestamp: '2025-03-19T14:00:00',
    opportunityId: 15
  },
  {
    id: 157,
    type: 'attachment',
    user: 'David Miller',
    action: 'ha caricato un allegato',
    content: 'Dettagli garanzia e pacchetto manutenzione GLC',
    fileName: 'GLC_Warranty_Package.pdf',
    timestamp: '2025-03-18T11:00:00',
    opportunityId: 15
  },
  {
    id: 158,
    type: 'note',
    user: 'David Miller',
    action: 'ha aggiunto una nota',
    content: 'Cliente ha richiesto tutta la documentazione prima di prendere decisione.',
    timestamp: '2025-03-17T15:00:00',
    opportunityId: 15
  },
  {
    id: 159,
    type: 'email',
    user: 'David Miller',
    action: 'ha inviato un\'email',
    content: 'Inviato pacchetto informazioni completo GLC come richiesto.',
    timestamp: '2025-03-17T16:00:00',
    opportunityId: 15
  },
  
  // Opportunity 16 (Thomas Anderson - formerly duplicate 10) - Add missing types
  {
    id: 160,
    type: 'financing',
    user: 'David Miller',
    action: 'ha inviato richiesta di finanziamento',
    content: 'Finanziamento in attesa: durata 48 mesi al 4,5% APR',
    data: {
      term: 48,
      apr: 4.5,
      amount: 75000,
      downPayment: 0,
      monthlyPayment: 1715,
      status: 'pending'
    },
    timestamp: '2024-12-14T11:00:00',
    opportunityId: 16
  },
  {
    id: 161,
    type: 'attachment',
    user: 'David Miller',
    action: 'ha caricato un allegato',
    content: 'Guida infrastruttura ricarica Mercedes EQC',
    fileName: 'EQC_Charging_Guide.pdf',
    timestamp: '2024-12-13T15:00:00',
    opportunityId: 16
  },
  {
    id: 162,
    type: 'whatsapp',
    user: 'David Miller',
    action: 'ha inviato un messaggio WhatsApp',
    content: 'Thomas, ho inviato la tua domanda di finanziamento. Incrociamo le dita!',
    timestamp: '2024-12-14T12:00:00',
    opportunityId: 16
  },
  
  // Purchase activities (for closed/won opportunities)
  {
    id: 163,
    type: 'purchase',
    user: 'David Miller',
    action: 'ha completato un acquisto',
    data: {
      brand: 'Mercedes-Benz',
      model: 'GLE 450',
      year: 2024,
      price: 78500,
      purchaseDate: '2025-12-18',
      notes: 'Pagamento completo ricevuto. Cliente ha optato per pacchetto premium con tetto panoramico.'
    },
    timestamp: '2025-12-18T16:30:00',
    opportunityId: 3
  },
  {
    id: 164,
    type: 'purchase',
    user: 'Sarah Jenkins',
    action: 'ha completato un acquisto',
    data: {
      brand: 'Audi',
      model: 'e-tron GT',
      year: 2024,
      price: 125000,
      purchaseDate: '2025-12-20',
      notes: 'Cliente molto soddisfatto delle negoziazioni finali. Permuta processata con successo.'
    },
    timestamp: '2025-12-20T14:00:00',
    opportunityId: 38
  },
  {
    id: 165,
    type: 'purchase',
    user: 'Michael Thomas',
    action: 'ha completato un acquisto',
    data: {
      brand: 'BMW',
      model: 'iX xDrive50',
      year: 2024,
      price: 89900,
      purchaseDate: '2025-12-22',
      notes: 'Contratto finalizzato. Cliente ha selezionato vernice metallizzata blu notte.'
    },
    timestamp: '2025-12-22T11:15:00',
    opportunityId: 223
  },
  // Offer activities for new opportunities (with vehicle data for carousel)
  {
    id: 100,
    type: 'offer',
    user: 'Sarah Jenkins',
    action: 'ha creato un\'offerta',
    content: 'Initial offer sent for Audi Q5',
    timestamp: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 3)
      return date.toISOString()
    })(),
    opportunityId: 30,
    data: {
      vehicle: {
        brand: 'Audi',
        model: 'Q5',
        year: 2024,
        price: 55000,
        image: 'https://images.unsplash.com/photo-1589536672709-a5d34b12466d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGF1ZGl8ZW58MHx8MHx8fDA%3D',
        dealership: 'Milan',
        fuelType: 'Petrol',
        gearType: 'Automatic',
        kilometers: 0,
      status: 'New',
        stockDays: 10
      }
    }
  },
  {
    id: 101,
    type: 'offer',
    user: 'David Miller',
    action: 'ha creato un\'offerta',
    content: 'Follow-up offer sent for Audi Q5 Premium',
    timestamp: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 1)
      return date.toISOString()
    })(),
    opportunityId: 30,
    data: {
      vehicle: {
        brand: 'Audi',
        model: 'Q5 Premium',
        year: 2024,
        price: 58000,
        image: 'https://images.unsplash.com/photo-1589536672709-a5d34b12466d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGF1ZGl8ZW58MHx8MHx8fDA%3D',
        dealership: 'Milan',
        fuelType: 'Petrol',
        gearType: 'Automatic',
        kilometers: 0,
      status: 'New',
        stockDays: 5
      }
    }
  },
  {
    id: 102,
    type: 'offer',
    user: 'Sarah Jenkins',
    action: 'ha creato un\'offerta',
    content: 'Initial offer sent for Volkswagen Touran',
    timestamp: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 2)
      return date.toISOString()
    })(),
    opportunityId: 33,
    data: {
      vehicle: {
        brand: 'Volkswagen',
        model: 'Touran',
        year: 2023,
        price: 35000,
        image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=900&auto=format&fit=crop&q=60',
        dealership: 'Berlin',
        fuelType: 'Petrol',
        gearType: 'Automatic',
        kilometers: 10,
      status: 'Used',
        stockDays: 100
      }
    }
  }
]

// Dashboard Mock Data
