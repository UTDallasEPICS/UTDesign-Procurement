export const ITEM_CATEGORIES = [
  'Electronic Components',
  'Chemicals',
  'Software',
  'Hardware',
  'Screws/Bolts',
  'Medical Supplies',
  'Food for Research',
  'Office Supplies',
  '3D Printer Filament',
  'Wood',
  'Batteries',
  'PCB',
  'Tubing',
  'Drone Parts',
  'Magnets',
  'Other',
] as const

export type ItemCategory = (typeof ITEM_CATEGORIES)[number]

export const OTHER_CATEGORY: ItemCategory = 'Other'

/** Categories that always require a justification on reimbursement items */
export const JUSTIFICATION_REQUIRED_CATEGORIES: ItemCategory[] = ['Chemicals', 'Software']

export function isValidCategory(value: unknown): value is ItemCategory {
  return typeof value === 'string' && (ITEM_CATEGORIES as readonly string[]).includes(value)
}
