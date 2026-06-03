import clsx from 'clsx'
import { forwardRef } from 'react'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          rows={3}
          className={clsx(
            'w-full rounded-xl border px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors resize-none',
            'placeholder:text-slate-400',
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
              : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
export default Textarea
