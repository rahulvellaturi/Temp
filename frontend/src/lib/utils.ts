import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(date: string | Date, format: 'short' | 'long' = 'short'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (format === 'long') {
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  return dateObj.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    // Policy statuses
    ACTIVE: 'bg-success/10 text-success border-success/20',
    PENDING_RENEWAL: 'bg-warning/10 text-warning border-warning/20',
    EXPIRED: 'bg-error/10 text-error border-error/20',
    CANCELLED: 'bg-neutral-400/10 text-neutral-600 border-neutral-400/20',
    
    // Claim statuses
    SUBMITTED: 'bg-blue-100 text-blue-800 border-blue-200',
    UNDER_REVIEW: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    ADJUSTER_ASSIGNED: 'bg-purple-100 text-purple-800 border-purple-200',
    APPROVED: 'bg-success/10 text-success border-success/20',
    REJECTED: 'bg-error/10 text-error border-error/20',
    PAID: 'bg-green-100 text-green-800 border-green-200',
    CLOSED: 'bg-neutral-400/10 text-neutral-600 border-neutral-400/20',
    
    // Payment statuses
    PENDING: 'bg-warning/10 text-warning border-warning/20',
    COMPLETED: 'bg-success/10 text-success border-success/20',
    FAILED: 'bg-error/10 text-error border-error/20',
    REFUNDED: 'bg-neutral-400/10 text-neutral-600 border-neutral-400/20',
    
    // Change request statuses
    PENDING: 'bg-warning/10 text-warning border-warning/20',
    APPROVED: 'bg-success/10 text-success border-success/20',
    REJECTED: 'bg-error/10 text-error border-error/20',
    CANCELLED: 'bg-neutral-400/10 text-neutral-600 border-neutral-400/20',
  }
  
  return statusColors[status] || 'bg-neutral-100 text-neutral-800 border-neutral-200'
}

export function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, '')
  
  // Check if it's a valid US phone number
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  }
  
  return phoneNumber // Return original if not a standard format
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}