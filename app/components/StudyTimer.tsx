'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Trophy,
  Target,
  TrendingUp,
  Award
} from 'lucide-react'
import useStore from '@/app/lib/store'
import toast from 'react-hot-toast'

export default function StudyTimer() {
  const {
    timerSeconds,
    isTimerRunning,
    setTimerSeconds,
    setIsTimerRunning,
    addStudySession,
    completedTasksCount,
    studyStreak,
    tasks
  } = useStore()

  const [sessionSubject, setSessionSubject] = useState('general')
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isTimerRunning) {
      intervalRef.current = setInterval(() => {
        setTimerSeconds(timerSeconds + 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isTimerRunning, timerSeconds, setTimerSeconds])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStart = () => {
    setIsTimerRunning(true)
    toast.success('Study timer started! Stay focused! 🎯')
  }

  const handlePause = () => {
    setIsTimerRunning(false)
    if (timerSeconds > 60) {
      // Save session if more than 1 minute
      addStudySession({
        date: new Date().toISOString(),
        duration: timerSeconds,
        subject: sessionSubject
      })
      toast.success(`Study session saved! Duration: ${formatTime(timerSeconds)}`)
    }
  }

  const handleReset = () => {
    setIsTimerRunning(false)
    setTimerSeconds(0)
    toast('Timer reset', { icon: 'ℹ️' })
  }

  // Calculate progress stats
  const totalTasks = tasks.length
  const completionRate = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0

  const getMotivationalMessage = () => {
    if (completionRate >= 80) return "Outstanding work, Jai! You're crushing it! 🌟"
    if (completionRate >= 60) return "Great progress! Keep up the momentum! 💪"
    if (completionRate >= 40) return "You're doing well! Stay consistent! 📚"
    if (completionRate >= 20) return "Good start! Keep pushing forward! 🚀"
    return "Let's get started! You've got this! 💡"
  }

  const subjects = [
    { value: 'general', label: 'General Study' },
    { value: 'mathematics', label: 'Mathematics' },
    { value: 'science', label: 'Science' },
    { value: 'english', label: 'English' },
    { value: 'social-science', label: 'Social Science' },
    { value: 'hindi', label: 'Hindi' },
    { value: 'computer', label: 'Computer' },
  ]

  return (
    <div className="space-y-6">
      {/* Study Timer */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Clock className="w-6 h-6 text-blue-600" />
          Study Timer
        </h2>

        <div className="text-center mb-6">
          <motion.div
            className="text-6xl font-bold text-blue-600 mb-4"
            animate={{ scale: isTimerRunning ? [1, 1.05, 1] : 1 }}
            transition={{ repeat: isTimerRunning ? Infinity : 0, duration: 1 }}
          >
            {formatTime(timerSeconds)}
          </motion.div>

          <select
            value={sessionSubject}
            onChange={(e) => setSessionSubject(e.target.value)}
            className="mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isTimerRunning}
          >
            {subjects.map(subject => (
              <option key={subject.value} value={subject.value}>
                {subject.label}
              </option>
            ))}
          </select>

          <div className="flex justify-center gap-4">
            {!isTimerRunning ? (
              <button
                onClick={handleStart}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                Start
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2"
              >
                <Pause className="w-5 h-5" />
                Pause
              </button>
            )}
            <button
              onClick={handleReset}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Reset
            </button>
          </div>
        </div>

        {/* Study Tips */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">💡 Study Tip</h3>
          <p className="text-sm text-gray-600">
            Use the Pomodoro Technique: Study for 25 minutes, then take a 5-minute break.
            After 4 sessions, take a longer 15-30 minute break.
          </p>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          Your Progress
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Tasks Completed */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 opacity-80" />
              <span className="text-3xl font-bold">{completedTasksCount}</span>
            </div>
            <p className="text-sm opacity-90">Tasks Completed</p>
            <div className="mt-2 bg-white/20 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </motion.div>

          {/* Study Streak */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 opacity-80" />
              <span className="text-3xl font-bold">{studyStreak}</span>
            </div>
            <p className="text-sm opacity-90">Day Study Streak</p>
            <p className="text-xs mt-2 opacity-75">Keep it going!</p>
          </motion.div>

          {/* Completion Rate */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <Award className="w-8 h-8 opacity-80" />
              <span className="text-3xl font-bold">{completionRate}%</span>
            </div>
            <p className="text-sm opacity-90">Completion Rate</p>
            <p className="text-xs mt-2 opacity-75">
              {totalTasks} total tasks
            </p>
          </motion.div>
        </div>

        {/* Motivational Message */}
        <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
          <p className="text-center text-lg font-medium text-gray-800">
            {getMotivationalMessage()}
          </p>
        </div>

        {/* Achievement Badges */}
        <div className="mt-6">
          <h3 className="font-semibold text-gray-800 mb-3">🏆 Achievements</h3>
          <div className="flex flex-wrap gap-2">
            {completedTasksCount >= 1 && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                🎯 First Task
              </span>
            )}
            {completedTasksCount >= 5 && (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                ⭐ 5 Tasks
              </span>
            )}
            {completedTasksCount >= 10 && (
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                🌟 10 Tasks
              </span>
            )}
            {completedTasksCount >= 25 && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                🏆 25 Tasks
              </span>
            )}
            {studyStreak >= 3 && (
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                🔥 3 Day Streak
              </span>
            )}
            {studyStreak >= 7 && (
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                💪 Week Warrior
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}