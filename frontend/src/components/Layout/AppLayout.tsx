import { ReactNode } from 'react';

interface AppLayoutProps {
  chatPanel: ReactNode;
  mapPanel: ReactNode;
}

export function AppLayout({ chatPanel, mapPanel }: AppLayoutProps) {
  return (
    <div className="grid h-screen grid-cols-1 overflow-hidden bg-gray-50 md:grid-cols-[1fr_1.2fr]">
      {/* チャットパネル */}
      <div className="flex h-full flex-col overflow-hidden border-b border-gray-200 bg-white shadow-sm md:border-r md:border-b-0">
        {chatPanel}
      </div>

      {/* マップパネル */}
      <div className="flex flex-col bg-gray-100">{mapPanel}</div>
    </div>
  );
}
