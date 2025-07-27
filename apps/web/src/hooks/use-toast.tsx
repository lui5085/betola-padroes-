import * as React from "react"

export interface ToastProps {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

export function useToast() {
  const toast = React.useCallback((props: ToastProps) => {
    // Simple implementation - you can enhance this later
    console.log("Toast:", props)
  }, [])

  return {
    toast,
  }
}