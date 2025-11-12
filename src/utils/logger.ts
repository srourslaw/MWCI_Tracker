/**
 * Environment-aware logging utility
 * - Development: All logs are shown
 * - Production: Only errors are shown
 */

const isDevelopment = import.meta.env.DEV

export const logger = {
  /**
   * General logging - only in development
   */
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args)
    }
  },

  /**
   * Warning logging - only in development
   */
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args)
    }
  },

  /**
   * Error logging - always shown (critical for production monitoring)
   */
  error: (...args: any[]) => {
    console.error(...args)
  },

  /**
   * Debug logging - only in development
   */
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args)
    }
  },

  /**
   * Info logging - only in development
   */
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args)
    }
  },

  /**
   * Group logging for better organization - only in development
   */
  group: (label: string) => {
    if (isDevelopment) {
      console.group(label)
    }
  },

  groupEnd: () => {
    if (isDevelopment) {
      console.groupEnd()
    }
  },
}
