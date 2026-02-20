/**
 * Script to translate mock data files
 * 
 * This script applies translations to the locale-specific mock data files.
 * Run this in Node.js to translate all text fields in the data files.
 * 
 * Usage: node src/api/mockData/locales/translateData.js
 */

import { readFileSync, writeFileSync } from 'fs'
import { translateObject } from './translations.js'

const locales = ['it', 'de', 'fr', 'nl']
// leads, customers, opportunities, activities now re-export from en (single source per type)
const files = []

function translateFile(locale, fileName) {
  const filePath = `src/api/mockData/locales/${locale}/${fileName}.js`
  const enFilePath = `src/api/mockData/locales/en/${fileName}.js`
  
  try {
    // Read English version
    const enContent = readFileSync(enFilePath, 'utf8')
    
    // Extract the data array
    const exportMatch = enContent.match(/export const mock\w+ = (\[[\s\S]*\]);?$/)
    if (!exportMatch) {
      console.error(`Could not parse ${enFilePath}`)
      return
    }
    
    // Evaluate the data (in a real scenario, we'd use a proper parser)
    const dataString = exportMatch[1]
    let data
    try {
      // Use eval in a controlled way (only for mock data)
      data = eval(`(${dataString})`)
    } catch (e) {
      console.error(`Error parsing data from ${enFilePath}:`, e.message)
      return
    }
    
    // Translate the data
    const translated = translateObject(data, locale)
    
    // Reconstruct the file
    const exportName = `mock${fileName.charAt(0).toUpperCase() + fileName.slice(1)}`
    const newContent = `export const ${exportName} = ${JSON.stringify(translated, null, 2)}\n`
    
    // Write translated file
    writeFileSync(filePath, newContent, 'utf8')

  } catch (error) {
    console.error(`Error translating ${filePath}:`, error.message)
  }
}

// Translate all files for all locales
for (const locale of locales) {
  for (const file of files) {
    translateFile(locale, file)
  }
}


