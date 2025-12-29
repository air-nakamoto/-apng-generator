"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Bug, Lightbulb, MessageSquare, Loader2 } from 'lucide-react'

type FeedbackType = 'bug' | 'feature' | 'impression'

interface FeedbackModalProps {
    isOpen: boolean
    onClose: () => void
    version: string
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, version }) => {
    const [type, setType] = useState<FeedbackType>('feature')
    const [content, setContent] = useState('')
    const [contact, setContact] = useState('')
    const [wantsReply, setWantsReply] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim()) return

        setIsSubmitting(true)
        setError(null)

        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type,
                    content,
                    contact: wantsReply ? contact : '',
                    version,
                    wantsReply,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || '送信に失敗しました')
            }

            setIsSuccess(true)
            setTimeout(() => {
                onClose()
                // Reset form after closing
                setTimeout(() => {
                    setIsSuccess(false)
                    setContent('')
                    setContact('')
                    setWantsReply(false)
                    setType('feature')
                }, 300)
            }, 2000)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'エラーが発生しました')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                    />

                    {/* Modal Wrapper for Centering */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-2xl pointer-events-auto flex flex-col max-h-[90vh] overflow-hidden"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 flex-shrink-0">
                                <div className="flex flex-col">
                                    <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                        <MessageSquare className="w-5 h-5 text-blue-500" />
                                        意見・要望を送る
                                    </h2>
                                    <span className="text-xs text-gray-400 mt-0.5">対象バージョン: {version}</span>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Scrollable Content Area */}
                            <div className="flex-1 overflow-y-auto">
                                {/* Success State */}
                                {isSuccess ? (
                                    <div className="p-12 flex flex-col items-center justify-center text-center">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4"
                                        >
                                            <Send className="w-8 h-8" />
                                        </motion.div>
                                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">送信しました！</h3>
                                        <p className="text-gray-500">貴重なご意見ありがとうございます。</p>
                                    </div>
                                ) : (
                                    /* Form */
                                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                        {/* Type Selection */}
                                        <div className="space-y-3">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                投稿の種類 <span className="text-red-500">*</span>
                                            </label>
                                            <div className="grid grid-cols-3 gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setType('bug')}
                                                    className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${type === 'bug'
                                                        ? 'border-red-500 bg-red-50 text-red-600 dark:bg-red-900/20'
                                                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400'
                                                        }`}
                                                >
                                                    <Bug className="w-6 h-6 mb-1" />
                                                    <span className="text-sm font-bold">不具合</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setType('feature')}
                                                    className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${type === 'feature'
                                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20'
                                                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400'
                                                        }`}
                                                >
                                                    <Lightbulb className="w-6 h-6 mb-1" />
                                                    <span className="text-sm font-bold">要望</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setType('impression')}
                                                    className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${type === 'impression'
                                                        ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/20'
                                                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400'
                                                        }`}
                                                >
                                                    <MessageSquare className="w-6 h-6 mb-1" />
                                                    <span className="text-sm font-bold">感想</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                内容 <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                value={content}
                                                onChange={(e) => setContent(e.target.value)}
                                                required
                                                rows={4}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors resize-none"
                                                placeholder={
                                                    type === 'bug'
                                                        ? 'どのような手順で不具合が発生しましたか？'
                                                        : type === 'feature'
                                                            ? '欲しいエフェクトや改善案を教えてください'
                                                            : '使ってみた感想を自由にお書きください'
                                                }
                                            />
                                        </div>

                                        {/* Reply Request Toggle */}
                                        <div className="flex items-center gap-2 pt-2">
                                            <input
                                                type="checkbox"
                                                id="wantsReply"
                                                checked={wantsReply}
                                                onChange={(e) => setWantsReply(e.target.checked)}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <label htmlFor="wantsReply" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                                                個別回答を希望する
                                            </label>
                                        </div>

                                        {/* Contact (Conditional) */}
                                        <AnimatePresence>
                                            {wantsReply && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="space-y-2 overflow-hidden"
                                                >
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        連絡先 <span className="text-red-500">*</span>
                                                    </label>
                                                    <p className="text-[11px] text-gray-400 -mt-1">
                                                        ※Discord IDやメールアドレス等の記載をお願いします
                                                    </p>
                                                    <input
                                                        type="text"
                                                        value={contact}
                                                        onChange={(e) => setContact(e.target.value)}
                                                        required={wantsReply}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                                                        placeholder="Discord ID、メールアドレスなど"
                                                    />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Error Message */}
                                        {error && (
                                            <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</p>
                                        )}

                                        {/* Submit Button */}
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || !content.trim()}
                                            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg shadow-lg transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    送信中...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-5 h-5" />
                                                    送信する
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}
