import clsx from 'clsx'
import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helpText?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helpText, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'w-full rounded-xl border px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors',
            'placeholder:text-slate-400',
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
              : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        {helpText && !error && <p className="text-xs text-slate-500">{helpText}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
