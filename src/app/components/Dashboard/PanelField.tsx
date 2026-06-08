import { ReactNode } from "react"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@components/ui/resizable";

interface PanelFieldProps {
  title: string
  value: ReactNode
  description?: string
  icon: ReactNode
  defaultSize?: number
}

export function PanelField({ title, value, description, icon, defaultSize = 20 }: PanelFieldProps) {
  return (
    <ResizablePanel defaultSize={defaultSize}>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-600">{title}</p>
          {icon}
        </div>

        <p className="text-3xl font-bold text-gray-900">
          {value}
        </p>

        {description && (
          <p className="text-xs text-gray-500 mt-1">
            {description}
          </p>
        )}
      </div>
    </ResizablePanel>
  )
}