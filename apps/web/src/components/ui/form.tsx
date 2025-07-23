'use client'

import * as React from 'react'
import { UseFormReturn } from 'react-hook-form'

export function Form(props: React.FormHTMLAttributes<HTMLFormElement>) {
  return <form {...props} />
}

export function FormItem(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} />
}

export function FormField<T>({
  control,
  name,
  render,
}: {
  control: UseFormReturn<T>['control']
  name: keyof T
  render: (params: { field: any; fieldState: any }) => React.ReactNode
}) {
  return <>{render({ field: {}, fieldState: {} })}</>
}

export function FormControl(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} />
}

export function FormLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string
  children: React.ReactNode
}) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-foreground">
      {children}
    </label>
  )
}

export function FormMessage({ children }: { children?: React.ReactNode }) {
  if (!children) return null
  return <p className="text-xs text-destructive mt-1">{children}</p>
}