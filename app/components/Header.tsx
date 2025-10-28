'use client'

import { useEffect, useState } from 'react'
import { GraduationCap, Sun, Moon } from 'lucide-react'
import { format } from 'date-fns'

export default function Header() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 17) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')

    return () => clearInterval(timer)
  }, [])

  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <GraduationCap className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Jai's Learning Portal</h1>
              <p className="text-sm opacity-90">Class 10th - CBSE</p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-lg font-semibold">{greeting}, Jai! 👋</p>
            <p className="text-sm opacity-90">
              {format(currentTime, 'EEEE, dd MMMM yyyy')}
            </p>
            <p className="text-xs opacity-75">
              {format(currentTime, 'hh:mm:ss a')}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}