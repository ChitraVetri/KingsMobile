import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { apiService } from '../services/api.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { formatCurrency, formatDate } from '../utils/formatters.jsx';
import {
  Package,
  ShoppingCart,
  Wrench,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  IndianRupee,
} from 'lucide-react';

export default function Dashboard() {
  const { user, isAdmin, isSalesStaff, isTechnician } = useAuth();
  const [stats, setStats] = useState({
    lowStockItems: [],
    recentSales: [],
    recentRepairs: [],
    loading: true,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const promises = [];

      // Load data based on user role
      if (isAdmin || isSalesStaff) {
        promises.push(
          apiService.getLowStockItems(),
          apiService.getSales({ limit: 5 })
        );
      }

      if (isAdmin || isTechnician) {
        promises.push(apiService.getRepairJobs({ limit: 5 }));
      }

      const results = await Promise.all(promises);
      
      let dataIndex = 0;
      const newStats = { ...stats };

      if (isAdmin || isSalesStaff) {
        newStats.lowStockItems = results[dataIndex++].lowStockItems;
        newStats.recentSales = results[dataIndex++].sales;
      }

      if (isAdmin || isTechnician) {
        newStats.recentRepairs = results[dataIndex++].repairJobs;
      }

      newStats.loading = false;
      setStats(newStats);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const getRepairStatusBadge = (status) => {
    const variants = {
      RECEIVED: 'secondary',
      IN_PROGRESS: 'warning',
      COMPLETED: 'success',
      DELIVERED: 'primary',
    };
    return variants[status] || 'default';
  };

  const formatRepairStatus = (status) => {
    return status.replace('_', ' ');
  };

  if (stats.loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-secondary-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-secondary-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.username}!
        </h1>
        <p className="text-primary-100">
          Here's what's happening with your business today.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(isAdmin || isSalesStaff) && (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-success-100 rounded-lg">
                    <ShoppingCart className="h-6 w-6 text-success-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-secondary-600">Total Sales</p>
                    <p className="text-2xl font-bold text-secondary-900">
                      {stats.recentSales?.length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-warning-100 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-warning-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-secondary-600">Low Stock Items</p>
                    <p className="text-2xl font-bold text-secondary-900">
                      {stats.lowStockItems?.totalCount || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {(isAdmin || isTechnician) && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Wrench className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-secondary-600">Active Repairs</p>
                  <p className="text-2xl font-bold text-secondary-900">
                    {stats.recentRepairs?.filter(r => r.status !== 'DELIVERED').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isAdmin && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-secondary-100 rounded-lg">
                  <Users className="h-6 w-6 text-secondary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-secondary-600">System Users</p>
                  <p className="text-2xl font-bold text-secondary-900">
                    Active
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        {(isAdmin || isSalesStaff) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Recent Sales
              </CardTitle>
              <CardDescription>
                Latest transactions from your store
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.recentSales?.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentSales.map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                      <div>
                        <p className="font-medium text-secondary-900">
                          Sale #{sale.id.slice(-8)}
                        </p>
                        <p className="text-sm text-secondary-600">
                          {formatDate(sale.createdAt)} • {sale.items?.length || 0} items
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-success-600">
                          {formatCurrency(sale.totalAmount)}
                        </p>
                        <Badge variant="outline" size="sm">
                          {sale.paymentMode}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-secondary-500">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-secondary-300" />
                  <p>No recent sales</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Recent Repairs */}
        {(isAdmin || isTechnician) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wrench className="h-5 w-5 mr-2" />
                Recent Repairs
              </CardTitle>
              <CardDescription>
                Latest repair jobs and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.recentRepairs?.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentRepairs.map((repair) => (
                    <div key={repair.id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                      <div>
                        <p className="font-medium text-secondary-900">
                          {repair.customer?.name}
                        </p>
                        <p className="text-sm text-secondary-600">
                          {repair.deviceInfo}
                        </p>
                        <p className="text-xs text-secondary-500 mt-1">
                          {formatDate(repair.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={getRepairStatusBadge(repair.status)} size="sm">
                          {formatRepairStatus(repair.status)}
                        </Badge>
                        {repair.totalCost > 0 && (
                          <p className="text-sm text-secondary-600 mt-1">
                            {formatCurrency(repair.totalCost)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-secondary-500">
                  <Wrench className="h-12 w-12 mx-auto mb-4 text-secondary-300" />
                  <p>No recent repairs</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Low Stock Alert */}
        {(isAdmin || isSalesStaff) && stats.lowStockItems?.totalCount > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center text-warning-700">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Low Stock Alert
              </CardTitle>
              <CardDescription>
                Items that need to be restocked soon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Retail Products */}
                {stats.lowStockItems.retailProducts?.length > 0 && (
                  <div>
                    <h4 className="font-medium text-secondary-900 mb-3">Retail Products</h4>
                    <div className="space-y-2">
                      {stats.lowStockItems.retailProducts.map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-2 bg-warning-50 rounded-lg border border-warning-200">
                          <div>
                            <p className="font-medium text-secondary-900">{product.name}</p>
                            <p className="text-sm text-secondary-600">{product.brand} {product.model}</p>
                          </div>
                          <Badge variant="warning" size="sm">
                            {product.quantity} left
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Repair Parts */}
                {stats.lowStockItems.repairParts?.length > 0 && (
                  <div>
                    <h4 className="font-medium text-secondary-900 mb-3">Repair Parts</h4>
                    <div className="space-y-2">
                      {stats.lowStockItems.repairParts.map((part) => (
                        <div key={part.id} className="flex items-center justify-between p-2 bg-warning-50 rounded-lg border border-warning-200">
                          <div>
                            <p className="font-medium text-secondary-900">{part.name}</p>
                            <p className="text-sm text-secondary-600">Part #{part.partNumber}</p>
                          </div>
                          <Badge variant="warning" size="sm">
                            {part.quantity} left
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
