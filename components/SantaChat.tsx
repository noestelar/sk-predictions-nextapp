'use client'

import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import ReactMarkdown from 'react-markdown'
import { Send, X, Sparkles, Gift, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface SantaChatProps {
  trigger?: React.ReactNode
  className?: string
}

export default function SantaChat({ trigger, className }: SantaChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '¡Qué onda raza! 🎅 Soy su Santa de confianza. ¿Qué tranza? ¿Quieren tips pa\' los regalos o qué pedo?' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat/santa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, userMessage].filter(m => m.role !== 'system') 
        })
      })

      if (!response.ok) throw new Error('Error fetching response')

      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.content }])
    } catch (error) {
      console.error(error)
      setMessages(prev => [...prev, { role: 'assistant', content: '¡No mames! Se me fue el internet en el Polo Norte. Intenta de nuevo al rato, güey. 🎅📡' }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div onClick={() => setIsOpen(true)} className={className}>
        {trigger || (
          <Button className="gap-2 bg-red-600 hover:bg-red-700 text-white">
            <Gift className="h-4 w-4" />
            Pregúntale a Santa
          </Button>
        )}
      </div>

      {isOpen && mounted && createPortal(
        <div className="fixed bottom-0 left-0 right-0 sm:bottom-6 sm:right-6 sm:left-auto z-[100] flex flex-col bg-zinc-900 shadow-2xl sm:w-[400px] h-[60vh] sm:h-[600px] sm:max-h-[80vh] rounded-t-2xl sm:rounded-2xl border-t-2 border-x-2 sm:border-2 border-red-500/30 animate-in slide-in-from-bottom-5 fade-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-red-700 to-red-600 p-4 text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
                  <span className="text-2xl">🎅</span>
                </div>
                <div>
                  <h3 className="font-bold">Chat con Santa</h3>
                  <p className="text-xs text-red-100">Experto en regalos y predicciones</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 rounded-full h-8 w-8"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-900/95">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex w-full gap-2",
                    msg.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-600/20 border border-red-500/30">
                      <span className="text-sm">🎅</span>
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2 text-sm overflow-hidden",
                      msg.role === 'user'
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-zinc-800 text-zinc-100 border border-zinc-700 rounded-bl-none"
                    )}
                  >
                    <ReactMarkdown
                      components={{
                        p: ({node, ...props}) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
                        strong: ({node, ...props}) => <span className={cn("font-bold", msg.role === 'assistant' ? "text-amber-400" : "")} {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                        li: ({node, ...props}) => <li className="" {...props} />,
                        a: ({node, ...props}) => <a className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                  {msg.role === 'user' && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 border border-primary/30">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-600/20 border border-red-500/30">
                    <span className="text-sm">🎅</span>
                  </div>
                  <div className="bg-zinc-800 border border-zinc-700 rounded-2xl rounded-bl-none px-4 py-2 flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-zinc-800 bg-zinc-900 p-4 shrink-0">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Pregúntale a Santa..."
                  className="flex-1 rounded-full bg-zinc-800 px-4 py-2 text-sm text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 border border-zinc-700"
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={isLoading || !input.trim()}
                  className="rounded-full bg-red-600 hover:bg-red-700 text-white h-10 w-10 shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
        </div>,
        document.body
      )}
    </>
  )
}
