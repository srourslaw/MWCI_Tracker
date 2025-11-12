import { kpiService } from '../services/kpiService'
import { initialKPIs } from '../data/initialKPIs'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { logger } from './logger'

export async function importInitialKPIs(userId: string): Promise<{ success: number; failed: number; errors: string[]; skipped: number }> {
  let success = 0
  let failed = 0
  let skipped = 0
  const errors: string[] = []

  logger.log(`Starting import of ${initialKPIs.length} KPIs...`)

  // First, get all existing KPIs to check for duplicates
  const existingKPIsSnapshot = await getDocs(collection(db, 'kpis'))
  const existingKPIs = existingKPIsSnapshot.docs.map(doc => ({
    name: doc.data().name,
    category: doc.data().category
  }))

  for (const kpi of initialKPIs) {
    try {
      // Check if KPI already exists (by name and category)
      const exists = existingKPIs.some(
        existing => existing.name === kpi.name && existing.category === kpi.category
      )

      if (exists) {
        skipped++
        logger.log(`⊘ Skipped (already exists): ${kpi.name}`)
        continue
      }

      await kpiService.createKPI(userId, kpi)
      success++
      logger.log(`✓ Imported: ${kpi.name}`)
    } catch (error) {
      failed++
      const errorMessage = `Failed to import ${kpi.name}: ${error}`
      errors.push(errorMessage)
      logger.error(`✗ ${errorMessage}`)
    }
  }

  logger.log(`\nImport complete: ${success} successful, ${skipped} skipped, ${failed} failed`)

  return { success, failed, errors, skipped }
}
