'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserRole } from '@/types'
import { apiClient } from '@/lib/api'
import { X } from 'lucide-react'

interface AddUserModalProps {
  isOpen: boolean
  onClose: () => void
  onUserAdded: () => void
  currentUserRole: UserRole
}

export default function AddUserModal({ isOpen, onClose, onUserAdded, currentUserRole }: AddUserModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'USER',
    licenseNumber: '',
    vehicleNumber: '',
    phvCompany: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const userData = {
        ...formData,
        // Only include PHV fields if role is USER
        ...(formData.role === 'USER' && {
          licenseNumber: formData.licenseNumber,
          vehicleNumber: formData.vehicleNumber,
          phvCompany: formData.phvCompany
        })
      }

      const response = await apiClient.createUser(userData)
      
      if (response.success) {
        onUserAdded()
        onClose()
        // Reset form
        setFormData({
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          phone: '',
          role: 'USER',
          licenseNumber: '',
          vehicleNumber: '',
          phvCompany: ''
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user')
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

  if (!isOpen) return null

  // Role options based on current user role
  const availableRoles = currentUserRole === 'SUPER_ADMIN' 
    ? ['USER', 'CUSTOMER_SUPPORT', 'OPERATIONS_ADMIN', 'TECHNICAL_ADMIN', 'FINANCE_MANAGER', 'SUPER_ADMIN']
    : ['USER', 'CUSTOMER_SUPPORT']

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Add New User</CardTitle>
            <CardDescription>Create a new user account</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                  Password *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label htmlFor="firstName" className="block text-sm font-medium mb-1">
                  First Name *
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-1">
                  Phone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+65 9123 4567"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium mb-1">
                  Role *
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {availableRoles.map(role => (
                    <option key={role} value={role}>
                      {role.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* PHV specific fields - only show for USER role */}
            {formData.role === 'USER' && (
              <div className="border-t pt-4 mt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">PHV Driver Information</h4>
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
            )}

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create User'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}