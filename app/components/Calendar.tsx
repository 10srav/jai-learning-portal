'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Bell,
  AlertCircle,
  Trash2,
  ExternalLink
} from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday } from 'date-fns'
import useStore from '@/app/lib/store'
import toast from 'react-hot-toast'

export default function Calendar() {
  const { events, addEvent, deleteEvent } = useStore()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showEventForm, setShowEventForm] = useState(false)

  // Event form state
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '09:00',
    type: 'exam' as 'exam' | 'test' | 'assignment' | 'other',
    reminder: true
  })

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Pad the calendar with empty days to start on Sunday
  const firstDayOfWeek = monthStart.getDay()
  const paddedDays = Array(firstDayOfWeek).fill(null)

  const handleAddEvent = () => {
    if (!newEvent.title) {
      toast.error('Please enter an event title')
      return
    }

    addEvent(newEvent)
    toast.success('Event added successfully!')

    // Reset form
    setNewEvent({
      title: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: '09:00',
      type: 'exam',
      reminder: true
    })
    setShowEventForm(false)

    // Set reminder if enabled
    if (newEvent.reminder) {
      scheduleReminder(newEvent)
    }
  }

  const scheduleReminder = (event: typeof newEvent) => {
    const eventDateTime = new Date(`${event.date} ${event.time}`)
    const reminderTime = new Date(eventDateTime.getTime() - 24 * 60 * 60 * 1000) // 1 day before

    if (reminderTime > new Date()) {
      const timeout = reminderTime.getTime() - new Date().getTime()
      setTimeout(() => {
        if (Notification.permission === 'granted') {
          new Notification(`Reminder: ${event.title}`, {
            body: `Tomorrow at ${event.time}`,
            icon: '/favicon.ico'
          })
        }
        toast.custom((t) => (
          <div className="bg-blue-600 text-white p-4 rounded-lg shadow-lg">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              <div>
                <p className="font-semibold">Reminder: {event.title}</p>
                <p className="text-sm">Tomorrow at {event.time}</p>
              </div>
            </div>
          </div>
        ), { duration: 5000 })
      }, timeout)
    }
  }

  // Request notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      Notification.requestPermission()
    }
  }, [])

  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return events.filter(event => event.date === dateStr)
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'exam':
        return 'bg-red-500'
      case 'test':
        return 'bg-yellow-500'
      case 'assignment':
        return 'bg-blue-500'
      default:
        return 'bg-purple-500'
    }
  }

  const upcomingEvents = events
    .filter(event => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5)

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <CalendarIcon className="w-6 h-6 text-blue-600" />
          Study Calendar
        </h2>
        <button
          onClick={() => {
            const googleCalendarUrl = 'https://calendar.google.com/calendar/u/0/r'
            window.open(googleCalendarUrl, '_blank')
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          Open Google Calendar
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="mb-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-semibold">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-semibold text-gray-600 p-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {paddedDays.map((_, index) => (
            <div key={`pad-${index}`} className="p-2" />
          ))}
          {monthDays.map(day => {
            const dayEvents = getEventsForDate(day)
            const isSelected = selectedDate && isSameDay(day, selectedDate)
            const today = isToday(day)

            return (
              <motion.div
                key={day.toString()}
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedDate(day)}
                className={`min-h-[80px] p-2 border rounded-lg cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : today
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-sm font-medium mb-1">
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map(event => (
                    <div
                      key={event.id}
                      className={`text-xs p-1 rounded text-white truncate ${getEventTypeColor(event.type)}`}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Bell className="w-5 h-5 text-yellow-500" />
            Upcoming Events & Exams
          </h3>
          <button
            onClick={() => setShowEventForm(!showEventForm)}
            className="bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Event
          </button>
        </div>

        {/* Event Form */}
        <AnimatePresence>
          {showEventForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-4 bg-gray-50 rounded-lg"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Event/Exam name"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as any })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="exam">📝 Exam</option>
                  <option value="test">📋 Class Test</option>
                  <option value="assignment">📚 Assignment Due</option>
                  <option value="other">📌 Other</option>
                </select>

                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between mt-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newEvent.reminder}
                    onChange={(e) => setNewEvent({ ...newEvent, reminder: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Send reminder notification</span>
                </label>

                <div className="flex gap-2">
                  <button
                    onClick={handleAddEvent}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Save Event
                  </button>
                  <button
                    onClick={() => setShowEventForm(false)}
                    className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Events List */}
        <div className="space-y-2">
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No upcoming events</p>
            </div>
          ) : (
            upcomingEvents.map(event => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getEventTypeColor(event.type)}`} />
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CalendarIcon className="w-3 h-3" />
                      {format(new Date(event.date), 'dd MMM yyyy')}
                      <Clock className="w-3 h-3 ml-2" />
                      {event.time}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    deleteEvent(event.id)
                    toast.success('Event deleted')
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}