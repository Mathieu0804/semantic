'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatBotProps {
  context: string
  onCodeGenerated?: (code: string) => void
}

export function ChatBot({ context, onCodeGenerated }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      // Utilise Gemini API (compatible Render.com)
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context
        })
      })

      if (!response.ok) throw new Error('Erreur API')

      const data = await response.json()
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response
      }

      setMessages(prev => [...prev, assistantMessage])

      // Si du code est généré et un callback existe
      if (onCodeGenerated && data.code) {
        onCodeGenerated(data.code)
      }
    } catch (error) {
      console.error('Erreur:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Désolé, une erreur est survenue. Vérifiez que Gemini API est bien configurée (GEMINI_API_KEY).'
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      <div className="bg-primary text-white p-4 rounded-t-lg">
        <h3 className="font-semibold">💬 Assistant IA</h3>
        <p className="text-sm opacity-90">Propulsé par Google Gemini</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-2xl mb-2">👋</p>
            <p>Bonjour ! Comment puis-je vous aider aujourd'hui ?</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`chat-message ${
              msg.role === 'user'
                ? 'ml-auto max-w-[80%]'
                : 'mr-auto max-w-[80%]'
            }`}
          >
            <div
              className={`p-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="mr-auto max-w-[80%]">
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && sendMessage()}
            placeholder="Tapez votre message..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Envoyer
          </button>
        </div>
      </div>
    </div>
  )
}
