interface FormFieldProps {
  label: string
  error?: string
  children: React.ReactNode
}

export function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        {children}
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-1">
          {error}
        </p>
      )}
    </div>
  )
}