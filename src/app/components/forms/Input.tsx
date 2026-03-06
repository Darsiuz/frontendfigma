interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export function Input({ error, className = "", ...props }: InputProps) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2
        ${error
          ? "border-red-500 focus:ring-red-500"
          : "border-gray-300 focus:ring-blue-500"}
        ${className}
      `}
    />
  )
}