"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToastProps {
  message: string
  onClose: () => void
  duration?: number
}

export function Toast({ message, onClose, duration = 3000 }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={cn(
        "fixed top-4 right-4 z-50 flex items-center gap-3 rounded-lg border bg-background px-4 py-3 shadow-lg",
        "min-w-[300px] max-w-[500px]"
      )}
    >
      <p className="text-sm font-medium flex-1">{message}</p>
      <button
        onClick={onClose}
        className="rounded-sm opacity-70 hover:opacity-100 transition-opacity"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  )
}

interface ToastContainerProps {
  toasts: Array<{ id: string; message: string }>
  onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            onClose={() => onRemove(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

