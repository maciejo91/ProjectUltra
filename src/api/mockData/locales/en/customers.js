export const mockCustomers = [
  { 
    id: 1, 
    name: 'Josh Adams', 
    initials: 'JA', 
    email: 'josh.adams@example.com', 
    phone: '+4901564879300', 
    address: 'Via Torino 56, 20123 Milan', 
    company: null, 
    source: 'Google Ads', 
    tags: ['Premium', 'Automation'], 
    createdAt: '2025-03-21T08:17:00', 
    lastContact: '2025-03-25T14:30:00',
    interestScore: 87,
    summary: 'Prefers premium SUVs and crossovers, particularly Audi models. Highly responsive to WhatsApp messages during morning hours (8-11 AM). Decision-maker who values detailed specifications and technical data. Has shown interest in automation features and driver assistance systems. Budget range: €50,000-€80,000. Prefers to schedule appointments mid-week.',
    preferredVehicleType: 'SUV',
    preferredChannel: 'WhatsApp',
    preferredContactTime: 'Mornings (8-11 AM)',
    budgetRange: '€50K-€80K'
  },
  // Duplicate candidate: same email as Josh Adams (id 1) – for duplicate merge testing
  {
    id: 1000,
    name: 'Josh Adams (duplicate)',
    initials: 'JA',
    email: 'josh.adams@example.com',
    phone: '+4901564879300',
    address: 'Piazza Duomo 1, 20122 Milan',
    company: null,
    source: 'Website',
    tags: [],
    createdAt: '2025-03-22T09:00:00',
    lastContact: '2025-03-24T10:00:00',
    interestScore: 50,
    summary: 'Potential duplicate of Josh Adams.'
  },
  { 
    id: 2, 
    name: 'Emma Watson', 
    initials: 'EW', 
    email: 'emma.watson@example.com', 
    phone: '+4901234567890', 
    address: 'Hauptstraße 12, 10115 Berlin', 
    company: null, 
    source: 'Google Ads', 
    tags: [], 
    createdAt: '2025-03-20T10:15:00', 
    lastContact: '2025-03-24T16:20:00',
    interestScore: 65,
    summary: 'First-time car buyer looking for reliable, fuel-efficient vehicles. Prefers email communication for detailed information but responds well to phone calls after 5 PM. Takes time to make decisions and appreciates follow-up with comparison data. Interested in compact sedans and hatchbacks. Budget-conscious, range: €20,000-€35,000. Values safety features highly.',
    preferredVehicleType: 'Sedan',
    preferredChannel: 'Email',
    preferredContactTime: 'Evenings (after 5 PM)',
    budgetRange: '€20K-€35K'
  },
  { 
    id: 3, 
    name: 'Liam Johnson', 
    initials: 'LJ', 
    email: 'liam.johnson@example.com', 
    phone: '+4901567891234', 
    address: 'Unter den Linden 45, 10117 Berlin', 
    company: null, 
    source: 'Google Ads', 
    tags: [], 
    createdAt: '2025-03-19T13:52:00', 
    lastContact: '2025-03-19T13:52:00',
    interestScore: 72,
    summary: 'Young professional interested in sporty coupes and performance vehicles. Very active on social media and prefers quick communication via SMS or WhatsApp. Available mostly on weekends. Has trade-in potential (owns a 2019 VW Golf). Fast decision-maker when the right deal is presented. Budget: €35,000-€50,000.',
    preferredVehicleType: 'Coupe',
    preferredChannel: 'SMS',
    preferredContactTime: 'Weekends',
    budgetRange: '€35K-€50K'
  },
  { 
    id: 4, 
    name: 'Sophie Mueller', 
    initials: 'SM', 
    email: 'sophie.mueller@example.com', 
    phone: null, 
    address: 'Maximilianstraße 10, 80539 Munich', 
    company: null, 
    source: 'Google Ads', 
    tags: ['Premium'], 
    createdAt: '2025-03-16T10:00:00', 
    lastContact: '2025-03-24T14:00:00',
    interestScore: 91,
    summary: 'Premium segment buyer with strong preference for BMW and Mercedes. Prefers email during lunch hours (12-2 PM). Appreciates personalized service and exclusive offers. Family of 4, looking for spacious SUVs with luxury features. Previous customer with excellent payment history. Budget: €80,000+. Low price sensitivity, high service expectations.',
    preferredVehicleType: 'SUV',
    preferredChannel: 'Email',
    preferredContactTime: 'Lunch hours (12-2 PM)',
    budgetRange: '€80K+'
  },
  { 
    id: 5, 
    name: 'Marco Rossi', 
    initials: 'MR', 
    email: 'marco.rossi@example.com', 
    phone: '+393401234567', 
    address: 'Via della Repubblica 25, 50123 Florence', 
    company: null, 
    source: 'Facebook', 
    tags: [], 
    createdAt: '2025-03-18T09:00:00', 
    lastContact: '2025-03-25T12:00:00',
    interestScore: 58,
    summary: 'Referred by existing customer. Interested in Italian brands (Alfa Romeo, Fiat). Prefers face-to-face meetings and test drives. Available mainly in early mornings (7-9 AM) before work. Loyal customer type who values long-term relationships. Looking for family vehicles with good fuel economy. Budget: €30,000-€45,000. Open to financing options.',
    preferredVehicleType: 'Minivan',
    preferredChannel: 'Phone',
    preferredContactTime: 'Early mornings (7-9 AM)',
    budgetRange: '€30K-€45K'
  },
  { 
    id: 6, 
    name: 'Klaus Schmidt', 
    initials: 'KS', 
    email: 'klaus.schmidt@example.com', 
    phone: '+4901789123456', 
    address: 'Friedrichstraße 100, 10117 Berlin', 
    company: null, 
    source: 'Google Ads', 
    tags: [], 
    createdAt: '2025-03-06T10:00:00', 
    lastContact: '2025-03-23T14:00:00',
    interestScore: 44,
    summary: 'Business professional looking for reliable sedan for daily commute. Prefers email communication and detailed specifications. Interested in mid-range vehicles with good fuel economy. Budget: €30,000-€45,000. Available for test drives on weekends.'
  },
  { 
    id: 7, 
    name: 'Anna Becker', 
    initials: 'AB', 
    email: 'anna.becker@example.com', 
    phone: '+4901890234567', 
    address: 'Reeperbahn 50, 20359 Hamburg', 
    company: null, 
    source: 'Google Ads', 
    tags: [], 
    createdAt: '2025-03-13T10:00:00', 
    lastContact: '2025-03-24T15:00:00',
    interestScore: 78,
    summary: 'Family-oriented buyer seeking spacious vehicle for family of 4. Values safety features and cargo space. Prefers phone calls during business hours. Interested in SUVs and minivans. Budget: €35,000-€50,000. Decision-maker who values practical features over luxury.'
  },
  { 
    id: 8, 
    name: 'Thomas Weber', 
    initials: 'TW', 
    email: 'thomas.weber@example.com', 
    phone: '+4901901345678', 
    address: 'Königsallee 60, 40212 Düsseldorf', 
    company: null, 
    source: 'Walk-in', 
    tags: [], 
    createdAt: '2025-03-01T10:00:00', 
    lastContact: '2025-03-22T10:00:00',
    interestScore: 83,
    summary: 'Executive looking for premium sedan for business use. Prefers in-person meetings and detailed walkthroughs. Interested in German luxury brands. Budget: €60,000-€80,000. Values prestige and advanced technology features.'
  },
  { 
    id: 9, 
    name: 'Julia Fischer', 
    initials: 'JF', 
    email: 'julia.fischer@example.com', 
    phone: '+4901912456789', 
    address: 'Ludwigstraße 15, 70173 Stuttgart', 
    company: null, 
    source: 'Google Ads', 
    tags: [], 
    createdAt: '2025-03-19T10:00:00', 
    lastContact: '2025-03-25T09:00:00',
    interestScore: 69,
    summary: 'Young professional interested in compact cars with modern technology. Prefers email for initial contact, phone for follow-ups. Interested in electric and hybrid vehicles. Budget: €25,000-€40,000. Environmentally conscious buyer.'
  },
  { 
    id: 10, 
    name: 'Michael Hoffmann', 
    initials: 'MH', 
    email: 'michael.hoffmann@example.com', 
    phone: '+4901923567890', 
    address: 'Marienplatz 8, 80331 Munich', 
    company: null, 
    source: 'Facebook', 
    tags: [], 
    createdAt: '2025-03-14T10:00:00', 
    lastContact: '2025-03-24T16:00:00',
    interestScore: 88,
    summary: 'Referred customer interested in mid-size SUVs. Prefers phone communication during evenings. Looking for reliable vehicle with good resale value. Budget: €40,000-€55,000. Values long-term ownership and maintenance costs.'
  },
  { 
    id: 11, 
    name: 'Laura Zimmermann', 
    initials: 'LZ', 
    email: 'laura.zimmermann@example.com', 
    phone: '+4901934678901', 
    address: 'Kurfürstendamm 100, 10709 Berlin', 
    company: null, 
    source: 'Walk-in', 
    tags: ['Urgent'], 
    createdAt: '2025-03-09T10:00:00', 
    lastContact: '2025-03-25T06:00:00',
    interestScore: 75,
    summary: 'Urgent buyer - needs vehicle within 2 weeks. Single mother of 2, prioritizes safety and practicality over luxury. Prefers compact SUVs or minivans with good cargo space. Best reached by phone during school hours (9 AM-3 PM). Price-sensitive but willing to pay for essential safety features. Looking for financing options. Budget: €25,000-€35,000. Responds well to empathetic, solution-focused approach.',
    preferredVehicleType: 'SUV',
    preferredChannel: 'Phone',
    preferredContactTime: 'School hours (9 AM-3 PM)',
    budgetRange: '€25K-€35K'
  },
  { 
    id: 12, 
    name: 'Stefan Braun', 
    initials: 'SB', 
    email: 'stefan.braun@example.com', 
    phone: '+4901945789012', 
    address: 'Elbchaussee 200, 22605 Hamburg', 
    company: null, 
    source: 'Google Ads', 
    tags: [], 
    createdAt: '2025-03-03T10:00:00', 
    lastContact: '2025-03-25T00:00:00',
    interestScore: 92,
    summary: 'Active buyer interested in performance vehicles. Prefers WhatsApp for quick communication. Looking for sporty sedans or coupes. Budget: €45,000-€65,000. Values driving dynamics and engine performance.'
  },
  { 
    id: 13, 
    name: 'Nina Keller', 
    initials: 'NK', 
    email: 'nina.keller@example.com', 
    phone: '+4901956890123', 
    address: 'Bahnhofstraße 45, 60329 Frankfurt', 
    company: null, 
    source: 'Facebook', 
    tags: ['VIP', 'Urgent'], 
    createdAt: '2025-03-25T06:00:00', 
    lastContact: '2025-03-25T07:00:00',
    interestScore: 81,
    summary: 'VIP referral - high-priority lead. Fashion industry professional with refined taste. Interested in premium compact vehicles (Mini Cooper, Audi A3, BMW 1 Series) with stylish design. Very busy schedule - prefers text/SMS for quick updates, video calls for detailed discussions. Available mostly late evenings (8-10 PM). Fast decision-maker when presented with exclusive options. Budget: €40,000-€60,000. Values unique customization options.',
    preferredVehicleType: 'Compact',
    preferredChannel: 'SMS',
    preferredContactTime: 'Late evenings (8-10 PM)',
    budgetRange: '€40K-€60K'
  },
  { 
    id: 14, 
    name: 'Oliver Lang', 
    initials: 'OL', 
    email: 'oliver.lang@example.com', 
    phone: '+4901967901234', 
    address: 'Schillerstraße 30, 70173 Stuttgart', 
    company: null, 
    source: 'Google Ads', 
    tags: [], 
    createdAt: '2025-03-25T00:00:00', 
    lastContact: '2025-03-25T04:00:00',
    interestScore: 55,
    summary: 'Tech professional interested in electric vehicles. Prefers email communication and detailed technical specifications. Looking for modern EVs with long range. Budget: €40,000-€60,000. Values innovation and sustainability.'
  },
  { 
    id: 15, 
    name: 'Petra Schulz', 
    initials: 'PS', 
    email: 'petra.schulz@example.com', 
    phone: '+4901978012345', 
    address: 'Alexanderplatz 5, 10178 Berlin', 
    company: null, 
    source: 'Walk-in', 
    tags: ['Hot'], 
    createdAt: '2025-03-20T10:00:00', 
    lastContact: '2025-03-22T10:00:00',
    interestScore: 84,
    summary: 'Hot lead interested in compact luxury vehicles. Prefers phone calls during business hours. Looking for premium compact cars with stylish design. Budget: €35,000-€50,000. Fast decision-maker when presented with right options.'
  },
  { 
    id: 17, 
    name: 'Sabine Vogel', 
    initials: 'SV', 
    email: 'sabine.vogel@example.com', 
    phone: '+4901990234567', 
    address: 'Goethestraße 25, 60313 Frankfurt', 
    company: null, 
    source: 'Walk-in', 
    tags: [], 
    createdAt: '2025-03-24T10:00:00', 
    lastContact: '2025-03-25T03:00:00',
    interestScore: 62,
    summary: 'Family buyer seeking reliable vehicle for daily use. Prefers phone communication. Interested in practical vehicles with good fuel economy. Budget: €25,000-€40,000. Values reliability and low maintenance costs.'
  },
  { 
    id: 20, 
    name: 'Martin Richter', 
    initials: 'MR', 
    email: 'martin.richter@example.com', 
    phone: '+4902023567890', 
    address: 'Mönckebergstraße 15, 20095 Hamburg', 
    company: null, 
    source: 'Walk-in', 
    tags: ['Performance', 'Hot'], 
    createdAt: '2025-03-21T10:00:00', 
    lastContact: '2025-03-24T10:00:00',
    interestScore: 90,
    summary: 'Performance enthusiast. Hot lead interested in sports cars and high-performance vehicles. Highly engaged and knowledgeable about specs. Prefers WhatsApp for quick questions and phone calls for serious discussions. Available mainly on weekends for test drives. Has active trade-in (Porsche 911). Looking to upgrade. Budget: €120,000+. Impulse buyer when excited about the vehicle.',
    preferredVehicleType: 'Sports Car',
    preferredChannel: 'WhatsApp',
    preferredContactTime: 'Weekends',
    budgetRange: '€120K+'
  },
  { 
    id: 21, 
    name: 'Emma Wilson', 
    initials: 'EW', 
    email: 'emma.wilson@example.com', 
    phone: '+4901987654321', 
    address: 'Via Garibaldi 10, 50123 Firenze', 
    company: null, 
    source: 'Google Ads', 
    tags: ['Premium'], 
    createdAt: '2025-03-24T10:00:00', 
    lastContact: '2025-03-24T10:00:00',
    interestScore: 85,
    summary: 'Premium buyer interested in luxury vehicles. Prefers email communication and detailed information. Looking for high-end sedans or SUVs with premium features. Budget: €70,000-€100,000. Values quality, comfort, and brand prestige.'
  },
  { 
    id: 22, 
    name: 'Daniel Kim', 
    initials: 'DK', 
    email: 'daniel.kim@example.com', 
    phone: '+4901777888999', 
    address: 'Via Roma 15, 20121 Milano', 
    company: null, 
    source: 'Google Ads', 
    tags: [], 
    createdAt: '2024-12-10T09:00:00', 
    lastContact: '2024-12-18T10:00:00',
    interestScore: 71,
    summary: 'Professional looking for reliable mid-size vehicle. Prefers phone communication during business hours. Interested in sedans with good fuel economy. Budget: €35,000-€50,000. Values reliability and resale value.'
  },
  { 
    id: 23, 
    name: 'Robert Taylor', 
    initials: 'RT', 
    email: 'robert.taylor@example.com', 
    phone: '+4901888999000', 
    address: 'Via Garibaldi 20, 50123 Firenze', 
    company: null, 
    source: 'Facebook', 
    tags: [], 
    createdAt: '2024-12-05T10:00:00', 
    lastContact: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 3)
      return date.toISOString()
    })(),
    interestScore: 38,
    summary: 'Family buyer who was unreachable after multiple contact attempts. Submitted inquiry for Ford Focus but phone went unanswered on 4 attempts over 2 weeks. Auto-disqualified as unreachable. May have changed contact information or lost interest. Budget: €25,000-€30,000.',
    preferredVehicleType: 'Sedan',
    preferredChannel: 'Phone',
    preferredContactTime: 'Unknown (unreachable)',
    budgetRange: '€25K-€30K'
  },
  { 
    id: 24, 
    name: 'Daniel Kim', 
    initials: 'DK', 
    email: 'daniel.kim@example.com', 
    phone: '+4901777888999', 
    address: 'Via Roma 15, 20121 Milano', 
    company: null, 
    source: 'Google Ads', 
    tags: [], 
    createdAt: '2024-12-12T11:00:00', 
    lastContact: '2024-12-18T10:00:00',
    interestScore: 56,
    summary: 'Repeat inquiry from same customer. Still interested in mid-size sedans. Prefers phone communication. Budget: €35,000-€50,000. Looking for best value proposition.'
  },
  { 
    id: 25, 
    name: 'Janice Litman', 
    initials: 'JL', 
    email: 'janice.litman@example.com', 
    phone: '+4901888999000', 
    address: 'Alexanderstraße 10, 10178 Berlin', 
    company: null, 
    source: 'Google Ads', 
    tags: [], 
    createdAt: '2024-12-08T10:00:00', 
    lastContact: '2024-12-20T14:00:00',
    interestScore: 73,
    summary: 'Urban professional interested in compact vehicles. Prefers email communication. Looking for efficient city cars with modern technology. Budget: €25,000-€40,000. Values fuel economy and parking ease.'
  },
  { 
    id: 26, 
    name: 'Michael Brown', 
    initials: 'MB', 
    email: 'michael.brown@example.com', 
    phone: '+4901999000111', 
    address: 'Via Dante 5, 20121 Milano', 
    company: null, 
    source: 'Google Ads', 
    tags: [], 
    createdAt: '2024-12-07T10:00:00', 
    lastContact: '2024-12-20T15:00:00',
    interestScore: 79,
    summary: 'Business owner looking for reliable vehicle for business and personal use. Prefers phone calls. Interested in executive sedans. Budget: €45,000-€65,000. Values professionalism and reliability.'
  },
  { 
    id: 27, 
    name: 'Sarah Johnson', 
    initials: 'SJ', 
    email: 'sarah.johnson@example.com', 
    phone: '+4901111222333', 
    address: 'Via Manzoni 10, 20121 Milano', 
    company: null, 
    source: 'Google Ads', 
    tags: [], 
    createdAt: '2024-12-06T10:00:00', 
    lastContact: '2024-12-20T16:00:00',
    interestScore: 68,
    summary: 'Young professional interested in sporty vehicles. Prefers WhatsApp for quick communication. Looking for coupes or sporty sedans. Budget: €30,000-€50,000. Values style and performance.'
  },
  { 
    id: 28, 
    name: 'Thomas Anderson', 
    initials: 'TA', 
    email: 'thomas.anderson@example.com', 
    phone: '+4901222333444', 
    address: 'Via Verdi 8, 20121 Milano', 
    company: null, 
    source: 'Google Ads', 
    tags: [], 
    createdAt: '2024-12-05T10:00:00', 
    lastContact: '2024-12-20T17:00:00',
    interestScore: 61,
    summary: 'Family buyer seeking practical vehicle. Prefers email communication. Interested in reliable sedans or SUVs. Budget: €30,000-€45,000. Values safety and reliability.'
  },
  { 
    id: 29, 
    name: 'Emily Davis', 
    initials: 'ED', 
    email: 'emily.davis@example.com', 
    phone: '+4901999000222', 
    address: 'Via Dante 6, 20121 Milano', 
    company: null, 
    source: 'Google Ads', 
    tags: [], 
    createdAt: '2024-12-04T10:00:00', 
    lastContact: '2024-12-20T18:00:00',
    interestScore: 52,
    summary: 'First-time buyer looking for entry-level vehicle. Prefers phone communication. Interested in compact cars with good value. Budget: €20,000-€35,000. Values affordability and fuel economy.'
  },
  // Additional customers from opportunities (reassigned IDs to avoid conflicts)
  { 
    id: 30, 
    name: 'Sophia Martinez', 
    initials: 'SM', 
    email: 'sophia.martinez@example.com', 
    phone: '+4901555666777', 
    address: 'Piazza Navona 8, 00186 Roma', 
    company: null, 
    source: 'Google Ads', 
    tags: [], 
    createdAt: '2025-03-01T09:00:00', 
    lastContact: '2025-03-25T11:30:00',
    interestScore: 86,
    summary: 'Premium buyer interested in luxury electric vehicles. Prefers email communication and detailed specifications. Looking for high-end EVs with long range. Budget: €80,000-€120,000. Values innovation and sustainability.'
  },
  { 
    id: 31, 
    name: 'Alexander Chen', 
    initials: 'AC', 
    email: 'alexander.chen@example.com', 
    phone: '+4901999888777', 
    address: 'Via Montenapoleone 3, 20121 Milano', 
    company: null, 
    source: 'Google Ads', 
    tags: ['Premium'], 
    createdAt: '2025-03-16T10:00:00', 
    lastContact: '2025-03-16T10:00:00',
    interestScore: 94,
    summary: 'High-end buyer looking for luxury vehicles. Prefers phone communication. Interested in premium sedans and SUVs. Budget: €90,000-€150,000. Values exclusivity and advanced features.'
  },
  { 
    id: 32, 
    name: 'Lisa Anderson', 
    initials: 'LA', 
    email: 'lisa.anderson@example.com', 
    phone: '+4901555123456', 
    address: 'Marienplatz 5, 80331 München', 
    company: null, 
    source: 'Google Ads', 
    tags: [], 
    createdAt: '2024-12-20T10:00:00', 
    lastContact: '2024-12-20T10:00:00',
    interestScore: 67,
    summary: 'Professional seeking reliable mid-size vehicle. Prefers email communication. Interested in practical sedans with good fuel economy. Budget: €35,000-€50,000. Values reliability and efficiency.'
  },
  { 
    id: 33, 
    name: 'James White', 
    initials: 'JW', 
    email: 'james.white@example.com', 
    phone: '+4901999887766', 
    address: 'Schildergasse 18, 50667 Köln', 
    company: null, 
    source: 'Google Ads', 
    tags: ['Premium'], 
    createdAt: '2024-12-15T11:00:00', 
    lastContact: '2024-12-20T14:00:00',
    interestScore: 82,
    summary: 'Executive buyer interested in premium vehicles. Prefers phone communication during business hours. Looking for luxury sedans with advanced technology. Budget: €70,000-€100,000. Values prestige and comfort.'
  },
  { 
    id: 34, 
    name: 'Maria Garcia', 
    initials: 'MG', 
    email: 'maria.garcia@example.com', 
    phone: '+4901444555666', 
    address: 'Königsallee 70, 40212 Düsseldorf', 
    company: null, 
    source: 'Google Ads', 
    tags: [], 
    createdAt: '2024-12-18T10:00:00', 
    lastContact: '2024-12-25T15:00:00',
    interestScore: 74,
    summary: 'Family buyer seeking spacious vehicle. Prefers email communication. Interested in SUVs with good cargo space. Budget: €40,000-€60,000. Values safety and practicality.'
  },
  { 
    id: 35, 
    name: 'Jennifer Lee', 
    initials: 'JL', 
    email: 'jennifer.lee@example.com', 
    phone: '+4901888777666', 
    address: 'Zeil 90, 60313 Frankfurt am Main', 
    company: null, 
    source: 'Google Ads', 
    tags: ['Automation'], 
    createdAt: '2024-12-10T09:00:00', 
    lastContact: '2024-12-20T14:00:00',
    interestScore: 77,
    summary: 'Tech-savvy buyer interested in vehicles with advanced automation features. Prefers email communication. Looking for modern vehicles with driver assistance systems. Budget: €45,000-€70,000. Values innovation and safety technology.'
  },
  { 
    id: 36, 
    name: 'Ross Geller', 
    initials: 'RG', 
    email: 'ross.geller@example.com', 
    phone: '+4901222333444', 
    address: 'Unter den Linden 77, 10117 Berlin', 
    company: null, 
    source: 'Google Ads', 
    tags: [], 
    createdAt: '2024-12-03T10:00:00', 
    lastContact: '2024-12-20T11:00:00',
    interestScore: 59,
    summary: 'Professional looking for reliable vehicle for daily commute. Prefers phone communication. Interested in mid-size sedans. Budget: €30,000-€45,000. Values fuel economy and reliability.'
  },
  { 
    id: 37, 
    name: 'Rachel Green', 
    initials: 'RG', 
    email: 'rachel.green@example.com', 
    phone: '+4901333444555', 
    address: 'Alexanderplatz 1, 10178 Berlin', 
    company: null, 
    source: 'Google Ads', 
    tags: [], 
    createdAt: '2024-12-02T10:00:00', 
    lastContact: '2024-12-20T12:00:00',
    interestScore: 70,
    summary: 'Urban professional interested in compact luxury vehicles. Prefers email communication. Looking for stylish compact cars with premium features. Budget: €35,000-€55,000. Values style and brand image.'
  },
  // New customers with only contact data (no leads or opportunities yet)
  {
    id: 38,
    name: 'Alexandra Petrov',
    initials: 'AP',
    email: 'alexandra.petrov@example.com',
    phone: '+4901555666888',
    address: 'Potsdamer Platz 1, 10785 Berlin',
    company: null,
    source: 'Walk-in',
    tags: [],
    createdAt: (() => {
      const date = new Date()
      date.setHours(date.getHours() - 2) // Created 2 hours ago
      return date.toISOString()
    })(),
    lastContact: (() => {
      const date = new Date()
      date.setHours(date.getHours() - 2)
      return date.toISOString()
    })(),
    interestScore: 48
  },
  {
    id: 40,
    name: 'Isabella Rodriguez',
    initials: 'IR',
    email: 'isabella.rodriguez@example.com',
    phone: '+4901777888999',
    address: 'Maximilianstraße 25, 80539 Munich',
    company: null,
    source: 'Facebook',
    tags: [],
    createdAt: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 1) // Created yesterday
      date.setHours(14, 0, 0, 0)
      return date.toISOString()
    })(),
    lastContact: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 1)
      date.setHours(14, 0, 0, 0)
      return date.toISOString()
    })(),
    interestScore: 53
  },
  {
    id: 41,
    name: 'Felix Müller',
    initials: 'FM',
    email: 'felix.mueller@example.com',
    phone: '+4901888999000',
    address: 'Königsallee 80, 40212 Düsseldorf',
    company: null,
    source: 'Instagram',
    tags: [],
    createdAt: (() => {
      const date = new Date()
      date.setHours(date.getHours() - 3) // Created 3 hours ago
      return date.toISOString()
    })(),
    lastContact: (() => {
      const date = new Date()
      date.setHours(date.getHours() - 3)
      return date.toISOString()
    })(),
    interestScore: 64
  },
  {
    id: 42,
    name: 'Sofia Andersson',
    initials: 'SA',
    email: 'sofia.andersson@example.com',
    phone: '+4901999000111',
    address: 'Reeperbahn 75, 20359 Hamburg',
    company: null,
    source: 'Google Ads',
    tags: [],
    createdAt: (() => {
      const date = new Date()
      date.setHours(date.getHours() - 1) // Created 1 hour ago
      return date.toISOString()
    })(),
    lastContact: (() => {
      const date = new Date()
      date.setHours(date.getHours() - 1)
      return date.toISOString()
    })(),
    interestScore: 89
  },
  {
    id: 43,
    name: 'Lucas Bergmann',
    initials: 'LB',
    email: 'lucas.bergmann@example.com',
    phone: '+4901111222333',
    address: 'Bahnhofstraße 30, 60329 Frankfurt',
    company: null,
    source: 'Walk-in',
    tags: [],
    createdAt: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 1) // Created yesterday
      date.setHours(10, 0, 0, 0)
      return date.toISOString()
    })(),
    lastContact: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 1)
      date.setHours(10, 0, 0, 0)
      return date.toISOString()
    })(),
    interestScore: 57
  },
  {
    id: 44,
    name: 'Elena Kowalski',
    initials: 'EK',
    email: 'elena.kowalski@example.com',
    phone: '+4901222333444',
    address: 'Via del Corso 120, 00186 Roma',
    company: null,
    source: 'Immo-scout',
    tags: [],
    createdAt: (() => {
      const date = new Date()
      date.setHours(date.getHours() - 4) // Created 4 hours ago
      return date.toISOString()
    })(),
    lastContact: (() => {
      const date = new Date()
      date.setHours(date.getHours() - 4)
      return date.toISOString()
    })(),
    interestScore: 66
  },
  // Lead with missing email (scheduled recall demo)
  {
    id: 45,
    name: 'Oliver Hartmann',
    initials: 'OH',
    email: null,
    phone: '+4901333444555',
    address: 'Schillerstraße 22, 10117 Berlin',
    company: null,
    source: 'Walk-in',
    tags: [],
    createdAt: (() => {
      const date = new Date()
      date.setHours(date.getHours() - 5)
      return date.toISOString()
    })(),
    lastContact: (() => {
      const date = new Date()
      date.setHours(date.getHours() - 2)
      return date.toISOString()
    })(),
    interestScore: 55
  },
  // ============================================
  // NESTED CONTACT-ACCOUNT RELATIONSHIP DEMO DATA
  // ============================================
  
  // Company Account: Ferrari Dealership Group (1:N relationship)
  {
    id: 100,
    name: 'Ferrari Dealership Group',
    initials: 'FDG',
    email: 'info@ferraridealership.com',
    phone: '+390212345678',
    address: 'Via Emilia 123, 40121 Bologna, Italy',
    company: 'Ferrari Dealership Group', // This makes it an account
    source: 'Corporate',
    tags: ['Premium', 'Corporate', 'High-Value'],
    createdAt: '2024-01-15T10:00:00',
    lastContact: '2025-03-25T14:00:00',
    interestScore: 93,
    // Account-specific fields
    type: 'Company',
    vat: 'IT12345678901',
    vatNumber: 'IT12345678901',
    taxCode: 'FDRGRP85M01H501X',
    fiscalCode: 'FDRGRP85M01H501X',
    accountOwner: { id: 2, name: 'Sarah Jenkins', initials: 'SJ' }, // Sales Rep assigned
    owner: { id: 2, name: 'Sarah Jenkins', initials: 'SJ' },
    masterContactId: 101, // Marco Rossini is the master contact
    masterContact: { id: 101, name: 'Marco Rossini' },
    description: 'Premium automotive dealership group specializing in luxury vehicles. Established 1995. Multiple locations across Italy. High-value corporate client with fleet purchasing capabilities.',
    notes: 'Corporate fleet buyer - prefers email communication. Requires detailed proposals with TCO analysis. Decision-making involves board approval process.',
    numberOfEmployees: 150,
    // Account-owned vehicles
    vehicles: [
      {
        id: 'account-vehicle-1',
        brand: 'Ferrari',
        model: 'F8 Tributo',
        year: 2024,
        type: 'owned',
        price: 280000,
        fuelType: 'Petrol',
        gearType: 'Automatic',
        kilometers: 0
      },
      {
        id: 'account-vehicle-2',
        brand: 'Ferrari',
        model: 'SF90 Stradale',
        year: 2024,
        type: 'owned',
        price: 450000,
        fuelType: 'Hybrid',
        gearType: 'Automatic',
        kilometers: 0
      }
    ]
  },
  
  // Contact 1: Marco Rossini (Master Contact for Ferrari Dealership Group)
  {
    id: 101,
    name: 'Marco Rossini',
    initials: 'MR',
    email: 'marco.rossini@ferraridealership.com',
    phone: '+390212345679',
    address: 'Via Emilia 123, 40121 Bologna, Italy',
    company: null, // This makes it a contact
    account_id: 100, // Links to Ferrari Dealership Group
    accountId: 100,
    source: 'Corporate',
    tags: ['Master Contact', 'Premium', 'Corporate'],
    createdAt: '2024-01-15T10:00:00',
    lastContact: '2025-03-25T14:00:00',
    interestScore: 91,
    title: 'Mr.',
    salutation: 'Mr.',
    jobTitle: 'Sales Manager',
    summary: 'Master contact for Ferrari Dealership Group. Primary decision-maker for fleet purchases. Prefers email for proposals and phone for urgent matters. Available weekdays 9 AM-6 PM.',
    preferredVehicleType: 'Sports Car',
    preferredChannel: 'Email',
    preferredContactTime: 'Business hours (9 AM-6 PM)',
    budgetRange: '€200K+'
  },
  
  // Contact 2: Giovanni Rossi (Finance Manager - Related Contact)
  {
    id: 102,
    name: 'Giovanni Rossi',
    initials: 'GR',
    email: 'giovanni.rossi@ferraridealership.com',
    phone: '+390212345680',
    address: 'Via Emilia 123, 40121 Bologna, Italy',
    company: null,
    account_id: 100,
    accountId: 100,
    source: 'Corporate',
    tags: ['Finance', 'Corporate'],
    createdAt: '2024-01-20T10:00:00',
    lastContact: '2025-03-24T16:00:00',
    interestScore: 76,
    title: 'Mr.',
    salutation: 'Mr.',
    jobTitle: 'Finance Manager',
    summary: 'Finance Manager at Ferrari Dealership Group. Handles financial approvals and payment terms. Prefers email communication with detailed financial documentation.',
    preferredVehicleType: 'Executive',
    preferredChannel: 'Email',
    preferredContactTime: 'Business hours (9 AM-5 PM)',
    budgetRange: '€150K-€300K'
  },
  
  // Contact 3: Anna Ferrari (Marketing Manager - Related Contact)
  {
    id: 103,
    name: 'Anna Ferrari',
    initials: 'AF',
    email: 'anna.ferrari@ferraridealership.com',
    phone: '+390212345681',
    address: 'Via Emilia 123, 40121 Bologna, Italy',
    company: null,
    account_id: 100,
    accountId: 100,
    source: 'Corporate',
    tags: ['Marketing', 'Corporate'],
    createdAt: '2024-02-01T10:00:00',
    lastContact: '2025-03-23T11:00:00',
    interestScore: 80,
    title: 'Ms.',
    salutation: 'Ms.',
    jobTitle: 'Marketing Manager',
    summary: 'Marketing Manager at Ferrari Dealership Group. Involved in brand partnerships and promotional vehicle selections. Prefers WhatsApp for quick updates.',
    preferredVehicleType: 'Luxury',
    preferredChannel: 'WhatsApp',
    preferredContactTime: 'Business hours (10 AM-4 PM)',
    budgetRange: '€100K-€250K'
  },
  
  // Contact 4: Paolo Verdi (Operations Manager - Related Contact)
  {
    id: 104,
    name: 'Paolo Verdi',
    initials: 'PV',
    email: 'paolo.verdi@ferraridealership.com',
    phone: '+390212345682',
    address: 'Via Emilia 123, 40121 Bologna, Italy',
    company: null,
    account_id: 100,
    accountId: 100,
    source: 'Corporate',
    tags: ['Operations', 'Corporate'],
    createdAt: '2024-02-10T10:00:00',
    lastContact: '2025-03-22T15:00:00',
    interestScore: 63,
    title: 'Mr.',
    salutation: 'Mr.',
    jobTitle: 'Operations Manager',
    summary: 'Operations Manager at Ferrari Dealership Group. Handles fleet logistics and vehicle delivery coordination. Prefers phone calls during business hours.',
    preferredVehicleType: 'Fleet',
    preferredChannel: 'Phone',
    preferredContactTime: 'Business hours (8 AM-5 PM)',
    budgetRange: '€50K-€150K'
  },
  
  // Private Account: Private Individual (1:1 relationship)
  {
    id: 200,
    name: 'Dr. Elena Bianchi',
    initials: 'EB',
    email: 'elena.bianchi@example.com',
    phone: '+390212345700',
    address: 'Via Roma 50, 20121 Milano, Italy',
    company: 'Dr. Elena Bianchi', // Private account (1:1)
    source: 'Referral',
    tags: ['VIP', 'Premium', 'Private'],
    createdAt: '2024-03-01T10:00:00',
    lastContact: '2025-03-25T10:00:00',
    interestScore: 88,
    // Account-specific fields
    type: 'Private',
    vat: null, // Private accounts may not have VAT
    vatNumber: null,
    taxCode: 'BNCLNE85H45F205X',
    fiscalCode: 'BNCLNE85H45F205X',
    accountOwner: { id: 6, name: 'Giulia Bianchi', initials: 'GB' },
    owner: { id: 6, name: 'Giulia Bianchi', initials: 'GB' },
    masterContactId: 201, // Same as contact ID for private accounts
    masterContact: { id: 201, name: 'Dr. Elena Bianchi' },
    description: 'Private account for individual customer. High-value client with preference for luxury vehicles.',
    notes: 'VIP customer - prefers email communication. Available evenings after 7 PM.',
    numberOfEmployees: null,
    // Private account vehicles
    vehicles: [
      {
        id: 'private-vehicle-1',
        brand: 'Mercedes-Benz',
        model: 'S-Class',
        year: 2023,
        type: 'owned',
        price: 120000,
        fuelType: 'Hybrid',
        gearType: 'Automatic',
        kilometers: 15000
      }
    ]
  },
  
  // Contact for Private Account (1:1 relationship)
  {
    id: 201,
    name: 'Dr. Elena Bianchi',
    initials: 'EB',
    email: 'elena.bianchi@example.com',
    phone: '+390212345700',
    address: 'Via Roma 50, 20121 Milano, Italy',
    company: null,
    account_id: 200, // Links to private account
    accountId: 200,
    source: 'Referral',
    tags: ['VIP', 'Premium'],
    createdAt: '2024-03-01T10:00:00',
    lastContact: '2025-03-25T10:00:00',
    interestScore: 88,
    title: 'Dr.',
    salutation: 'Dr.',
    jobTitle: 'Medical Professional',
    summary: 'Private customer with high purchasing power. Prefers luxury sedans and SUVs. Best reached via email, available evenings after 7 PM.',
    preferredVehicleType: 'Luxury Sedan',
    preferredChannel: 'Email',
    preferredContactTime: 'Evenings (after 7 PM)',
    budgetRange: '€100K+'
  },
  
  // Another Company Account: Tech Solutions GmbH
  {
    id: 300,
    name: 'Tech Solutions GmbH',
    initials: 'TSG',
    email: 'info@techsolutions.de',
    phone: '+4903012345678',
    address: 'Unter den Linden 50, 10117 Berlin, Germany',
    company: 'Tech Solutions GmbH',
    source: 'Corporate',
    tags: ['Corporate', 'Fleet'],
    createdAt: '2024-05-10T10:00:00',
    lastContact: '2025-03-24T16:00:00',
    interestScore: 81,
    type: 'Company',
    vat: 'DE123456789',
    vatNumber: 'DE123456789',
    taxCode: 'TSGMBH85M01H501X',
    fiscalCode: 'TSGMBH85M01H501X',
    accountOwner: { id: 3, name: 'David Miller', initials: 'DM' },
    owner: { id: 3, name: 'David Miller', initials: 'DM' },
    masterContactId: 301,
    masterContact: { id: 301, name: 'Thomas Schneider' },
    description: 'Technology consulting firm requiring executive fleet vehicles for client meetings and business travel.',
    notes: 'Fleet buyer - requires detailed proposals with TCO analysis. Decision involves procurement department.',
    numberOfEmployees: 75,
    vehicles: [
      {
        id: 'account-vehicle-3',
        brand: 'BMW',
        model: '5 Series',
        year: 2024,
        type: 'owned',
        price: 65000,
        fuelType: 'Hybrid',
        gearType: 'Automatic',
        kilometers: 0
      },
      {
        id: 'account-vehicle-4',
        brand: 'Audi',
        model: 'A6',
        year: 2024,
        type: 'owned',
        price: 68000,
        fuelType: 'Petrol',
        gearType: 'Automatic',
        kilometers: 0
      }
    ]
  },
  
  // Contact: Thomas Schneider (Master Contact for Tech Solutions)
  {
    id: 301,
    name: 'Thomas Schneider',
    initials: 'TS',
    email: 'thomas.schneider@techsolutions.de',
    phone: '+4903012345679',
    address: 'Unter den Linden 50, 10117 Berlin, Germany',
    company: null,
    account_id: 300,
    accountId: 300,
    source: 'Corporate',
    tags: ['Master Contact', 'Corporate'],
    createdAt: '2024-05-10T10:00:00',
    lastContact: '2025-03-24T16:00:00',
    interestScore: 85,
    title: 'Mr.',
    salutation: 'Mr.',
    jobTitle: 'CEO',
    summary: 'CEO and master contact for Tech Solutions GmbH. Primary decision-maker for fleet purchases. Prefers email for documentation and phone for urgent matters.',
    preferredVehicleType: 'Executive Sedan',
    preferredChannel: 'Email',
    preferredContactTime: 'Business hours (9 AM-6 PM)',
    budgetRange: '€50K-€80K per vehicle'
  },
  
  // Contact: Maria Weber (HR Manager - Related Contact)
  {
    id: 302,
    name: 'Maria Weber',
    initials: 'MW',
    email: 'maria.weber@techsolutions.de',
    phone: '+4903012345680',
    address: 'Unter den Linden 50, 10117 Berlin, Germany',
    company: null,
    account_id: 300,
    accountId: 300,
    source: 'Corporate',
    tags: ['HR', 'Corporate'],
    createdAt: '2024-05-15T10:00:00',
    lastContact: '2025-03-23T14:00:00',
    interestScore: 72,
    title: 'Ms.',
    salutation: 'Ms.',
    jobTitle: 'HR Manager',
    summary: 'HR Manager at Tech Solutions GmbH. Involved in employee vehicle benefit programs. Prefers email communication.',
    preferredVehicleType: 'Fleet',
    preferredChannel: 'Email',
    preferredContactTime: 'Business hours (10 AM-4 PM)',
    budgetRange: '€30K-€50K per vehicle'
  }
]

