import { kpiService } from '../services/kpiService'
import { initialKPIs } from '../data/initialKPIs'

export async function importInitialKPIs(userId: string): Promise<{ success: number; failed: number; errors: string[] }> {
  let success = 0
  let failed = 0
  const errors: string[] = []

  console.log(`Starting import of ${initialKPIs.length} KPIs...`)

  for (const kpi of initialKPIs) {
    try {
      await kpiService.createKPI(userId, kpi)
      success++
      console.log(`✓ Imported: ${kpi.name}`)
    } catch (error) {
      failed++
      const errorMessage = `Failed to import ${kpi.name}: ${error}`
      errors.push(errorMessage)
      console.error(`✗ ${errorMessage}`)
    }
  }

  console.log(`\nImport complete: ${success} successful, ${failed} failed`)

  return { success, failed, errors }
}
