import { ref } from 'vue'

const classifyIntent = (question, teamMembers) => {
  const lowerQuestion = question.toLowerCase().trim()
  const bestPerformersPatterns = [
    /who'?s?\s+(?:performing|doing)\s+best/i,
    /who\s+(?:are|is)\s+(?:the\s+)?(?:best|top)\s+performers?/i,
    /(?:best|top)\s+performers?/i,
    /who'?s?\s+(?:leading|winning|number\s+one|in\s+first\s+place)/i,
    /top\s+\d+/i,
    /best\s+salesperson/i,
    /who\s+should\s+i\s+recognize/i,
  ]
  const metricPatterns = {
    leads: /(?:most|best|top|highest|least|fewest|lowest).*leads?|lead\s+generator|who\s+has\s+the\s+(?:most|least)\s+leads?|who'?s?\s+handling\s+(?:the\s+)?(?:most|least)\s+leads?/i,
    contracts: /(?:most|best|top|highest|least|fewest|lowest).*contracts?|(?:most|best|top|least).*deals?\s+closed|best\s+closer|who\s+closed\s+the\s+(?:most|least)/i,
    opportunities: /(?:most|best|top|highest|least|fewest|lowest).*opportunit|who\s+has\s+the\s+(?:most|least)\s+opportunit/i,
    conversionRate: /(?:best|top|highest|worst|lowest).*conversion|conversion\s+rate/i,
    qualifiedLeads: /(?:most|best|top|highest|least|fewest|lowest).*qualified/i,
  }
  const isLeast = /least|fewest|lowest|worst/i.test(question)
  const teamMemberSpecificPatterns = [
    /how\s+many\s+(?:leads?|opportunities?|contracts?|qualified\s+leads?)\s+does\s+/i,
    /how\s+many\s+(?:leads?|opportunities?|contracts?|qualified\s+leads?)\s+has\s+/i,
    /(?:leads?|opportunities?|contracts?|qualified\s+leads?)\s+(?:does|has)\s+/i,
    /'?s\s+(?:leads?|opportunities?|contracts?|qualified\s+leads?)/i,
  ]
  for (const pattern of teamMemberSpecificPatterns) {
    if (pattern.test(question)) {
      const foundNames = extractTeamMemberNames(question, teamMembers)
      if (foundNames.length > 0) return { intent: 'team_member_specific' }
    }
  }
  for (const pattern of bestPerformersPatterns) {
    if (pattern.test(question)) {
      const countMatch = question.match(/top\s+(\d+)|best\s+(\d+)/i)
      const count = countMatch ? parseInt(countMatch[1] || countMatch[2] || '3', 10) : undefined
      for (const [metric, metricPattern] of Object.entries(metricPatterns)) {
        if (metricPattern.test(question)) return { intent: 'best_performers_by_metric', metric, count, isLeast }
      }
      return { intent: 'best_performers_general', count }
    }
  }
  for (const [metric, pattern] of Object.entries(metricPatterns)) {
    if (pattern.test(question) && (question.includes('who') || question.includes('top') || question.includes('best') || question.includes('least') || question.includes('most'))) {
      const countMatch = question.match(/top\s+(\d+)|best\s+(\d+)/i)
      const count = countMatch ? parseInt(countMatch[1] || countMatch[2] || '3', 10) : undefined
      return { intent: 'best_performers_by_metric', metric, count, isLeast }
    }
  }
  if (lowerQuestion.includes('compare') || lowerQuestion.includes('better')) return { intent: 'metric_comparison' }
  if (lowerQuestion.includes('help') || lowerQuestion.includes('what can') || lowerQuestion.includes('what do')) return { intent: 'help' }
  if (lowerQuestion.includes('pipeline') || lowerQuestion.includes('stage')) return { intent: 'pipeline_inquiry' }
  if (lowerQuestion.includes('source') || lowerQuestion.includes('campaign') || lowerQuestion.includes('facebook') || lowerQuestion.includes('volvo')) return { intent: 'lead_source_inquiry' }
  const areaPerformancePatterns = [/area\s+performance/i, /region/i, /leads?\s+per\s+area/i, /contracts?\s+per\s+area/i, /which\s+area/i, /best\s+area/i, /top\s+area/i, /worst\s+area/i, /area\s+with\s+(?:most|least)/i]
  for (const p of areaPerformancePatterns) { if (p.test(question)) return { intent: 'area_performance_inquiry' } }
  const modelsSoldPatterns = [/models?\s+sold/i, /which\s+model/i, /best\s+selling/i, /top\s+model/i, /most\s+sold/i, /volvo\s+model/i, /units?\s+sold/i]
  for (const p of modelsSoldPatterns) { if (p.test(question)) return { intent: 'models_sold_inquiry' } }
  if (lowerQuestion.includes('deal') || lowerQuestion.includes('lead') || lowerQuestion.includes('opportunit') || lowerQuestion.includes('negotiation')) return { intent: 'kpi_inquiry' }
  return { intent: 'unknown' }
}

const extractTeamMemberNames = (question, teamMembers) => {
  const lowerQuestion = question.toLowerCase()
  const foundNames = []
  for (const member of teamMembers) {
    const memberNameLower = member.name.toLowerCase()
    const nameParts = memberNameLower.split(' ')
    if (lowerQuestion.includes(memberNameLower)) foundNames.push(member.name)
    else {
      for (const part of nameParts) {
        if (part.length > 2 && lowerQuestion.includes(part)) { foundNames.push(member.name); break }
      }
    }
  }
  return foundNames
}

const sortTeamByMetric = (team, metric, ascending = false) => {
  return [...team].sort((a, b) => {
    const aVal = a[metric]
    const bVal = b[metric]
    return ascending ? aVal - bVal : bVal - aVal
  })
}

const formatTeamMemberStats = (member, rank, total) => {
  const ordinal = rank === 1 ? '1st' : rank === 2 ? '2nd' : rank === 3 ? '3rd' : `${rank}th`
  const percentile = Math.round(((total - rank + 1) / total) * 100)
  return `${ordinal} ${member.name} (${member.conversionRate}% conversion rate, ranked ${rank} of ${total}, top ${percentile}%)\n   - ${member.leads} leads, ${member.qualifiedLeads} qualified (${member.qualifiedPercentage}%), ${member.opportunities} opportunities, ${member.contracts} contracts`
}

const generateBestPerformersResponse = (data, metric, count = 3) => {
  if (data.teamPerformance.length === 0) return "I don't have team performance data available at the moment."
  const sortedTeam = metric ? sortTeamByMetric(data.teamPerformance, metric) : [...data.teamPerformance].sort((a, b) => b.conversionRate - a.conversionRate)
  const topPerformers = sortedTeam.slice(0, Math.min(count, sortedTeam.length))
  const totalMembers = data.teamPerformance.length
  if (topPerformers.length === 0) return "I couldn't find any team performance data to display."
  const metricLabel = metric ? (metric === 'leads' ? 'leads' : metric === 'contracts' ? 'contracts closed' : metric === 'opportunities' ? 'opportunities' : metric === 'qualifiedLeads' ? 'qualified leads' : 'conversion rate') : 'conversion rate'
  const introText = metric ? `Here are your top ${topPerformers.length} performer${topPerformers.length > 1 ? 's' : ''} by ${metricLabel}:\n\n` : `Based on conversion rates, your top ${topPerformers.length} performer${topPerformers.length > 1 ? 's are' : ' is'}:\n\n`
  const performerList = topPerformers.map((member) => {
    const sortedByMetric = metric ? sortTeamByMetric(data.teamPerformance, metric) : sortedTeam
    const actualRank = sortedByMetric.findIndex((m) => m.name === member.name) + 1
    return formatTeamMemberStats(member, actualRank, totalMembers)
  }).join('\n\n')
  const topMember = topPerformers[0]
  const contextText = topPerformers.length === 1 ? `\n\n${topMember.name} is leading the team with ${metricLabel === 'conversion rate' ? `a ${topMember.conversionRate}%` : topMember[metric]} ${metricLabel} (ranked 1st out of ${totalMembers} team members).` : `\n\nThese team members are consistently performing at the top of the team, representing the top ${Math.round((topPerformers.length / totalMembers) * 100)}% of performers out of ${totalMembers} total members.`
  return introText + performerList + contextText
}

const generateMetricSpecificResponse = (data, metric, count = 3, isLeast = false) => {
  const sortedTeam = sortTeamByMetric(data.teamPerformance, metric, isLeast)
  const topPerformers = sortedTeam.slice(0, Math.min(count, sortedTeam.length))
  if (topPerformers.length === 0) return "I couldn't find team performance data for that metric."
  const metricLabels = { leads: 'leads', contracts: 'contracts', opportunities: 'opportunities', conversionRate: 'conversion rate', qualifiedLeads: 'qualified leads' }
  const metricLabel = metricLabels[metric]
  const totalMembers = data.teamPerformance.length
  const rankLabel = isLeast ? 'lowest' : 'highest'
  let response = `Here are the ${isLeast ? 'bottom' : 'top'} ${topPerformers.length} performer${topPerformers.length > 1 ? 's' : ''} by ${metricLabel}:\n\n`
  response += topPerformers.map((member, index) => {
    const rank = isLeast ? totalMembers - index : index + 1
    return formatTeamMemberStats(member, rank, totalMembers)
  }).join('\n\n')
  response += `\n\n${topPerformers[0].name} has the ${rankLabel} with ${topPerformers[0][metric]} ${metricLabel}${metric === 'conversionRate' ? '%' : ''}.`
  return response
}

const generateTeamMemberSpecificResponse = (question, data) => {
  const lowerQuestion = question.toLowerCase()
  const memberNames = extractTeamMemberNames(question, data.teamPerformance)
  if (memberNames.length === 0) return "I couldn't find that team member. Please check the name and try again."
  const member = data.teamPerformance.find((m) => m.name === memberNames[0])
  if (!member) return "I couldn't find that team member in the data."
  const metricMap = { leads: { key: 'leads', label: 'leads', value: member.leads }, lead: { key: 'leads', label: 'leads', value: member.leads }, opportunities: { key: 'opportunities', label: 'opportunities', value: member.opportunities }, opportunity: { key: 'opportunities', label: 'opportunities', value: member.opportunities }, contracts: { key: 'contracts', label: 'contracts', value: member.contracts }, contract: { key: 'contracts', label: 'contracts', value: member.contracts }, qualified: { key: 'qualifiedLeads', label: 'qualified leads', value: member.qualifiedLeads } }
  let foundMetric = null
  for (const [key, metric] of Object.entries(metricMap)) {
    if (lowerQuestion.includes(key)) { foundMetric = metric; break }
  }
  if (!foundMetric) return `${member.name} has:\n\n• ${member.leads} leads\n• ${member.qualifiedLeads} qualified leads (${member.qualifiedPercentage}%)\n• ${member.opportunities} opportunities\n• ${member.contracts} contracts\n• ${member.conversionRate}% conversion rate`
  const validMetrics = ['leads', 'contracts', 'opportunities', 'conversionRate', 'qualifiedLeads']
  const canRank = validMetrics.includes(foundMetric.key)
  if (canRank) {
    const sortedTeam = sortTeamByMetric(data.teamPerformance, foundMetric.key)
    const rank = sortedTeam.findIndex((m) => m.name === member.name) + 1
    const totalMembers = data.teamPerformance.length
    const percentile = Math.round(((totalMembers - rank + 1) / totalMembers) * 100)
    const ord = rank === 1 ? 'st' : rank === 2 ? 'nd' : rank === 3 ? 'rd' : 'th'
    return `${member.name} has ${foundMetric.value} ${foundMetric.label} (ranked ${rank}${ord} out of ${totalMembers}, top ${percentile}%).\n\nFull stats:\n• ${member.leads} leads\n• ${member.qualifiedLeads} qualified leads (${member.qualifiedPercentage}%)\n• ${member.opportunities} opportunities\n• ${member.contracts} contracts\n• ${member.conversionRate}% conversion rate`
  }
  return `${member.name} has ${foundMetric.value} ${foundMetric.label}.\n\nFull stats:\n• ${member.leads} leads\n• ${member.qualifiedLeads} qualified leads (${member.qualifiedPercentage}%)\n• ${member.opportunities} opportunities\n• ${member.contracts} contracts\n• ${member.conversionRate}% conversion rate`
}

const generateComparisonResponse = (question, data) => {
  const memberNames = extractTeamMemberNames(question, data.teamPerformance)
  if (memberNames.length < 2) return "I need at least two team member names to make a comparison. Please mention both names in your question."
  const members = memberNames.map((name) => data.teamPerformance.find((m) => m.name === name)).filter(Boolean)
  if (members.length < 2) return "I couldn't find both team members in the data. Please check the names and try again."
  const [member1, member2] = members
  if (!member1 || !member2) return "I couldn't retrieve the comparison data."
  let response = `Comparing ${member1.name} and ${member2.name}:\n\n`
  const metrics = [
    { key: 'leads', label: 'Leads', format: (v) => v.toString() },
    { key: 'qualifiedLeads', label: 'Qualified Leads', format: (v) => v.toString() },
    { key: 'opportunities', label: 'Opportunities', format: (v) => v.toString() },
    { key: 'contracts', label: 'Contracts', format: (v) => v.toString() },
    { key: 'conversionRate', label: 'Conversion Rate', format: (v) => `${v}%` },
  ]
  for (const { key, label, format } of metrics) {
    const val1 = member1[key]
    const val2 = member2[key]
    const winner = val1 > val2 ? member1.name : val2 > val1 ? member2.name : 'Tie'
    response += `${label}: ${member1.name} (${format(val1)}) vs ${member2.name} (${format(val2)}) - ${winner === 'Tie' ? 'Tie' : `${winner} leads`}\n`
  }
  const overallWinner = member1.conversionRate > member2.conversionRate ? member1.name : member2.conversionRate > member1.conversionRate ? member2.name : 'Tie'
  response += `\nOverall: ${overallWinner === 'Tie' ? 'Both are performing equally well' : `${overallWinner} has a higher conversion rate`}.`
  return response
}

const generateResponse = (question, data) => {
  const lowerQuestion = question.toLowerCase().trim()
  const greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening']
  const isGreeting = greetings.some((g) => lowerQuestion === g || lowerQuestion.startsWith(g + ' '))
  if (isGreeting && !lowerQuestion.includes('deal') && !lowerQuestion.includes('opportunit') && !lowerQuestion.includes('lead')) {
    return "Hello! I'm here to help you understand your sales dashboard. You can ask me about deals, opportunities, team performance, conversion rates, or any other metrics you'd like to know about."
  }
  if ((lowerQuestion.includes('deal') || lowerQuestion.includes('deals')) && (lowerQuestion.includes('close') || lowerQuestion.includes('closed') || lowerQuestion.includes('closing'))) {
    const dealsKpi = data.kpis.find((kpi) => {
      const title = kpi.title.toLowerCase()
      return title.includes('deal') && title.includes('close')
    })
    if (dealsKpi) {
      const trend = dealsKpi.changeType === 'increase' ? 'up' : 'down'
      const responses = [
        `You closed ${dealsKpi.value} deals this month. That's ${Math.abs(dealsKpi.change)}% ${trend} compared to last month - ${trend === 'up' ? 'great progress!' : 'something to keep an eye on.'}`,
        `This month, ${dealsKpi.value} deals were successfully closed. That represents a ${Math.abs(dealsKpi.change)}% ${trend} from last month. ${trend === 'up' ? 'Excellent work!' : 'Consider reviewing your closing strategies.'}`,
        `Your team closed ${dealsKpi.value} deals this month, which is ${Math.abs(dealsKpi.change)}% ${trend} compared to the previous month. ${trend === 'up' ? 'Keep up the momentum!' : 'There might be room for improvement.'}`,
      ]
      return responses[Math.floor(Math.random() * responses.length)]
    }
  }
  if (lowerQuestion.includes('opportunit') || lowerQuestion.includes('opportunities')) {
    const oppsKpi = data.kpis.find((kpi) => kpi.title.toLowerCase().includes('opportunit'))
    if (oppsKpi) {
      const trend = oppsKpi.changeType === 'increase' ? 'up' : 'down'
      const isToday = lowerQuestion.includes('today')
      const responses = [
        `You have ${oppsKpi.value} new opportunities${isToday ? ' today' : ' this period'}. That represents a ${Math.abs(oppsKpi.change)}% ${trend} from last month. ${trend === 'up' ? 'Excellent momentum!' : 'Consider reviewing your lead generation strategies.'}`,
        `${isToday ? 'Today brought' : 'You have'} ${oppsKpi.value} new opportunities${isToday ? '' : ' this period'} to your pipeline. This is ${Math.abs(oppsKpi.change)}% ${trend} compared to last month. ${trend === 'up' ? 'Great to see this growth!' : 'It might be worth investigating what changed.'}`,
      ]
      return responses[Math.floor(Math.random() * responses.length)]
    }
  }
  if (lowerQuestion.includes('lead') || lowerQuestion.includes('leads')) {
    const leadsKpi = data.kpis.find((kpi) => kpi.title.toLowerCase().includes('lead'))
    if (leadsKpi) {
      const trend = leadsKpi.changeType === 'increase' ? 'up' : 'down'
      const isToday = lowerQuestion.includes('today')
      return `You received ${leadsKpi.value} new leads${isToday ? ' today' : ''}. That's ${Math.abs(leadsKpi.change)}% ${trend} compared to last month.`
    }
  }
  if (lowerQuestion.includes('negotiation') || lowerQuestion.includes('negotiating')) {
    const negotKpi = data.kpis.find((kpi) => kpi.title.toLowerCase().includes('negotiation'))
    if (negotKpi) {
      const trend = negotKpi.changeType === 'increase' ? 'up' : 'down'
      return `You currently have ${negotKpi.value} deals in negotiation this month, which is ${Math.abs(negotKpi.change)}% ${trend} from last month.`
    }
  }
  const { intent, metric, count, isLeast } = classifyIntent(question, data.teamPerformance || [])
  if (intent === 'best_performers_general') return generateBestPerformersResponse(data, undefined, count || 3)
  if (intent === 'best_performers_by_metric' && metric) return generateMetricSpecificResponse(data, metric, count || 3, isLeast || false)
  if (intent === 'team_member_specific') return generateTeamMemberSpecificResponse(question, data)
  if (intent === 'metric_comparison') return generateComparisonResponse(question, data)
  if (intent === 'help') {
    return "I can help you understand your sales dashboard! You can ask me about:\n\n• Deals closed this month\n• New opportunities or leads today\n• Team performance and top performers\n• Who's performing best? / Top performers\n• Who has the most/least leads/contracts/opportunities?\n• Who's handling the most/least leads?\n• How many leads/opportunities/contracts does [name] have?\n• Compare team members (e.g., 'Compare John and Jane')\n• Conversion rates for different campaigns (Facebook, Volvocars, etc.)\n• How a specific source is performing\n• What's the best performing source\n• How long it takes to qualify/contact/negotiate\n• Sales pipeline stages and timing\n• Area performance (e.g., 'Which area has the most leads?', 'Best performing area')\n• Models sold (e.g., 'Best selling model', 'How many XC60 sold?')\n• Any other metrics on your dashboard\n\nJust ask me a question in natural language!"
  }
  if (lowerQuestion.includes('conversion rate') || lowerQuestion.includes('conversion')) {
    if (lowerQuestion.includes('facebook')) {
      const facebook = data.leadSources?.find((s) => s.name.toLowerCase().includes('facebook'))
      if (facebook) return `Facebook campaigns have a ${facebook.conversionRate}% conversion rate from lead to won deals. Out of ${facebook.totalLeads} total leads, ${facebook.wonDeals} deals were closed. The campaign shows strong performance in the pipeline.`
    } else if (lowerQuestion.includes('volvo') || lowerQuestion.includes('volvocars')) {
      const volvo = data.leadSources?.find((s) => s.name.toLowerCase().includes('volvo'))
      if (volvo) return `Volvocars.com has a ${volvo.conversionRate}% conversion rate. With ${volvo.totalLeads} total leads, ${volvo.wonDeals} deals were successfully closed.`
    } else if (lowerQuestion.includes('campaign') || lowerQuestion.includes('winter')) {
      const campaign = data.leadSources?.find((s) => s.name.toLowerCase().includes('winter') || s.name.toLowerCase().includes('campaign'))
      if (campaign) return `The ${campaign.name} has a ${campaign.conversionRate}% conversion rate. It generated ${campaign.totalLeads} leads and closed ${campaign.wonDeals} deals.`
    } else if (data.leadSources?.length) {
      const avgConversion = data.leadSources.reduce((sum, s) => sum + s.conversionRate, 0) / data.leadSources.length
      return `The average conversion rate across all lead sources is ${avgConversion.toFixed(1)}%. Here's the breakdown:\n\n${data.leadSources.map((s) => `• ${s.name}: ${s.conversionRate}%`).join('\n')}`
    }
  }
  if (intent === 'lead_source_inquiry' && data.leadSources?.length) {
    if ((lowerQuestion.includes('how is') || lowerQuestion.includes("how's") || lowerQuestion.includes('performance')) && (lowerQuestion.includes('source') || lowerQuestion.includes('campaign') || lowerQuestion.includes('facebook') || lowerQuestion.includes('volvo'))) {
      for (const source of data.leadSources) {
        const sourceName = source.name.toLowerCase()
        const questionHasSource = lowerQuestion.includes(sourceName) || (lowerQuestion.includes('facebook') && sourceName.includes('facebook')) || (lowerQuestion.includes('volvo') && sourceName.includes('volvo')) || (lowerQuestion.includes('winter') && sourceName.includes('winter'))
        if (questionHasSource) {
          const responses = [
            `${source.name} is performing well with a ${source.conversionRate}% conversion rate. It generated ${source.totalLeads} total leads and closed ${source.wonDeals} deals. The pipeline shows strong performance through qualification and won stages.`,
            `${source.name} has a ${source.conversionRate}% conversion rate with ${source.totalLeads} total leads and ${source.wonDeals} closed deals.`,
          ]
          return responses[Math.floor(Math.random() * responses.length)]
        }
      }
    }
    if ((lowerQuestion.includes('best') || lowerQuestion.includes('top')) && (lowerQuestion.includes('source') || lowerQuestion.includes('campaign') || lowerQuestion.includes('performing source'))) {
      const sortedSources = [...data.leadSources].sort((a, b) => b.conversionRate - a.conversionRate)
      const bestSource = sortedSources[0]
      if (bestSource) {
        const responses = [
          `The best performing source is ${bestSource.name} with a ${bestSource.conversionRate}% conversion rate. It generated ${bestSource.totalLeads} leads and closed ${bestSource.wonDeals} deals.`,
          `${bestSource.name} is your top performing source at ${bestSource.conversionRate}% conversion rate, with ${bestSource.totalLeads} total leads and ${bestSource.wonDeals} successful deals.`,
        ]
        return responses[Math.floor(Math.random() * responses.length)]
      }
    }
  }
  const pipeline = data.pipeline || []
  if ((lowerQuestion.includes('how long') || lowerQuestion.includes('time to') || lowerQuestion.includes('takes to')) && (lowerQuestion.includes('qualif') || lowerQuestion.includes('qualify'))) {
    const qualStage = pipeline.find((p) => p.name.toLowerCase().includes('qualif'))
    if (qualStage?.avgTime) return `It takes ${qualStage.avgTime} to qualify leads on average. The qualification stage has a ${qualStage.percentage}% conversion rate, meaning ${qualStage.percentage}% of leads that reach this stage successfully get qualified.`
  }
  if ((lowerQuestion.includes('how long') || lowerQuestion.includes('time to') || lowerQuestion.includes('takes to')) && (lowerQuestion.includes('contact') || lowerQuestion.includes('reach'))) {
    const contactStage = pipeline.find((p) => p.name.toLowerCase().includes('contact'))
    if (contactStage?.avgTime) return `It takes ${contactStage.avgTime} to contact leads on average. The contacted stage shows a ${contactStage.percentage}% conversion rate.`
  }
  if ((lowerQuestion.includes('how long') || lowerQuestion.includes('time to') || lowerQuestion.includes('takes to')) && (lowerQuestion.includes('negotiat') || lowerQuestion.includes('close'))) {
    const negotStage = pipeline.find((p) => p.name.toLowerCase().includes('negotiat'))
    if (negotStage?.avgTime) return `It takes ${negotStage.avgTime} to complete negotiations on average. The negotiation stage has a ${negotStage.percentage}% conversion rate.`
  }
  if (intent === 'pipeline_inquiry') {
    const stages = pipeline.filter((p) => p.percentage !== undefined)
    if (stages.length > 0) {
      const stageInfo = stages.map((s) => `• ${s.name}: ${s.percentage}% conversion${s.avgTime ? ` (${s.avgTime})` : ''}`).join('\n')
      return `Here's your sales pipeline breakdown:\n\n${stageInfo}\n\nThe pipeline shows how leads progress through each stage, with conversion rates at each step.`
    }
  }
  if (lowerQuestion.includes('team') || lowerQuestion.includes('member')) {
    if (!lowerQuestion.includes('best') && !lowerQuestion.includes('top') && !lowerQuestion.includes('perform') && data.teamPerformance?.length > 0) {
      const totalLeads = data.teamPerformance.reduce((sum, t) => sum + t.leads, 0)
      const totalContracts = data.teamPerformance.reduce((sum, t) => sum + t.contracts, 0)
      const avgConversion = totalLeads ? (totalContracts / totalLeads) * 100 : 0
      return `Your team has ${data.teamPerformance.length} members actively working on leads. Together, they've generated ${totalLeads} leads and closed ${totalContracts} contracts, with an average conversion rate of ${avgConversion.toFixed(1)}%.`
    }
  }
  if (lowerQuestion.includes('deal') || lowerQuestion.includes('deals')) {
    const dealsKpi = data.kpis?.find((kpi) => kpi.title.toLowerCase().includes('deal') && kpi.title.toLowerCase().includes('close'))
    if (dealsKpi) {
      const trend = dealsKpi.changeType === 'increase' ? 'up' : 'down'
      return `You closed ${dealsKpi.value} deals this month. That's ${Math.abs(dealsKpi.change)}% ${trend} compared to last month.`
    }
  }
  if (lowerQuestion.includes('opportunit')) {
    const oppsKpi = data.kpis?.find((kpi) => kpi.title.toLowerCase().includes('opportunit'))
    if (oppsKpi) {
      const trend = oppsKpi.changeType === 'increase' ? 'up' : 'down'
      return `You have ${oppsKpi.value} new opportunities today. That's ${Math.abs(oppsKpi.change)}% ${trend} from last month.`
    }
  }
  if (lowerQuestion.includes('lead')) {
    const leadsKpi = data.kpis?.find((kpi) => kpi.title.toLowerCase().includes('lead'))
    if (leadsKpi) {
      const trend = leadsKpi.changeType === 'increase' ? 'up' : 'down'
      return `You received ${leadsKpi.value} new leads today. That's ${Math.abs(leadsKpi.change)}% ${trend} compared to last month.`
    }
  }
  if (intent === 'unknown') {
    const bestPerformersVariations = [/best\s+performer/i, /top\s+performer/i, /who'?s?\s+best/i, /who'?s?\s+top/i, /best\s+one/i, /top\s+one/i, /number\s+one/i, /first\s+place/i, /leading/i, /winning/i]
    for (const pattern of bestPerformersVariations) {
      if (pattern.test(question)) return generateBestPerformersResponse(data, undefined, 3)
    }
    const metricQuestions = [
      { pattern: /(?:most|least)\s+leads?/i, metric: 'leads' },
      { pattern: /(?:most|least)\s+contracts?/i, metric: 'contracts' },
      { pattern: /(?:most|least)\s+opportunities?/i, metric: 'opportunities' },
      { pattern: /(?:most|least)\s+qualified/i, metric: 'qualifiedLeads' },
      { pattern: /(?:best|worst)\s+conversion/i, metric: 'conversionRate' },
      { pattern: /who'?s?\s+handling\s+(?:the\s+)?(?:most|least)\s+leads?/i, metric: 'leads' },
    ]
    for (const { pattern, metric } of metricQuestions) {
      if (pattern.test(question) && (question.includes('who') || question.includes('top') || question.includes('best') || question.includes('least') || question.includes('most'))) {
        const isLeastQuestion = /least|fewest|lowest|worst/i.test(question)
        return generateMetricSpecificResponse(data, metric, 3, isLeastQuestion)
      }
    }
    const teamMemberQuestions = [/how\s+many\s+(?:leads?|opportunities?|contracts?)\s+(?:does|has)/i, /(?:leads?|opportunities?|contracts?)\s+(?:does|has)\s+/i]
    for (const pattern of teamMemberQuestions) {
      if (pattern.test(question)) return generateTeamMemberSpecificResponse(question, data)
    }
  }
  const randomResponses = [
    "I'd be happy to help! Could you rephrase your question? For example, you could ask about deals closed, opportunities, team performance, or conversion rates. You can also ask 'Who's performing best?' or 'Who has the most leads?'",
    "Let me help you find that information. Try asking about specific metrics like 'How many deals were closed?' or 'Who are the top performers?' or 'Who has the most contracts?'",
    "I can help you understand your dashboard data. Try asking about deals, opportunities, team members, or conversion rates for specific campaigns. You can also ask 'Who's performing best?' to see top performers.",
  ]
  return randomResponses[Math.floor(Math.random() * randomResponses.length)]
}

const simulateThinkingDelay = () => new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 1000))
const simulateTypingDelay = () => new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 1200))

export function useAIAssistant(getDashboardData) {
  const messages = ref([])
  const isThinking = ref(false)
  const isTyping = ref(false)
  const error = ref(null)

  const sendMessage = async (userMessage) => {
    error.value = null
    isThinking.value = true
    isTyping.value = false
    try {
      await simulateThinkingDelay()
      isThinking.value = false
      isTyping.value = true
      await simulateTypingDelay()
      const data = typeof getDashboardData === 'function' ? getDashboardData() : (getDashboardData?.value ?? {})
      return generateResponse(userMessage, data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while processing your request. Please try again.'
      throw new Error(errorMessage)
    } finally {
      isThinking.value = false
      isTyping.value = false
    }
  }

  const addMessage = (role, content) => {
    messages.value.push({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      role,
      content,
      timestamp: new Date(),
    })
  }

  const clearMessages = () => { messages.value = [] }

  return {
    messages,
    isThinking,
    isTyping,
    error,
    sendMessage,
    addMessage,
    clearMessages,
  }
}
