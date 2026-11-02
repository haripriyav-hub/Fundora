import { BedDouble, BookOpen, GraduationCap, Landmark, Laptop, Tag, type LucideIcon } from 'lucide-react'
import type { AidType } from '@/features/schemes/types'

export const aidIcons: Record<AidType, LucideIcon> = {
  scholarship: GraduationCap,
  loan: Landmark,
  feeWaiver: Tag,
  device: Laptop,
  hostel: BedDouble,
  books: BookOpen,
}
