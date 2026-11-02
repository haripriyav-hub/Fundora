import { apiGet } from '@/lib/api'
import { mockSavedSchemes, mockSchemes } from './mockData'
import type { SavedScheme, Scheme } from './types'

/** Sample data stays on until the backend serves these routes. Set VITE_USE_MOCK_DATA=false to use the API. */
export const usingMockData = import.meta.env.VITE_USE_MOCK_DATA !== 'false'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** GET /schemes: every scheme, with the signed-in student's match result on each. */
export async function fetchSchemes(): Promise<Scheme[]> {
  if (usingMockData) {
    await wait(150)
    return mockSchemes
  }
  return (await apiGet<Scheme[]>('/schemes')) ?? []
}

/** GET /saved: the schemes the student saved to apply for. */
export async function fetchSavedSchemes(): Promise<SavedScheme[]> {
  if (usingMockData) {
    await wait(150)
    return mockSavedSchemes
  }
  return (await apiGet<SavedScheme[]>('/saved')) ?? []
}
