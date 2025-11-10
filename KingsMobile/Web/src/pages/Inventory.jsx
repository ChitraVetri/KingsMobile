import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { apiService } from '../services/api.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SmartDropdown } from '../components/ui/SmartDropdown';
import { formatCurrency } from '../utils/formatters.jsx';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  Smartphone,
  Wrench,
  Edit,
  Trash2,
  X,
  Save,
} from 'lucide-react';

export default function Inventory() {
  const { user, isAdmin, isSalesStaff } = useAuth();
  const [activeTab, setActiveTab] = useState('retail');
  const [retailProducts, setRetailProducts] = useState([]);
  const [repairParts, setRepairParts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  
  // Dropdown options extracted from existing data
  const [dropdownOptions, setDropdownOptions] = useState({
    brands: [],
    models: [],
    productNames: [],
    partNames: []
  });

  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = async () => {
    try {
      const [retailResponse, partsResponse, masterDataResponse] = await Promise.all([
        apiService.getRetailProducts(),
        apiService.getRepairParts(),
        apiService.getAllMasterData()
      ]);
      
      const products = retailResponse.products || [];
      const parts = partsResponse.repairParts || [];
      
      setRetailProducts(products);
      setRepairParts(parts);
      
      // Use master data for dropdown options
      const masterData = masterDataResponse;
      setDropdownOptions({
        brands: masterData.brands?.map(b => b.name) || [],
        models: masterData.models?.map(m => m.name) || [],
        productNames: masterData.productNames?.map(p => p.name) || [],
        partNames: masterData.partNames?.map(p => p.name) || []
      });
    } catch (error) {
      console.error('Failed to load inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStockBadge = (quantity, threshold) => {
    if (quantity <= threshold) return { variant: 'danger', text: 'Low Stock' };
    if (quantity <= threshold * 2) return { variant: 'warning', text: 'Medium' };
    return { variant: 'success', text: 'In Stock' };
  };

  // CRUD Operations
  const handleAdd = () => {
    setFormData(activeTab === 'retail' ? {
      name: '',
      brand: '',
      model: '',
      category: 'Mobile Phone',
      variants: '{}',
      costPrice: '',
      sellingPrice: '',
      gstRate: '18',
      quantity: '',
      lowStockThreshold: '5',
      barcode: '',
      imei: ''
    } : {
      name: '',
      partNumber: '',
      compatibleModels: '',
      cost: '',
      quantity: '',
      lowStockThreshold: '5'
    });
    setShowAddModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({ ...item });
    setShowEditModal(true);
  };

  const handleDelete = async (item) => {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;
    
    try {
      if (activeTab === 'retail') {
        await apiService.updateRetailProduct(item.id, { ...item, quantity: 0 });
      } else {
        await apiService.updateRepairPart(item.id, { ...item, quantity: 0 });
      }
      await loadInventoryData();
      alert('Item marked as out of stock successfully!');
    } catch (error) {
      alert('Failed to update item: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (showAddModal) {
        // Add new item
        if (activeTab === 'retail') {
          await apiService.createRetailProduct({
            ...formData,
            costPrice: parseFloat(formData.costPrice),
            sellingPrice: parseFloat(formData.sellingPrice),
            gstRate: parseFloat(formData.gstRate),
            quantity: parseInt(formData.quantity),
            lowStockThreshold: parseInt(formData.lowStockThreshold),
            imei: formData.imei || null
          });
        } else {
          await apiService.createRepairPart({
            ...formData,
            cost: parseFloat(formData.cost),
            quantity: parseInt(formData.quantity),
            lowStockThreshold: parseInt(formData.lowStockThreshold)
          });
        }
        alert('Item added successfully!');
      } else {
        // Update existing item
        if (activeTab === 'retail') {
          await apiService.updateRetailProduct(editingItem.id, {
            ...formData,
            costPrice: parseFloat(formData.costPrice),
            sellingPrice: parseFloat(formData.sellingPrice),
            gstRate: parseFloat(formData.gstRate),
            quantity: parseInt(formData.quantity),
            lowStockThreshold: parseInt(formData.lowStockThreshold),
            imei: formData.imei || null
          });
        } else {
          await apiService.updateRepairPart(editingItem.id, {
            ...formData,
            cost: parseFloat(formData.cost),
            quantity: parseInt(formData.quantity),
            lowStockThreshold: parseInt(formData.lowStockThreshold)
          });
        }
        alert('Item updated successfully!');
      }
      
      await loadInventoryData();
      setShowAddModal(false);
      setShowEditModal(false);
      setEditingItem(null);
      setFormData({});
    } catch (error) {
      alert('Failed to save item: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Manage your retail products and repair parts</p>
        </div>
        {(isAdmin || isSalesStaff) && (
          <Button onClick={handleAdd} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add {activeTab === 'retail' ? 'Product' : 'Part'}</span>
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('retail')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'retail'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Smartphone className="h-4 w-4" />
              <span>Retail Products</span>
              <Badge variant="secondary" size="sm">{retailProducts.length}</Badge>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('parts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'parts'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Wrench className="h-4 w-4" />
              <span>Repair Parts</span>
              <Badge variant="secondary" size="sm">{repairParts.length}</Badge>
            </div>
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'retail' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {retailProducts.map((product) => {
            const stockBadge = getStockBadge(product.quantity, product.lowStockThreshold);
            return (
              <Card key={product.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <CardDescription>
                        {product.brand} {product.model}
                      </CardDescription>
                    </div>
                    <Badge variant={stockBadge.variant} size="sm">
                      {stockBadge.text}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Category:</span>
                      <span className="text-sm font-medium">{product.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Stock:</span>
                      <span className="text-sm font-medium">{product.quantity} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Price:</span>
                      <span className="text-sm font-bold text-green-600">
                        {formatCurrency(product.sellingPrice)}
                      </span>
                    </div>
                    {product.imei && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">IMEI:</span>
                        <span className="text-sm font-mono text-gray-800">{product.imei}</span>
                      </div>
                    )}
                    {product.quantity <= product.lowStockThreshold && (
                      <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-2 rounded">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-xs">Low stock alert!</span>
                      </div>
                    )}
                    
                    {(isAdmin || isSalesStaff) && (
                      <div className="flex space-x-2 mt-4 pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(product)}
                          className="flex-1"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(product)}
                          className="flex-1"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {repairParts.map((part) => {
            const stockBadge = getStockBadge(part.quantity, part.lowStockThreshold);
            return (
              <Card key={part.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{part.name}</CardTitle>
                      <CardDescription>
                        Part #{part.partNumber}
                      </CardDescription>
                    </div>
                    <Badge variant={stockBadge.variant} size="sm">
                      {stockBadge.text}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Compatible:</span>
                      <span className="text-sm font-medium">{part.compatibleModels}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Stock:</span>
                      <span className="text-sm font-medium">{part.quantity} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Cost:</span>
                      <span className="text-sm font-bold text-blue-600">
                        {formatCurrency(part.cost)}
                      </span>
                    </div>
                    {part.quantity <= part.lowStockThreshold && (
                      <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-2 rounded">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-xs">Low stock alert!</span>
                      </div>
                    )}
                    
                    {(isAdmin || isSalesStaff) && (
                      <div className="flex space-x-2 mt-4 pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(part)}
                          className="flex-1"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(part)}
                          className="flex-1"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  {showAddModal ? 'Add New' : 'Edit'} {activeTab === 'retail' ? 'Product' : 'Repair Part'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setEditingItem(null);
                    setFormData({});
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {activeTab === 'retail' ? (
                  <>
                    {/* Retail Product Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <SmartDropdown
                        label="Product Name"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleInputChange}
                        options={dropdownOptions.productNames}
                        required
                        placeholder="Select or add new product name"
                      />
                      <SmartDropdown
                        label="Brand"
                        name="brand"
                        value={formData.brand || ''}
                        onChange={handleInputChange}
                        options={dropdownOptions.brands}
                        required
                        placeholder="Select or add new brand"
                      />
                      <SmartDropdown
                        label="Model"
                        name="model"
                        value={formData.model || ''}
                        onChange={handleInputChange}
                        options={dropdownOptions.models}
                        required
                        placeholder="Select or add new model"
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category
                        </label>
                        <select
                          name="category"
                          value={formData.category || 'Mobile Phone'}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="Mobile Phone">Mobile Phone</option>
                          <option value="Tablet">Tablet</option>
                          <option value="Accessory">Accessory</option>
                          <option value="Case">Case</option>
                          <option value="Charger">Charger</option>
                        </select>
                      </div>
                      <Input
                        label="Cost Price (₹)"
                        name="costPrice"
                        type="number"
                        step="0.01"
                        value={formData.costPrice || ''}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., 50000"
                      />
                      <Input
                        label="Selling Price (₹)"
                        name="sellingPrice"
                        type="number"
                        step="0.01"
                        value={formData.sellingPrice || ''}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., 60000"
                      />
                      <Input
                        label="GST Rate (%)"
                        name="gstRate"
                        type="number"
                        step="0.01"
                        value={formData.gstRate || '18'}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., 18"
                      />
                      <Input
                        label="Quantity"
                        name="quantity"
                        type="number"
                        value={formData.quantity || ''}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., 10"
                      />
                      <Input
                        label="Low Stock Threshold"
                        name="lowStockThreshold"
                        type="number"
                        value={formData.lowStockThreshold || '5'}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., 5"
                      />
                      <Input
                        label="Barcode (Optional)"
                        name="barcode"
                        value={formData.barcode || ''}
                        onChange={handleInputChange}
                        placeholder="e.g., 1234567890123"
                      />
                      <Input
                        label="IMEI Number (Optional)"
                        name="imei"
                        value={formData.imei || ''}
                        onChange={handleInputChange}
                        placeholder="e.g., 123456789012345"
                        maxLength="15"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {/* Repair Part Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <SmartDropdown
                        label="Part Name"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleInputChange}
                        options={dropdownOptions.partNames}
                        required
                        placeholder="Select or add new part name"
                      />
                      <Input
                        label="Part Number"
                        name="partNumber"
                        value={formData.partNumber || ''}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., IP15P-DISP-001"
                      />
                      <div className="md:col-span-2">
                        <Input
                          label="Compatible Models"
                          name="compatibleModels"
                          value={formData.compatibleModels || ''}
                          onChange={handleInputChange}
                          required
                          placeholder="e.g., iPhone 15 Pro, iPhone 15 Pro Max"
                        />
                      </div>
                      <Input
                        label="Cost (₹)"
                        name="cost"
                        type="number"
                        step="0.01"
                        value={formData.cost || ''}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., 5500"
                      />
                      <Input
                        label="Quantity"
                        name="quantity"
                        type="number"
                        value={formData.quantity || ''}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., 20"
                      />
                      <Input
                        label="Low Stock Threshold"
                        name="lowStockThreshold"
                        type="number"
                        value={formData.lowStockThreshold || '5'}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., 5"
                      />
                    </div>
                  </>
                )}

                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      setEditingItem(null);
                      setFormData({});
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={submitting}
                    className="flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{showAddModal ? 'Add' : 'Update'} {activeTab === 'retail' ? 'Product' : 'Part'}</span>
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
