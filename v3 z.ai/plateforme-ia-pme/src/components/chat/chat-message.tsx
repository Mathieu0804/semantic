'use client';

import { User, Bot } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: {
    role: 'user' | 'assistant';
    content: string;
  };
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn(
      "flex gap-3 p-4",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      <Avatar className="h-8 w-8">
        <AvatarFallback className={cn(
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      <div className={cn(
        "flex-1 max-w-[80%] rounded-lg p-3",
        isUser ? "bg-primary text-primary-foreground ml-auto" : "bg-muted"
      )}>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}
