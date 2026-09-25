import { useState, useRef, useEffect } from 'react'
import Modal from '../Common/Modal'
import { aiAPI } from '../../services/api'
import { Send, Sparkles, User } from 'lucide-react'
import toast from 'react-hot-toast'

const SUGGESTIONS = [
  'Why did I overspend this month?',
  'How can I save more money?',
  'What is my biggest expense category?',
  'Give me tips to improve my score',
]

export default function AIChat({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hi! I'm your AI financial advisor. Ask me anything about your spending habits, budget, or savings goals.",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (question) => {
    const q = question || input.trim()
    if (!q) return

    setMessages((prev) => [...prev, { role: 'user', text: q }])
    setInput('')
    setLoading(true)

    try {
      const res = await aiAPI.ask({ question: q, include_context: true })
      setMessages((prev) => [...prev, { role: 'assistant', text: res.data.response }])
    } catch {
      toast.error('AI is unavailable. Check your API key.')
      setMessages((prev) => [...prev, {
        role: 'assistant',
        text: 'Sorry, I am unable to respond right now. Please ensure your Gemini API key is configured.',
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ask AI" size="md">
      <div className="flex flex-col h-[70vh]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                msg.role === 'assistant' ? 'gradient-primary' : 'bg-surface-600'
              }`}>
                {msg.role === 'assistant'
                  ? <Sparkles className="w-4 h-4 text-white" />
                  : <User className="w-4 h-4 text-slate-300" />
                }
              </div>
              <div className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary-500/20 text-slate-100 border border-primary-500/20 rounded-tr-sm'
                  : 'bg-surface-700 text-slate-200 border border-surface-600 rounded-tl-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-2.5">
              <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="px-4 py-3 bg-surface-700 rounded-2xl rounded-tl-sm border border-surface-600">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length === 1 && (
          <div className="px-4 pb-2">
            <p className="text-xs text-slate-500 mb-2">Suggested questions</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-xs px-3 py-1.5 bg-surface-700 border border-surface-500 rounded-lg text-slate-300
                             hover:border-primary-500/50 hover:text-slate-100 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-surface-600">
          <div className="flex gap-2">
            <input
              className="input flex-1 py-2.5"
              placeholder="Ask anything about your finances..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              disabled={loading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-11 h-11 gradient-primary rounded-xl flex items-center justify-center
                         disabled:opacity-40 active:scale-95 transition-all flex-shrink-0"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
