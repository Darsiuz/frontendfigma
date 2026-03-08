interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  colortheme?: string; // Opcional para estilos personalizados
}

export function Input({ error, colortheme="focus:ring-blue-500", className = "", ...props }: InputProps) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2
        ${error
          ? "border-red-500 focus:ring-red-500"
          : "border-gray-300 " + colortheme}
        ${className}
      `}
    />
  )
}