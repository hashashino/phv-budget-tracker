'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Mail, Lock, Phone } from 'lucide-react'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    licenseNumber: '',
    vehicleNumber: '',
    phvCompany: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      if (data.success) {
        setSuccess(true)
        // Reset form
        setFormData({
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          phone: '',
          licenseNumber: '',
          vehicleNumber: '',
          phvCompany: ''
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-green-600">Registration Successful!</CardTitle>
            <CardDescription>
              Your PHV driver account has been created successfully.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                You can now use this account to log in to the PHV Budget Tracker mobile app.
              </p>
              <div className="flex space-x-3">
                <Button asChild className="flex-1">
                  <Link href="/register">Register Another User</Link>
                </Button>
                <Button variant="outline" asChild className="flex-1">
                  <Link href="/login">Back to Admin</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">PHV Driver Registration</CardTitle>
          <CardDescription>
            Create a new PHV driver account for testing
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="driver@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    minLength={8}
                    placeholder="Password123"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="firstName" className="block text-sm font-medium mb-1">
                  First Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="John"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium mb-1">
                  Last Name *
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="Doe"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-1">
                  Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+65 9123 4567"
                  />
                </div>
              </div>
            </div>

            {/* PHV Driver Information */}
            <div className="border-t pt-4 mt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">PHV Driver Information (Optional)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="licenseNumber" className="block text-sm font-medium mb-1">
                    License Number
                  </label>
                  <input
                    id="licenseNumber"
                    name="licenseNumber"
                    type="text"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="TD1234567Z"
                  />
                </div>

                <div>
                  <label htmlFor="vehicleNumber" className="block text-sm font-medium mb-1">
                    Vehicle Number
                  </label>
                  <input
                    id="vehicleNumber"
                    name="vehicleNumber"
                    type="text"
                    value={formData.vehicleNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="SLU1234Z"
                  />
                </div>

                <div>
                  <label htmlFor="phvCompany" className="block text-sm font-medium mb-1">
                    PHV Company
                  </label>
                  <select
                    id="phvCompany"
                    name="phvCompany"
                    value={formData.phvCompany}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Company</option>
                    <option value="Grab">Grab</option>
                    <option value="TADA">TADA</option>
                    <option value="Gojek">Gojek</option>
                    <option value="Ryde">Ryde</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex justify-between items-center pt-4">
              <Link href="/login" className="text-sm text-blue-600 hover:text-blue-500">
                Back to Admin Login
              </Link>
              <Button type="submit" disabled={isLoading} className="px-8">
                {isLoading ? 'Creating Account...' : 'Register PHV Driver'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}