import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Task {
  id: string
  title: string
  subject: string
  date: string
  priority: 'low' | 'medium' | 'high'
  completed: boolean
  createdAt: Date
}

export interface Event {
  id: string
  title: string
  date: string
  time: string
  type: 'exam' | 'test' | 'assignment' | 'other'
  reminder: boolean
}

export interface StudySession {
  date: string
  duration: number
  subject: string
}

interface AppState {
  // Tasks
  tasks: Task[]
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  toggleTaskComplete: (id: string) => void

  // Events
  events: Event[]
  addEvent: (event: Omit<Event, 'id'>) => void
  updateEvent: (id: string, updates: Partial<Event>) => void
  deleteEvent: (id: string) => void

  // Study Sessions
  studySessions: StudySession[]
  addStudySession: (session: StudySession) => void

  // Progress
  completedTasksCount: number
  studyStreak: number
  updateProgress: () => void

  // Timer
  timerSeconds: number
  isTimerRunning: boolean
  setTimerSeconds: (seconds: number) => void
  setIsTimerRunning: (running: boolean) => void
}

const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Tasks
      tasks: [],
      addTask: (task) => set((state) => ({
        tasks: [...state.tasks, {
          ...task,
          id: Math.random().toString(36).substring(7),
          createdAt: new Date(),
        }]
      })),
      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map(task =>
          task.id === id ? { ...task, ...updates } : task
        )
      })),
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter(task => task.id !== id)
      })),
      toggleTaskComplete: (id) => set((state) => {
        const newTasks = state.tasks.map(task =>
          task.id === id ? { ...task, completed: !task.completed } : task
        )
        return {
          tasks: newTasks,
          completedTasksCount: newTasks.filter(t => t.completed).length
        }
      }),

      // Events
      events: [],
      addEvent: (event) => set((state) => ({
        events: [...state.events, {
          ...event,
          id: Math.random().toString(36).substring(7),
        }]
      })),
      updateEvent: (id, updates) => set((state) => ({
        events: state.events.map(event =>
          event.id === id ? { ...event, ...updates } : event
        )
      })),
      deleteEvent: (id) => set((state) => ({
        events: state.events.filter(event => event.id !== id)
      })),

      // Study Sessions
      studySessions: [],
      addStudySession: (session) => set((state) => ({
        studySessions: [...state.studySessions, session]
      })),

      // Progress
      completedTasksCount: 0,
      studyStreak: 0,
      updateProgress: () => set((state) => {
        const completedTasks = state.tasks.filter(t => t.completed).length

        // Calculate study streak
        const today = new Date().toDateString()
        const hasStudiedToday = state.studySessions.some(s =>
          new Date(s.date).toDateString() === today
        )

        return {
          completedTasksCount: completedTasks,
          studyStreak: hasStudiedToday ? state.studyStreak + 1 : state.studyStreak
        }
      }),

      // Timer
      timerSeconds: 0,
      isTimerRunning: false,
      setTimerSeconds: (seconds) => set({ timerSeconds: seconds }),
      setIsTimerRunning: (running) => set({ isTimerRunning: running }),
    }),
    {
      name: 'jai-learning-portal-storage',
    }
  )
)

export default useStore