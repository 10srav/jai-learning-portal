'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Check,
  X,
  Calendar,
  Flag,
  BookOpen,
  Trash2,
  Edit2,
  Save
} from 'lucide-react'
import useStore from '@/app/lib/store'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function TodoList() {
  const { tasks, addTask, deleteTask, toggleTaskComplete, updateTask } = useStore()
  const [showAddForm, setShowAddForm] = useState(false)
  const [filter, setFilter] = useState<'all' | 'today' | 'pending' | 'completed'>('all')
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form state
  const [newTask, setNewTask] = useState({
    title: '',
    subject: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    priority: 'medium' as 'low' | 'medium' | 'high'
  })

  const subjects = [
    { value: 'mathematics', label: 'Mathematics', icon: '📐' },
    { value: 'science', label: 'Science', icon: '🔬' },
    { value: 'english', label: 'English', icon: '📚' },
    { value: 'social-science', label: 'Social Science', icon: '🌍' },
    { value: 'telugu', label: 'Telugu', icon: '📝' },
    { value: 'computer', label: 'Computer', icon: '💻' },
  ]

  const handleAddTask = () => {
    if (!newTask.title || !newTask.subject) {
      toast.error('Please fill in all required fields')
      return
    }

    addTask({
      ...newTask,
      completed: false
    })

    toast.success('Task added successfully!')
    setNewTask({
      title: '',
      subject: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      priority: 'medium'
    })
    setShowAddForm(false)
  }

  const filteredTasks = tasks.filter(task => {
    const today = format(new Date(), 'yyyy-MM-dd')

    switch (filter) {
      case 'today':
        return task.date === today
      case 'pending':
        return !task.completed
      case 'completed':
        return task.completed
      default:
        return true
    }
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-500 bg-red-50'
      case 'medium':
        return 'border-yellow-500 bg-yellow-50'
      case 'low':
        return 'border-green-500 bg-green-50'
      default:
        return 'border-gray-300'
    }
  }

  const getSubjectIcon = (subject: string) => {
    return subjects.find(s => s.value === subject)?.icon || '📖'
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-600" />
          My Study Tasks
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Task
        </button>
      </div>

      {/* Add Task Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-gray-50 rounded-lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="What do you need to study?"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <select
                value={newTask.subject}
                onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Subject</option>
                {subjects.map(subject => (
                  <option key={subject.value} value={subject.value}>
                    {subject.icon} {subject.label}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={newTask.date}
                onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">🟢 Low Priority</option>
                <option value="medium">🟡 Medium Priority</option>
                <option value="high">🔴 High Priority</option>
              </select>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={handleAddTask}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Task
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6">
        {(['all', 'today', 'pending', 'completed'] as const).map(filterType => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`px-4 py-2 rounded-lg capitalize transition-colors ${
              filter === filterType
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filterType}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        <AnimatePresence>
          {filteredTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-gray-500"
            >
              <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No tasks found. Add your first task!</p>
            </motion.div>
          ) : (
            filteredTasks.map(task => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  task.completed
                    ? 'bg-gray-50 border-gray-200 opacity-75'
                    : getPriorityColor(task.priority)
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      onClick={() => toggleTaskComplete(task.id)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        task.completed
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-400 hover:border-green-500'
                      }`}
                    >
                      {task.completed && <Check className="w-4 h-4 text-white" />}
                    </button>

                    <div className="flex-1">
                      {editingId === task.id ? (
                        <input
                          type="text"
                          value={task.title}
                          onChange={(e) => updateTask(task.id, { title: e.target.value })}
                          className="w-full px-2 py-1 border rounded"
                          onBlur={() => setEditingId(null)}
                          autoFocus
                        />
                      ) : (
                        <h3 className={`font-semibold ${task.completed ? 'line-through' : ''}`}>
                          {task.title}
                        </h3>
                      )}

                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          {getSubjectIcon(task.subject)} {task.subject}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(task.date), 'dd MMM')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Flag className="w-3 h-3" />
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingId(task.id)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        deleteTask(task.id)
                        toast.success('Task deleted')
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}