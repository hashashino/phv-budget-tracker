'use client'

import { ReactNode, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/lib/api'
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Settings, 
  LogOut,
  Menu,
  X,
  ChevronDown,
  Receipt,
  TrendingUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { UserRole } from '@/types'

interface AdminLayoutProps {
  children: ReactNode
  userRole?: UserRole
  userName?: string
}

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['SUPER_ADMIN', 'FINANCE_MANAGER', 'OPERATIONS_ADMIN', 'TECHNICAL_ADMIN', 'CUSTOMER_SUPPORT']
  },
  {
    name: 'Users',
    href: '/users',
    icon: Users,
    roles: ['SUPER_ADMIN', 'OPERATIONS_ADMIN', 'CUSTOMER_SUPPORT']
  },
  {
    name: 'Financial Reports',
    href: '/reports',
    icon: CreditCard,
    roles: ['SUPER_ADMIN', 'FINANCE_MANAGER']
  },
  {
    name: 'System Settings',
    href: '/settings',
    icon: Settings,
    roles: ['SUPER_ADMIN', 'TECHNICAL_ADMIN']
  }
]

export default function AdminLayout({ children, userRole = 'SUPER_ADMIN', userName = 'Admin' }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // Filter navigation based on user role
  const allowedNavigation = navigationItems.filter(item => 
    item.roles.includes(userRole)
  )

  const handleLogout = async () => {
    console.log('Logout button clicked - starting logout process')
    try {
      console.log('Calling apiClient.logout()')
      const response = await apiClient.logout()
      console.log('Logout response:', response)
      apiClient.clearToken()
      console.log('Token cleared, redirecting to login')
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      // Clear token anyway and redirect
      console.log('Error occurred, clearing token anyway')
      apiClient.clearToken()
      router.push('/login')
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
        "lg:relative lg:translate-x-0"
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <h1 className="text-xl font-bold text-gray-900">PHV Admin</h1>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="px-4 py-6 space-y-2">
          {allowedNavigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive && "bg-blue-600 text-white hover:bg-blue-700"
                  )}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* User info and logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{userName}</p>
                <p className="text-xs text-gray-500">{userRole}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-0">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Role: <span className="font-medium text-gray-900">{userRole}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}