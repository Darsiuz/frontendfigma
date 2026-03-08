interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
  colortheme?: string; // Opcional para estilos personalizados
}
export function TextArea({ error, colortheme = "focus:ring-blue-500", className = "", ...props }: TextAreaProps) {
  return (
    <textarea
      {...props}
      className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 
        ${error
          ? 'border-red-500 focus:ring-red-500'
          : ' border-gray-300 ' + colortheme}
        ${className}
      `}
    />
  );
}