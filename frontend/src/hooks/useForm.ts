import { useState } from 'react'

type Validators<T> = {
  [K in keyof T]?: (value: string) => string | null
}

export function useForm<T extends Record<string, string>>(
  initial: T,
  validators: Validators<T> = {}
) {
  const [values, setValues] = useState<T>(initial)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof T]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {}
    let valid = true
    for (const key in validators) {
      const validator = validators[key]
      if (validator) {
        const error = validator(values[key] ?? '')
        if (error) {
          newErrors[key] = error
          valid = false
        }
      }
    }
    setErrors(newErrors)
    return valid
  }

  const setValue = (name: keyof T, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  return { values, errors, handleChange, validate, setValue, setValues }
}
