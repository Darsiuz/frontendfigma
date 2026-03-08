interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  colortheme?: string; // Opcional para estilos personalizados
}

export function Select({ error, colortheme='focus:ring-blue-500', className = '', children, ...props }: SelectProps) {
  return (
    <select
      className={`w-full px-3 py-2 border rounded-s-sm focus:outline-none focus:ring-2 ${colortheme}
        ${error ? 'border-red-500' : 'border-gray-300'}
        ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}