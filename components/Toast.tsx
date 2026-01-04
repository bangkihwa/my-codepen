'use client'

import { useEffect, useState } from 'react'

export type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
  message: string
  type?: ToastType
  duration?: number
  onClose: () => void
}

export default function Toast({
  message,
  type = 'success',
  duration = 3000,
  onClose,
}: ToastProps) {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(onClose, 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  }[type]

  return (
    <div
      className={`fixed top-4 right-4 px-6 py-3 rounded-lg text-white shadow-lg z-50 ${bgColor} ${
        isExiting ? 'toast-exit' : 'toast-enter'
      }`}
    >
      {message}
    </div>
  )
}

// Toast 상태 관리 Hook
export function useToast() {
  const [toast, setToast] = useState<{
    message: string
    type: ToastType
  } | null>(null)

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type })
  }

  const hideToast = () => {
    setToast(null)
  }

  return { toast, showToast, hideToast }
}
