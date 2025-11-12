import { deliverableService } from '../services/deliverableService'
import { createEmptyDeliverableInput } from '../types/deliverable'
import { initialKPIs } from '../data/initialKPIs'
import { logger } from './logger'

export interface ImportResult {
  success: number
  failed: number
  skipped: number
  errors: string[]
}

/**
 * Import initial deliverables from KPI data
 * Each KPI becomes a deliverable with empty workflow stages
 */
export async function importInitialDeliverables(userId: string): Promise<ImportResult> {
  const result: ImportResult = {
    success: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  }

  logger.log(`Starting import of ${initialKPIs.length} deliverables...`)

  for (let i = 0; i < initialKPIs.length; i++) {
    const kpi = initialKPIs[i]

    try {
      logger.log(`[${i + 1}/${initialKPIs.length}] Importing: ${kpi.name}`)

      // Create empty deliverable from KPI data
      const deliverableInput = createEmptyDeliverableInput(kpi.name, kpi.category)

      // Set initial phase based on dev status
      if (kpi.devStatus === 'Completed') {
        deliverableInput.phase = 'SIT'
      } else if (kpi.devStatus === 'In Progress') {
        deliverableInput.phase = 'Development'
      } else {
        deliverableInput.phase = 'BR-FSD'
      }

      await deliverableService.createDeliverable(userId, deliverableInput)
      result.success++
      logger.log(`✅ Successfully imported: ${kpi.name}`)
    } catch (error: any) {
      logger.error(`❌ Failed to import ${kpi.name}:`, error)
      result.failed++
      result.errors.push(`${kpi.name}: ${error.message}`)
    }
  }

  logger.log(`Import complete! Success: ${result.success}, Failed: ${result.failed}`)
  return result
}

/**
 * Clear all deliverables from the database
 * Use with caution!
 */
export async function clearAllDeliverables(): Promise<number> {
  logger.warn('⚠️ Clearing all deliverables is not yet implemented')
  return 0
}
