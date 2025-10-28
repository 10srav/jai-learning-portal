'use client'

import { useState } from 'react'
import Header from './components/Header'
import TodoList from './components/TodoList'
import SubjectResources from './components/SubjectResources'
import Calendar from './components/Calendar'
import StudyTimer from './components/StudyTimer'
import { motion } from 'framer-motion'
import {
  LayoutGrid,
  CheckSquare,
  BookOpen,
  Calendar as CalendarIcon,
  Timer
} from 'lucide-react'

export default function Home() {
  const [activeView, setActiveView] = useState<'dashboard' | 'tasks' | 'resources' | 'calendar' | 'timer'>('dashboard')

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'resources', label: 'Resources', icon: BookOpen },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'timer', label: 'Timer & Progress', icon: Timer },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      {/* Navigation Bar */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <nav className="flex justify-center space-x-2 py-3">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    activeView === item.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {activeView === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8 shadow-lg">
              <h1 className="text-3xl font-bold mb-4">Welcome to Your Learning Portal, Jai! 🎓</h1>
              <p className="text-lg opacity-90">
                Track your progress, manage your tasks, and access all your study resources in one place.
                Let's make today productive!
              </p>
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/20 rounded-lg p-4 backdrop-blur">
                  <p className="text-3xl font-bold">10th</p>
                  <p className="text-sm opacity-90">Standard</p>
                </div>
                <div className="bg-white/20 rounded-lg p-4 backdrop-blur">
                  <p className="text-3xl font-bold">6</p>
                  <p className="text-sm opacity-90">Subjects</p>
                </div>
                <div className="bg-white/20 rounded-lg p-4 backdrop-blur">
                  <p className="text-3xl font-bold">CBSE</p>
                  <p className="text-sm opacity-90">Board</p>
                </div>
                <div className="bg-white/20 rounded-lg p-4 backdrop-blur">
                  <p className="text-3xl font-bold">2024</p>
                  <p className="text-sm opacity-90">Academic Year</p>
                </div>
              </div>
            </div>

            {/* Grid Layout for Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <TodoList />
              </div>
              <div>
                <Calendar />
              </div>
            </div>

            <SubjectResources />
            <StudyTimer />
          </motion.div>
        )}

        {activeView === 'tasks' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <TodoList />
          </motion.div>
        )}

        {activeView === 'resources' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <SubjectResources />
          </motion.div>
        )}

        {activeView === 'calendar' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Calendar />
          </motion.div>
        )}

        {activeView === 'timer' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <StudyTimer />
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm opacity-75">
            Made with ❤️ for Jai | Stay focused, stay motivated!
          </p>
          <div className="mt-4 flex justify-center gap-6 text-sm">
            <a href="https://www.khanacademy.org/" target="_blank" className="hover:underline">
              Khan Academy
            </a>
            <a href="https://ncert.nic.in/" target="_blank" className="hover:underline">
              NCERT
            </a>
            <a href="https://www.youtube.com/education" target="_blank" className="hover:underline">
              YouTube Education
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}