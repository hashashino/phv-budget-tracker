'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, CreditCard, TrendingUp, AlertCircle } from 'lucide-react'
import { AdminStats, UserRole } from '@/types'
import { apiClient } from '@/lib/api'

// Real dashboard stats from API

const StatCard = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend 
}: { 
  title: string
  value: string | number
  description: string
  icon: any
  trend?: string
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">
        {description}
        {trend && <span className="text-green-600 ml-1">{trend}</span>}
      </p>
    </CardContent>
  </Card>
)

export default function DashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [userRole] = useState<UserRole>('SUPER_ADMIN') // TODO: Get from auth context
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true)
      try {
        const response = await apiClient.getStats()
        console.log('Dashboard stats:', response)
        
        if (response.success && response.data) {
          setStats(response.data)
        }
      } catch (error) {
        console.error('Failed to load stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  const getDashboardContent = () => {
    if (!stats) {
      return (
        <>
          <StatCard title="Loading..." value="..." description="Fetching data..." icon={Users} />
          <StatCard title="Loading..." value="..." description="Fetching data..." icon={TrendingUp} />
          <StatCard title="Loading..." value="..." description="Fetching data..." icon={AlertCircle} />
        </>
      )
    }

    switch (userRole) {
      case 'CUSTOMER_SUPPORT':
        return (
          <>
            <StatCard
              title="Active Users"
              value={stats.activeUsers?.toLocaleString() || '0'}
              description="Currently using the platform"
              icon={Users}
            />
            <StatCard
              title="Recent Registrations"
              value={stats.recentRegistrations || 0}
              description="New users this week"
              icon={TrendingUp}
              trend="+12%"
            />
            <StatCard
              title="Support Tickets"
              value="7"
              description="Open tickets requiring attention"
              icon={AlertCircle}
            />
          </>
        )

      case 'OPERATIONS_ADMIN':
        return (
          <>
            <StatCard
              title="Total Users"
              value={stats.totalUsers?.toLocaleString() || '0'}
              description="Registered PHV drivers"
              icon={Users}
            />
            <StatCard
              title="Active Users"
              value={stats.activeUsers?.toLocaleString() || '0'}
              description="Users active this month"
              icon={Users}
              trend="+5.2%"
            />
            <StatCard
              title="Platform Utilization"
              value="78%"
              description="Average daily active rate"
              icon={TrendingUp}
            />
          </>
        )

      case 'TECHNICAL_ADMIN':
        return (
          <>
            <StatCard
              title="System Health"
              value="99.9%"
              description="Uptime this month"
              icon={TrendingUp}
            />
            <StatCard
              title="API Requests"
              value="2.4M"
              description="Requests this month"
              icon={Users}
              trend="+8%"
            />
            <StatCard
              title="Error Rate"
              value="0.12%"
              description="Errors in last 24h"
              icon={AlertCircle}
            />
          </>
        )

      case 'FINANCE_MANAGER':
        return (
          <>
            <StatCard
              title="Total Earnings"
              value={`$${stats.totalEarnings?.toLocaleString() || '0'}`}
              description="Platform earnings this month"
              icon={CreditCard}
              trend="+15%"
            />
            <StatCard
              title="Total Expenses"
              value={`$${stats.totalExpenses?.toLocaleString() || '0'}`}
              description="Tracked expenses this month"
              icon={CreditCard}
            />
            <StatCard
              title="Revenue Growth"
              value="12.5%"
              description="Month over month growth"
              icon={TrendingUp}
            />
          </>
        )

      case 'SUPER_ADMIN':
      default:
        return (
          <>
            <StatCard
              title="Total Users"
              value={stats.totalUsers?.toLocaleString() || '0'}
              description="Registered PHV drivers"
              icon={Users}
            />
            <StatCard
              title="Total Earnings"
              value={`$${stats.totalEarnings?.toLocaleString() || '0'}`}
              description="Platform earnings tracked"
              icon={CreditCard}
              trend="+15%"
            />
            <StatCard
              title="System Health"
              value="99.9%"
              description="Uptime this month"
              icon={TrendingUp}
            />
            <StatCard
              title="Recent Activity"
              value={stats.recentRegistrations || 0}
              description="New registrations this week"
              icon={AlertCircle}
              trend="+12%"
            />
          </>
        )
    }
  }

  return (
    <AdminLayout userRole={userRole} userName="John Admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome to the PHV Budget Tracker administration panel
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {getDashboardContent()}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest platform activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">New user registration: john.doe@email.com</span>
                  <span className="text-xs text-gray-500">2 mins ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Expense uploaded: SGD 45.50</span>
                  <span className="text-xs text-gray-500">5 mins ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Banking connection established</span>
                  <span className="text-xs text-gray-500">12 mins ago</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <button className="w-full text-left p-3 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="font-medium">View User Reports</div>
                <div className="text-sm text-gray-600">Generate user activity reports</div>
              </button>
              <button className="w-full text-left p-3 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="font-medium">System Health Check</div>
                <div className="text-sm text-gray-600">Monitor system performance</div>
              </button>
              <button className="w-full text-left p-3 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="font-medium">Financial Summary</div>
                <div className="text-sm text-gray-600">View financial analytics</div>
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}