import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { ShoppingCart, Scan, CreditCard } from 'lucide-react';

export default function PointOfSale() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Point of Sale</h1>
        <p className="text-gray-600">Process sales and manage transactions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Sales Cart
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">POS System Coming Soon</p>
              <p className="text-sm">This module is under development</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Scan className="h-5 w-5 mr-2" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50">
                  <div className="font-medium">Scan Barcode</div>
                  <div className="text-sm text-gray-500">Add product by scanning</div>
                </button>
                <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50">
                  <div className="font-medium">Search Product</div>
                  <div className="text-sm text-gray-500">Find products manually</div>
                </button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <p>Payment processing will be available here</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
