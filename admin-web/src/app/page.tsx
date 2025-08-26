'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to admin login
    router.push('/login')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">PHV Budget Tracker Admin</h1>
        <p className="text-gray-600 mt-2">Redirecting to admin login...</p>
      </div>
    </div>
  )
}
