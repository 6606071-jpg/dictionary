"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Search, Volume2, BookOpen, Loader } from "lucide-react"

interface WordDefinition {
  word: string
  phonetic?: string
  phonetics?: Array<{
    text?: string
    audio?: string
  }>
  meanings?: Array<{
    partOfSpeech: string
    definitions: Array<{
      definition: string
      example?: string
    }>
  }>
}

export default function DictionaryClient() {
  const [searchTerm, setSearchTerm] = useState("")
  const [wordData, setWordData] = useState<WordDefinition | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [audioUrl, setAudioUrl] = useState("")
  const audioRef = useRef<HTMLAudioElement>(null)

  const searchWord = async (word: string) => {
    if (!word.trim()) {
      setError("Please enter a word to search")
      setWordData(null)
      return
    }

    setLoading(true)
    setError("")
    setWordData(null)

    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`)

      if (!response.ok) {
        setError("Word not found. Please try another word.")
        setWordData(null)
        setLoading(false)
        return
      }

      const data = await response.json()
      const firstResult = data[0]
      setWordData(firstResult)

      // Extract audio URL
      if (firstResult.phonetics && firstResult.phonetics.length > 0) {
        const audioPhonetic = firstResult.phonetics.find((p: any) => p.audio)
        if (audioPhonetic && audioPhonetic.audio) {
          setAudioUrl(audioPhonetic.audio)
        }
      }

      setError("")
    } catch (err) {
      setError("An error occurred. Please try again.")
      setWordData(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchWord(searchTerm)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchWord(searchTerm)
    }
  }

  const playAudio = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.play()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      {/* Background animated elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4"></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="w-10 h-10 text-blue-600 dark:text-blue-400 animate-bounce" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              Dictionary
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Explore words, meanings, and pronunciations</p>
        </div>

        {/* Search Section */}
        <form onSubmit={handleSearch} className="mb-8 animate-fade-in animation-delay-1">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full blur opacity-0 group-hover:opacity-75 transition duration-300 animation-delay-2"></div>
            <div className="relative bg-white dark:bg-slate-800 rounded-full flex items-center px-6 py-3 shadow-lg hover:shadow-2xl transition-all duration-300">
              <Search className="w-6 h-6 text-gray-400 mr-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search any English word..."
                className="flex-1 bg-transparent outline-none text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-lg"
              />
              <button
                type="submit"
                className="ml-3 px-6 py-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-semibold rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300 active:scale-95"
              >
                Search
              </button>
            </div>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-xl border border-red-300 dark:border-red-700 animate-shake">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader className="w-10 h-10 text-blue-600 dark:text-blue-400 animate-spin" />
          </div>
        )}

        {/* Word Definition Card */}
        {wordData && !loading && (
          <div className="space-y-6 animate-fade-in">
            {/* Main Word Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 dark:border-slate-700">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">{wordData.word}</h2>
                  {wordData.phonetic && (
                    <p className="text-xl text-purple-600 dark:text-purple-400 italic">{wordData.phonetic}</p>
                  )}
                </div>
                {audioUrl && (
                  <button
                    onClick={playAudio}
                    className="self-start md:self-auto flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:shadow-lg transform hover:scale-110 transition-all duration-300 active:scale-95 group"
                  >
                    <Volume2 className="w-6 h-6 group-hover:animate-pulse" />
                    <span className="hidden sm:inline font-semibold">Play</span>
                  </button>
                )}
              </div>

              {/* Meanings */}
              {wordData.meanings && wordData.meanings.length > 0 && (
                <div className="space-y-8">
                  {wordData.meanings.map((meaning, idx) => (
                    <div
                      key={idx}
                      className="border-t border-gray-200 dark:border-slate-700 pt-8 first:border-t-0 first:pt-0"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white italic">
                          {meaning.partOfSpeech}
                        </h3>
                        <div className="flex-1 h-px bg-gradient-to-r from-blue-300 to-transparent dark:from-blue-600"></div>
                      </div>

                      {/* Definitions */}
                      {meaning.definitions && meaning.definitions.length > 0 && (
                        <div className="mb-6">
                          <p className="text-gray-600 dark:text-gray-400 font-semibold mb-3">Meaning:</p>
                          <ul className="space-y-3">
                            {meaning.definitions.map((def, defIdx) => (
                              <li key={defIdx} className="flex gap-4">
                                <span className="text-pink-500 font-bold text-lg flex-shrink-0">•</span>
                                <div className="flex-1">
                                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{def.definition}</p>
                                  {def.example && (
                                    <p className="text-gray-500 dark:text-gray-400 italic mt-2 pl-4 border-l-2 border-purple-300 dark:border-purple-600">
                                      "{def.example}"
                                    </p>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Audio Element */}
            {audioUrl && <audio ref={audioRef} src={audioUrl} />}
          </div>
        )}

        {/* Empty State */}
        {!wordData && !loading && !error && (
          <div className="text-center py-12 animate-fade-in">
            <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-xl">Search for a word to get started</p>
          </div>
        )}
      </div>

      {/* Styles for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        .animation-delay-1 {
          animation-delay: 0.1s;
        }

        .animation-delay-2 {
          animation-delay: 0.2s;
        }

        .animation-delay-4 {
          animation-delay: 0.4s;
        }
      `}</style>
    </div>
  )
}
