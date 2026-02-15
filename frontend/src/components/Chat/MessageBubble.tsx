interface MessageBubbleProps {
  text: string;
  role: 'user' | 'assistant';
}

export function MessageBubble({ text, role }: MessageBubbleProps) {
  const isUser = role === 'user';

  if (isUser) {
    // ユーザーメッセージ：右側
    return (
      <div className="flex justify-end px-6 py-4">
        <div className="flex max-w-[80%] flex-row-reverse gap-3">
          {/* アイコン */}
          <div className="flex-shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-sm font-semibold text-white shadow-sm">
              You
            </div>
          </div>

          {/* メッセージ内容 */}
          <div className="space-y-1">
            <div className="text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
              あなた
            </div>
            <div className="rounded-2xl rounded-tr-sm bg-gradient-to-br from-blue-500 to-blue-600 px-4 py-3 shadow-sm">
              <p className="whitespace-pre-wrap leading-relaxed text-white">{text}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // AIメッセージ：左側
  return (
    <div className="bg-gradient-to-br from-blue-50/30 to-purple-50/30 px-6 py-6 transition-colors hover:bg-gray-50/50">
      <div className="flex max-w-[85%] gap-4">
        {/* アイコン */}
        <div className="flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 text-sm font-bold text-white shadow-md">
            AI
          </div>
        </div>

        {/* メッセージ内容 */}
        <div className="flex-1 space-y-2 pt-1">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            AI ドライブコンシェルジュ
          </div>
          <div className="prose prose-sm max-w-none text-gray-800">
            <p className="whitespace-pre-wrap leading-relaxed">{text}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
