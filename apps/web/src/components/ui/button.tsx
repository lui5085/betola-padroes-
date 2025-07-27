'use client'

import * as React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'link' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'icon'
}

export function Button({ children, className = '', variant = 'default', size = 'md', ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={
        `inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold ` +
        `transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ` +
        className
      }
    >
      {children}
    </button>
  )
}
