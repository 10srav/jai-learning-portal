'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Video,
  Globe,
  FileText,
  PenTool,
  ExternalLink,
  Calculator,
  FlaskConical,
  Languages,
  MapPin,
  Type,
  Monitor
} from 'lucide-react'
import { subjectResources } from '@/app/lib/resources'

export default function SubjectResources() {
  const [selectedSubject, setSelectedSubject] = useState<string>('mathematics')

  const subjects = [
    { id: 'mathematics', name: 'Mathematics', icon: Calculator, color: 'bg-blue-500' },
    { id: 'science', name: 'Science', icon: FlaskConical, color: 'bg-green-500' },
    { id: 'english', name: 'English', icon: Languages, color: 'bg-purple-500' },
    { id: 'social-science', name: 'Social Science', icon: MapPin, color: 'bg-yellow-500' },
    { id: 'telugu', name: 'Telugu', icon: Type, color: 'bg-red-500' },
    { id: 'computer', name: 'Computer', icon: Monitor, color: 'bg-indigo-500' },
  ]

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-5 h-5" />
      case 'website':
        return <Globe className="w-5 h-5" />
      case 'pdf':
        return <FileText className="w-5 h-5" />
      case 'practice':
        return <PenTool className="w-5 h-5" />
      default:
        return <BookOpen className="w-5 h-5" />
    }
  }

  const getResourceTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-red-100 text-red-600 border-red-200'
      case 'website':
        return 'bg-blue-100 text-blue-600 border-blue-200'
      case 'pdf':
        return 'bg-green-100 text-green-600 border-green-200'
      case 'practice':
        return 'bg-purple-100 text-purple-600 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <BookOpen className="w-6 h-6 text-blue-600" />
        Study Resources
      </h2>

      {/* Subject Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
        {subjects.map((subject) => {
          const Icon = subject.icon
          return (
            <button
              key={subject.id}
              onClick={() => setSelectedSubject(subject.id)}
              className={`p-3 rounded-lg transition-all transform hover:scale-105 ${
                selectedSubject === subject.id
                  ? `${subject.color} text-white shadow-lg`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs font-medium">{subject.name}</span>
            </button>
          )
        })}
      </div>

      {/* Resources Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedSubject}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {subjectResources[selectedSubject]?.map((resource, index) => (
            <motion.a
              key={index}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="block p-4 border-2 rounded-lg hover:shadow-xl transition-all transform hover:scale-105 hover:border-blue-400"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{resource.icon}</span>
                  <h3 className="font-semibold text-gray-800">
                    {resource.title}
                  </h3>
                </div>
                <span className={`p-1.5 rounded-lg border ${getResourceTypeColor(resource.type)}`}>
                  {getResourceIcon(resource.type)}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-3">
                {resource.description}
              </p>

              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getResourceTypeColor(resource.type)}`}>
                  {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                </span>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </div>
            </motion.a>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Quick Links Section */}
      <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-3">📚 Popular Learning Platforms</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { name: 'Khan Academy', url: 'https://www.khanacademy.org/', color: 'bg-green-500' },
            { name: "BYJU'S", url: 'https://byjus.com/', color: 'bg-purple-500' },
            { name: 'Vedantu', url: 'https://www.vedantu.com/', color: 'bg-orange-500' },
            { name: 'Toppr', url: 'https://www.toppr.com/', color: 'bg-blue-500' },
            { name: 'Unacademy', url: 'https://unacademy.com/', color: 'bg-red-500' },
            { name: 'Physics Wallah', url: 'https://www.pw.live/', color: 'bg-indigo-500' },
          ].map((platform) => (
            <a
              key={platform.name}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${platform.color} text-white px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-1`}
            >
              {platform.name}
              <ExternalLink className="w-3 h-3" />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}