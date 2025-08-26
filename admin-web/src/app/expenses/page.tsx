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
  DollarSign,
  Receipt,
  FileText
} from 'lucide-react'
import { UserRole } from '@/types'
import { apiClient } from '@/lib/api'

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([])
  const [filteredExpenses, setFilteredExpenses] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [currentUserRole] = useState<UserRole>('SUPER_ADMIN')

  useEffect(() => {
    const loadExpenses = async () => {
      setLoading(true)
      try {
        const [expensesResponse, statsResponse] = await Promise.all([
          apiClient.getExpenses({ limit: 100 }),
          apiClient.getExpenseStats()
        ])
        
        console.log('Expenses response:', expensesResponse)
        console.log('Stats response:', statsResponse)
        
        if (expensesResponse.success && expensesResponse.data?.expenses) {
          setExpenses(expensesResponse.data.expenses)
          setFilteredExpenses(expensesResponse.data.expenses)
        }
        
        if (statsResponse.success && statsResponse.data) {
          setStats(statsResponse.data)
        }
      } catch (error) {
        console.error('Failed to load expenses:', error)
      } finally {
        setLoading(false)
      }
    }

    loadExpenses()
  }, [])

  useEffect(() => {
    const filtered = expenses.filter(expense => 
      expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.location?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredExpenses(filtered)
  }, [expenses, searchTerm])

  const deleteExpense = async (expenseId: string) => {
    if (!confirm('Are you sure you want to delete this expense? This action cannot be undone.')) {
      return
    }

    try {
      const response = await apiClient.deleteExpense(expenseId)
      
      if (response.success) {
        setExpenses(prev => prev.filter(expense => expense.id !== expenseId))
        setFilteredExpenses(prev => prev.filter(expense => expense.id !== expenseId))
      }
    } catch (error) {
      console.error('Failed to delete expense:', error)
      alert('Failed to delete expense. Please try again.')
    }
  }

  const canManageExpenses = ['SUPER_ADMIN', 'FINANCE_MANAGER', 'OPERATIONS_ADMIN'].includes(currentUserRole)

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

  return (
    <AdminLayout userRole={currentUserRole} userName="John Admin">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Expense Management</h1>
            <p className="text-gray-600 mt-2">
              View and manage user expenses across the platform
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats ? formatCurrency(stats.totalAmount || 0) : 'Loading...'}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all users this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats ? (stats.totalCount || 0).toLocaleString() : 'Loading...'}
              </div>
              <p className="text-xs text-muted-foreground">
                Expense records tracked
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Expense</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats && stats.totalCount > 0 
                  ? formatCurrency(stats.totalAmount / stats.totalCount) 
                  : formatCurrency(0)
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Per transaction
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
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {filteredExpenses.length} of {expenses.length} expenses
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
                    <th className="text-left py-3 px-4">Description</th>
                    <th className="text-left py-3 px-4">Amount</th>
                    <th className="text-left py-3 px-4">User</th>
                    <th className="text-left py-3 px-4">Category</th>
                    <th className="text-left py-3 px-4">Location</th>
                    {canManageExpenses && (
                      <th className="text-left py-3 px-4">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={canManageExpenses ? 7 : 6} className="text-center py-8 text-gray-500">
                        Loading expenses...
                      </td>
                    </tr>
                  ) : filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={canManageExpenses ? 7 : 6} className="text-center py-8 text-gray-500">
                        No expenses found
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((expense) => (
                      <tr key={expense.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{formatDate(expense.date)}</span>
                          </div>
                        </td>
                        
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-900">
                              {expense.description}
                            </div>
                            {expense.notes && (
                              <div className="text-sm text-gray-500 mt-1">
                                {expense.notes}
                              </div>
                            )}
                          </div>
                        </td>
                        
                        <td className="py-3 px-4">
                          <div className="font-semibold text-red-600">
                            {formatCurrency(expense.amount)}
                          </div>
                          {expense.includeGst && (
                            <div className="text-xs text-gray-500">Inc. GST</div>
                          )}
                        </td>
                        
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <div className="font-medium">
                              {expense.user?.firstName} {expense.user?.lastName}
                            </div>
                            <div className="text-gray-500">{expense.user?.email}</div>
                          </div>
                        </td>
                        
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {expense.category?.name || 'Uncategorized'}
                          </span>
                        </td>
                        
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {expense.location || '-'}
                        </td>
                        
                        {canManageExpenses && (
                          <td className="py-3 px-4">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteExpense(expense.id)}
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