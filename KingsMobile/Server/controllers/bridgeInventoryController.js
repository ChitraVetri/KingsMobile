const { validationResult } = require('express-validator');
const prisma = require('../utils/prisma');

// BRIDGE CONTROLLER: Maintains compatibility while using new hierarchical structure

// Get all retail products - Bridge function that combines old and new data
const getAllRetailProducts = async (req, res) => {
  try {
    const { category, brand, lowStock } = req.query;
    
    // Get data from new hierarchical structure
    const whereClause = {};
    if (category) whereClause.category = category;
    if (brand) whereClause.brand = brand;
    
    const products = await prisma.product.findMany({
      where: {
        ...whereClause,
        productType: 'MOBILE_PHONE',
        isActive: true
      },
      include: {
        variants: {
          include: {
            locationStocks: {
              include: {
                location: true
              }
            },
            serializedItems: {
              where: {
                status: 'IN_STOCK'
              }
            }
          }
        }
      }
    });

    // Transform to old format for frontend compatibility
    const transformedProducts = [];
    
    for (const product of products) {
      for (const variant of product.variants) {
        // Calculate total quantity across all locations
        const totalQuantity = variant.locationStocks.reduce((sum, stock) => sum + stock.quantity, 0);
        
        // Skip if filtering for low stock
        if (lowStock === 'true' && totalQuantity > variant.lowStockThreshold) {
          continue;
        }
        
        // Get first serialized item for IMEI (if exists)
        const firstSerializedItem = variant.serializedItems[0];
        
        // Transform to old RetailProduct format
        transformedProducts.push({
          id: variant.id, // Use variant ID as product ID for compatibility
          name: product.name,
          category: product.category,
          brand: product.brand,
          model: product.model,
          variants: JSON.stringify({
            color: variant.color,
            storage: variant.storage,
            carrier: variant.carrier
          }),
          imei: firstSerializedItem?.imei || null,
          purchasePrice: variant.purchasePrice,
          sellingPrice: variant.sellingPrice,
          gstRate: variant.gstRate,
          quantity: totalQuantity,
          barcode: firstSerializedItem?.barcode || null,
          lowStockThreshold: variant.lowStockThreshold,
          createdAt: variant.createdAt,
          updatedAt: variant.updatedAt,
          // Additional info for debugging
          _isHierarchical: true,
          _variantId: variant.id,
          _productId: product.id
        });
      }
    }

    // Also get legacy products for complete compatibility
    const legacyProducts = await prisma.retailProduct.findMany({
      where: {
        // Add any additional filters here
      },
      orderBy: { createdAt: 'desc' }
    });

    // Mark legacy products
    const markedLegacyProducts = legacyProducts.map(product => ({
      ...product,
      variants: typeof product.variants === 'string' ? product.variants : JSON.stringify(product.variants),
      _isHierarchical: false
    }));

    // Combine both datasets
    const allProducts = [...transformedProducts, ...markedLegacyProducts];

    res.json({
      products: allProducts,
      totalCount: allProducts.length,
      hierarchicalCount: transformedProducts.length,
      legacyCount: legacyProducts.length
    });

  } catch (error) {
    console.error('Get retail products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create retail product - Bridge function that creates in new structure
const createRetailProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      category,
      brand,
      model,
      variants,
      imei,
      purchasePrice,
      sellingPrice,
      gstRate,
      quantity,
      barcode,
      lowStockThreshold
    } = req.body;

    // Parse variants if it's a string
    let variantData = {};
    if (typeof variants === 'string') {
      try {
        variantData = JSON.parse(variants);
      } catch (e) {
        variantData = {};
      }
    } else {
      variantData = variants || {};
    }

    // Check if IMEI already exists
    if (imei) {
      const existingSerial = await prisma.serializedItem.findUnique({
        where: { imei }
      });
      if (existingSerial) {
        return res.status(400).json({ error: 'IMEI already exists' });
      }
    }

    // Get default location
    let defaultLocation = await prisma.location.findFirst({
      where: { type: 'STORE', isActive: true }
    });

    if (!defaultLocation) {
      // Create default location if none exists
      defaultLocation = await prisma.location.create({
        data: {
          name: 'Main Store',
          type: 'STORE',
          isActive: true
        }
      });
    }

    // Create in new hierarchical structure
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create or find product
      let product = await tx.product.findFirst({
        where: {
          name,
          brand,
          model
        }
      });

      if (!product) {
        product = await tx.product.create({
          data: {
            name,
            category,
            brand,
            model,
            productType: 'MOBILE_PHONE',
            isActive: true
          }
        });
      }

      // 2. Create variant
      const sku = `${brand.substring(0, 3).toUpperCase()}-${model.substring(0, 3).toUpperCase()}-${Date.now()}`;
      
      const variant = await tx.productVariant.create({
        data: {
          productId: product.id,
          color: variantData.color || 'Default',
          storage: variantData.storage || null,
          carrier: variantData.carrier || 'Unlocked',
          sku,
          purchasePrice: parseFloat(purchasePrice),
          sellingPrice: parseFloat(sellingPrice),
          gstRate: parseFloat(gstRate) || 18,
          lowStockThreshold: parseInt(lowStockThreshold) || 5
        }
      });

      // 3. Create location stock
      await tx.locationStock.create({
        data: {
          variantId: variant.id,
          locationId: defaultLocation.id,
          quantity: parseInt(quantity),
          reservedQuantity: 0,
          availableQuantity: parseInt(quantity)
        }
      });

      // 4. Create serialized items if IMEI provided
      if (imei) {
        const serializedItem = await tx.serializedItem.create({
          data: {
            variantId: variant.id,
            imei,
            barcode,
            condition: 'NEW',
            status: 'IN_STOCK',
            locationId: defaultLocation.id,
            notes: 'Created via legacy API'
          }
        });

        // 5. Create history entry
        const adminUser = await tx.user.findFirst({ where: { role: 'ADMIN' } });
        await tx.deviceHistory.create({
          data: {
            serializedItemId: serializedItem.id,
            event: 'RECEIVED',
            description: 'Product created via legacy API',
            toLocationId: defaultLocation.id,
            userId: adminUser?.id || 'system'
          }
        });
      }

      return { product, variant };
    });

    // Return in old format for compatibility
    const responseProduct = {
      id: result.variant.id,
      name,
      category,
      brand,
      model,
      variants: JSON.stringify(variantData),
      imei,
      purchasePrice: parseFloat(purchasePrice),
      sellingPrice: parseFloat(sellingPrice),
      gstRate: parseFloat(gstRate) || 18,
      quantity: parseInt(quantity),
      barcode,
      lowStockThreshold: parseInt(lowStockThreshold) || 5,
      createdAt: result.variant.createdAt,
      updatedAt: result.variant.updatedAt,
      _isHierarchical: true,
      _variantId: result.variant.id,
      _productId: result.product.id
    };

    res.status(201).json({
      message: 'Product created successfully',
      product: responseProduct
    });

  } catch (error) {
    console.error('Create retail product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update retail product - Bridge function
const updateRetailProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = { ...req.body };

    // Try to find in new structure first (by variant ID)
    let variant = await prisma.productVariant.findUnique({
      where: { id },
      include: {
        product: true,
        locationStocks: true,
        serializedItems: true
      }
    });

    if (variant) {
      // Update in new structure
      const updatedVariant = await prisma.$transaction(async (tx) => {
        // Update variant
        const updated = await tx.productVariant.update({
          where: { id },
          data: {
            purchasePrice: updateData.purchasePrice ? parseFloat(updateData.purchasePrice) : undefined,
            sellingPrice: updateData.sellingPrice ? parseFloat(updateData.sellingPrice) : undefined,
            gstRate: updateData.gstRate ? parseFloat(updateData.gstRate) : undefined,
            lowStockThreshold: updateData.lowStockThreshold ? parseInt(updateData.lowStockThreshold) : undefined
          }
        });

        // Update product if needed
        if (updateData.name || updateData.category || updateData.brand || updateData.model) {
          await tx.product.update({
            where: { id: variant.productId },
            data: {
              name: updateData.name || undefined,
              category: updateData.category || undefined,
              brand: updateData.brand || undefined,
              model: updateData.model || undefined
            }
          });
        }

        // Update quantity in location stock
        if (updateData.quantity !== undefined) {
          const locationStock = variant.locationStocks[0];
          if (locationStock) {
            await tx.locationStock.update({
              where: { id: locationStock.id },
              data: {
                quantity: parseInt(updateData.quantity),
                availableQuantity: parseInt(updateData.quantity)
              }
            });
          }
        }

        // Update IMEI if provided
        if (updateData.imei && variant.serializedItems[0]) {
          await tx.serializedItem.update({
            where: { id: variant.serializedItems[0].id },
            data: {
              imei: updateData.imei,
              barcode: updateData.barcode || undefined
            }
          });
        }

        return updated;
      });

      // Return in old format
      const totalQuantity = variant.locationStocks.reduce((sum, stock) => sum + stock.quantity, 0);
      
      res.json({
        message: 'Product updated successfully',
        product: {
          id: updatedVariant.id,
          name: variant.product.name,
          category: variant.product.category,
          brand: variant.product.brand,
          model: variant.product.model,
          variants: JSON.stringify({
            color: updatedVariant.color,
            storage: updatedVariant.storage,
            carrier: updatedVariant.carrier
          }),
          imei: variant.serializedItems[0]?.imei || null,
          purchasePrice: updatedVariant.purchasePrice,
          sellingPrice: updatedVariant.sellingPrice,
          gstRate: updatedVariant.gstRate,
          quantity: totalQuantity,
          barcode: variant.serializedItems[0]?.barcode || null,
          lowStockThreshold: updatedVariant.lowStockThreshold,
          createdAt: updatedVariant.createdAt,
          updatedAt: updatedVariant.updatedAt,
          _isHierarchical: true
        }
      });

    } else {
      // Fall back to legacy update
      const existingProduct = await prisma.retailProduct.findUnique({
        where: { id }
      });

      if (!existingProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Handle variants
      if (updateData.variants) {
        updateData.variants = JSON.stringify(updateData.variants);
      }

      // Convert numeric fields
      if (updateData.purchasePrice) updateData.purchasePrice = parseFloat(updateData.purchasePrice);
      if (updateData.sellingPrice) updateData.sellingPrice = parseFloat(updateData.sellingPrice);
      if (updateData.gstRate) updateData.gstRate = parseFloat(updateData.gstRate);
      if (updateData.quantity) updateData.quantity = parseInt(updateData.quantity);
      if (updateData.lowStockThreshold) updateData.lowStockThreshold = parseInt(updateData.lowStockThreshold);

      const updatedProduct = await prisma.retailProduct.update({
        where: { id },
        data: updateData
      });

      const responseProduct = {
        ...updatedProduct,
        variants: JSON.parse(updatedProduct.variants),
        _isHierarchical: false
      };

      res.json({
        message: 'Product updated successfully',
        product: responseProduct
      });
    }

  } catch (error) {
    console.error('Update retail product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllRetailProducts,
  createRetailProduct,
  updateRetailProduct
};
