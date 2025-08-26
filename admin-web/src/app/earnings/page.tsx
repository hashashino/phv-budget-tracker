'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Search, 
  Filter, 
  Trash2,
  Calendar,
  TrendingUp,
  Car,
  Clock,
  DollarSign
} from 'lucide-react'
import { UserRole } from '@/types'
import { apiClient } from '@/lib/api'

export default function EarningsPage() {
  const [earnings, setEarnings] = useState<any[]>([])
  const [filteredEarnings, setFilteredEarnings] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [currentUserRole] = useState<UserRole>('SUPER_ADMIN')

  useEffect(() => {
    const loadEarnings = async () => {
      setLoading(true)
      try {
        const [earningsResponse, statsResponse] = await Promise.all([
          apiClient.getEarnings({ limit: 100 }),
          apiClient.getEarningStats()
        ])
        
        console.log('Earnings response:', earningsResponse)
        console.log('Earnings stats:', statsResponse)
        
        if (earningsResponse.success && earningsResponse.data?.earnings) {
          setEarnings(earningsResponse.data.earnings)
          setFilteredEarnings(earningsResponse.data.earnings)
        }
        
        if (statsResponse.success && statsResponse.data) {
          setStats(statsResponse.data)
        }
      } catch (error) {
        console.error('Failed to load earnings:', error)
      } finally {
        setLoading(false)
      }
    }

    loadEarnings()
  }, [])

  useEffect(() => {
    const filtered = earnings.filter(earning => 
      earning.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      earning.platform?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      earning.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      earning.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredEarnings(filtered)
  }, [earnings, searchTerm])

  const deleteEarning = async (earningId: string) => {
    if (!confirm('Are you sure you want to delete this earning record? This action cannot be undone.')) {
      return
    }

    try {
      const response = await apiClient.deleteEarning(earningId)
      
      if (response.success) {
        setEarnings(prev => prev.filter(earning => earning.id !== earningId))
        setFilteredEarnings(prev => prev.filter(earning => earning.id !== earningId))
      }
    } catch (error) {
      console.error('Failed to delete earning:', error)
      alert('Failed to delete earning. Please try again.')
    }
  }

  const canManageEarnings = ['SUPER_ADMIN', 'FINANCE_MANAGER', 'OPERATIONS_ADMIN'].includes(currentUserRole)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-SG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '-'
    return new Date(timeString).toLocaleTimeString('en-SG', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <AdminLayout userRole={currentUserRole} userName="John Admin">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Earnings Management</h1>
            <p className="text-gray-600 mt-2">
              View and manage user earnings across PHV platforms
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats ? formatCurrency(stats.totalNetAmount || 0) : 'Loading...'}
              </div>
              <p className="text-xs text-muted-foreground">
                Net earnings this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats ? (stats.totalCount || 0).toLocaleString() : 'Loading...'}
              </div>
              <p className="text-xs text-muted-foreground">
                Earning sessions tracked
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Session</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats && stats.totalCount > 0 
                  ? formatCurrency((stats.totalNetAmount || 0) / stats.totalCount) 
                  : formatCurrency(0)
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Per session average
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commission Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats && stats.totalGrossAmount > 0 
                  ? `${((stats.totalCommission || 0) / stats.totalGrossAmount * 100).toFixed(1)}%`
                  : '0%'
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Average commission
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search earnings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {filteredEarnings.length} of {earnings.length} sessions
                </span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">User</th>
                    <th className="text-left py-3 px-4">Platform</th>
                    <th className="text-left py-3 px-4">Gross</th>
                    <th className="text-left py-3 px-4">Commission</th>
                    <th className="text-left py-3 px-4">Net Earnings</th>
                    <th className="text-left py-3 px-4">Working Hours</th>
                    <th className="text-left py-3 px-4">Trips</th>
                    {canManageEarnings && (
                      <th className="text-left py-3 px-4">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={canManageEarnings ? 9 : 8} className="text-center py-8 text-gray-500">
                        Loading earnings...
                      </td>
                    </tr>
                  ) : filteredEarnings.length === 0 ? (
                    <tr>
                      <td colSpan={canManageEarnings ? 9 : 8} className="text-center py-8 text-gray-500">
                        No earnings found
                      </td>
                    </tr>
                  ) : (
                    filteredEarnings.map((earning) => (
                      <tr key={earning.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="text-sm font-medium">{formatDate(earning.date)}</div>
                              {earning.startTime && earning.endTime && (
                                <div className="text-xs text-gray-500">
                                  {formatTime(earning.startTime)} - {formatTime(earning.endTime)}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <div className="font-medium">
                              {earning.user?.firstName} {earning.user?.lastName}
                            </div>
                            <div className="text-gray-500">{earning.user?.email}</div>
                          </div>
                        </td>
                        
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {earning.platform?.name || 'Unknown'}
                          </span>
                        </td>
                        
                        <td className="py-3 px-4">
                          <div className="text-sm font-semibold">
                            {formatCurrency(earning.grossAmount)}
                          </div>
                        </td>
                        
                        <td className="py-3 px-4">
                          <div className="text-sm font-semibold text-red-600">
                            -{formatCurrency(earning.commission || 0)}
                          </div>
                        </td>
                        
                        <td className="py-3 px-4">
                          <div className="text-sm font-bold text-green-600">
                            {formatCurrency(earning.netAmount)}
                          </div>
                          {earning.tips > 0 && (
                            <div className="text-xs text-gray-500">
                              +{formatCurrency(earning.tips)} tips
                            </div>
                          )}
                        </td>
                        
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-sm">
                              {earning.workingHours ? `${earning.workingHours}h` : '-'}
                            </span>
                          </div>
                        </td>
                        
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-1">
                            <Car className="h-3 w-3 text-gray-400" />
                            <span className="text-sm">
                              {earning.trips || '-'}
                            </span>
                          </div>
                        </td>
                        
                        {canManageEarnings && (
                          <td className="py-3 px-4">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteEarning(earning.id)}
                              className="flex items-center space-x-1"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span>Delete</span>
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}