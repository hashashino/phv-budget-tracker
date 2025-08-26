'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import AddUserModal from '@/components/AddUserModal'
import { User, UserRole } from '@/types'
import { apiClient } from '@/lib/api'
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Shield, 
  ShieldCheck,
  UserX,
  UserCheck,
  Plus
} from 'lucide-react'

// Real user management with CRUD operations

const roleColors: Record<UserRole, string> = {
  [UserRole.USER]: 'bg-gray-100 text-gray-800',
  [UserRole.CUSTOMER_SUPPORT]: 'bg-blue-100 text-blue-800',
  [UserRole.OPERATIONS_ADMIN]: 'bg-green-100 text-green-800',
  [UserRole.TECHNICAL_ADMIN]: 'bg-purple-100 text-purple-800',
  [UserRole.FINANCE_MANAGER]: 'bg-orange-100 text-orange-800',
  [UserRole.SUPER_ADMIN]: 'bg-red-100 text-red-800'
}

const getRoleIcon = (role: UserRole) => {
  switch (role) {
    case UserRole.SUPER_ADMIN:
    case UserRole.FINANCE_MANAGER:
      return <ShieldCheck className="h-4 w-4" />
    case UserRole.TECHNICAL_ADMIN:
    case UserRole.OPERATIONS_ADMIN:
      return <Shield className="h-4 w-4" />
    default:
      return null
  }
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [currentUserRole] = useState<UserRole>('SUPER_ADMIN') // TODO: Get from auth context

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true)
      try {
        const response = await apiClient.getUsers()
        console.log('Users response:', response)
        
        if (response.success && response.data?.users) {
          setUsers(response.data.users)
          setFilteredUsers(response.data.users)
        }
      } catch (error) {
        console.error('Failed to load users:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [])

  useEffect(() => {
    let filtered = users.filter(user => {
      const matchesSearch = 
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesRole = selectedRole === 'all' || user.role === selectedRole
      
      return matchesSearch && matchesRole
    })

    setFilteredUsers(filtered)
  }, [users, searchTerm, selectedRole])

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await apiClient.toggleUserStatus(userId, !currentStatus)
      
      if (response.success) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, isActive: !currentStatus } : user
        ))
        setFilteredUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, isActive: !currentStatus } : user
        ))
      }
    } catch (error) {
      console.error('Failed to toggle user status:', error)
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      const response = await apiClient.deleteUser(userId)
      
      if (response.success) {
        setUsers(prev => prev.filter(user => user.id !== userId))
        setFilteredUsers(prev => prev.filter(user => user.id !== userId))
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
      alert('Failed to delete user. Please try again.')
    }
  }

  const handleUserAdded = () => {
    // Reload users list
    const loadUsers = async () => {
      try {
        const response = await apiClient.getUsers()
        if (response.success && response.data?.users) {
          setUsers(response.data.users)
          setFilteredUsers(response.data.users)
        }
      } catch (error) {
        console.error('Failed to reload users:', error)
      }
    }
    loadUsers()
  }

  const canManageUsers = ['SUPER_ADMIN', 'OPERATIONS_ADMIN'].includes(currentUserRole)

  return (
    <AdminLayout userRole={currentUserRole} userName="John Admin">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-2">
              Manage PHV drivers and admin users
            </p>
          </div>
          
          {canManageUsers && (
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Roles</option>
                  <option value="USER">Drivers</option>
                  <option value="CUSTOMER_SUPPORT">Customer Support</option>
                  <option value="OPERATIONS_ADMIN">Operations Admin</option>
                  <option value="TECHNICAL_ADMIN">Technical Admin</option>
                  <option value="FINANCE_MANAGER">Finance Manager</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">User</th>
                    <th className="text-left py-3 px-4">Role</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Joined</th>
                    <th className="text-left py-3 px-4">PHV Info</th>
                    {canManageUsers && (
                      <th className="text-left py-3 px-4">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
                            {getRoleIcon(user.role)}
                            <span className="ml-1">{user.role.replace('_', ' ')}</span>
                          </span>
                        </div>
                      </td>
                      
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {user.isActive ? (
                            <>
                              <UserCheck className="h-4 w-4 text-green-500" />
                              <span className="text-green-700">Active</span>
                            </>
                          ) : (
                            <>
                              <UserX className="h-4 w-4 text-red-500" />
                              <span className="text-red-700">Inactive</span>
                            </>
                          )}
                          {user.isVerified && (
                            <span className="text-xs text-blue-600">✓ Verified</span>
                          )}
                        </div>
                      </td>
                      
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {user.role === UserRole.USER ? (
                          <div>
                            <div>License: {user.licenseNumber}</div>
                            <div>Vehicle: {user.vehicleNumber}</div>
                            <div>Company: {user.phvCompany}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                      
                      {canManageUsers && (
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant={user.isActive ? "destructive" : "default"}
                              size="sm"
                              onClick={() => toggleUserStatus(user.id, user.isActive)}
                            >
                              {user.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                            
                            {currentUserRole === 'SUPER_ADMIN' && (
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => deleteUser(user.id)}
                              >
                                Delete
                              </Button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No users found matching your criteria
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <AddUserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onUserAdded={handleUserAdded}
        currentUserRole={currentUserRole}
      />
    </AdminLayout>
  )
}