const { validationResult } = require('express-validator');
const prisma = require('../utils/prisma');

// Indian GST Configuration (Industry Standard)
const GST_CONFIG = {
  CGST_RATE: 9, // Central GST (9% for 18% total GST)
  SGST_RATE: 9, // State GST (9% for 18% total GST)
  IGST_RATE: 18, // Integrated GST (for inter-state transactions)
  HSN_CODE_MOBILE: '85171200', // HSN Code for Mobile Phones
  HSN_CODE_ACCESSORIES: '85444900', // HSN Code for Mobile Accessories
  INVOICE_PREFIX: 'KM', // Kings Mobile invoice prefix
  FINANCIAL_YEAR_START: 4 // April (Indian Financial Year)
};

// Generate Invoice Number (Industry Standard Format)
const generateInvoiceNumber = async () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  // Determine financial year (April to March)
  const financialYear = currentMonth >= GST_CONFIG.FINANCIAL_YEAR_START 
    ? `${currentYear}-${(currentYear + 1).toString().slice(-2)}`
    : `${currentYear - 1}-${currentYear.toString().slice(-2)}`;

  // Get current invoice count for this financial year
  const invoiceCount = await prisma.sale.count({
    where: {
      createdAt: {
        gte: new Date(currentMonth >= GST_CONFIG.FINANCIAL_YEAR_START 
          ? `${currentYear}-04-01` 
          : `${currentYear - 1}-04-01`),
        lt: new Date(currentMonth >= GST_CONFIG.FINANCIAL_YEAR_START 
          ? `${currentYear + 1}-04-01` 
          : `${currentYear}-04-01`)
      }
    }
  });

  const invoiceNumber = `${GST_CONFIG.INVOICE_PREFIX}/${financialYear}/${String(invoiceCount + 1).padStart(4, '0')}`;
  return invoiceNumber;
};

// Calculate GST Breakdown (Industry Standard)
const calculateGST = (amount, gstRate, isInterState = false) => {
  const baseAmount = amount / (1 + gstRate / 100);
  const totalGst = amount - baseAmount;
  
  if (isInterState) {
    return {
      baseAmount: Math.round(baseAmount * 100) / 100,
      igst: Math.round(totalGst * 100) / 100,
      cgst: 0,
      sgst: 0,
      totalGst: Math.round(totalGst * 100) / 100
    };
  } else {
    const cgst = totalGst / 2;
    const sgst = totalGst / 2;
    return {
      baseAmount: Math.round(baseAmount * 100) / 100,
      igst: 0,
      cgst: Math.round(cgst * 100) / 100,
      sgst: Math.round(sgst * 100) / 100,
      totalGst: Math.round(totalGst * 100) / 100
    };
  }
};

// F3.1: Sales Interface - Create Sales Cart
const createSalesCart = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { items, customerInfo, paymentMode, discountAmount = 0 } = req.body;

    // Validate all products exist and have sufficient stock
    const productValidation = [];
    let totalAmount = 0;
    let totalGstAmount = 0;
    let cartItems = [];

    for (const item of items) {
      const product = await prisma.retailProduct.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        return res.status(404).json({ 
          error: `Product with ID ${item.productId} not found` 
        });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}` 
        });
      }

      // Calculate item total with GST
      const itemTotal = product.sellingPrice * item.quantity;
      const gstBreakdown = calculateGST(itemTotal, product.gstRate);
      
      totalAmount += itemTotal;
      totalGstAmount += gstBreakdown.totalGst;

      cartItems.push({
        product,
        quantity: item.quantity,
        unitPrice: product.sellingPrice,
        itemTotal,
        gstBreakdown,
        hsnCode: product.category === 'Mobile Phone' ? GST_CONFIG.HSN_CODE_MOBILE : GST_CONFIG.HSN_CODE_ACCESSORIES
      });

      productValidation.push({
        productId: product.id,
        requestedQuantity: item.quantity,
        availableQuantity: product.quantity
      });
    }

    // Apply discount
    const discountedAmount = Math.max(0, totalAmount - discountAmount);
    const finalGstAmount = totalGstAmount * (discountedAmount / totalAmount);

    res.json({
      message: 'Sales cart created successfully',
      cart: {
        items: cartItems,
        subtotal: totalAmount,
        discountAmount,
        discountedAmount,
        totalGstAmount: Math.round(finalGstAmount * 100) / 100,
        finalAmount: Math.round(discountedAmount * 100) / 100,
        customerInfo,
        paymentMode,
        productValidation
      }
    });
  } catch (error) {
    console.error('Create sales cart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// F3.2: Billing & Invoicing - Process Sale (Industry Standard)
const processSale = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      items, 
      customerInfo = {}, 
      paymentMode, 
      discountAmount = 0,
      isInterState = false,
      notes = ''
    } = req.body;

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber();

    // Use transaction for data consistency (Industry Best Practice)
    const result = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      let totalGstAmount = 0;
      let saleItems = [];

      // Process each item
      for (const item of items) {
        const product = await tx.retailProduct.findUnique({
          where: { id: item.productId }
        });

        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        if (product.quantity < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}`);
        }

        // Calculate GST breakdown
        const itemTotal = product.sellingPrice * item.quantity;
        const gstBreakdown = calculateGST(itemTotal, product.gstRate, isInterState);
        
        totalAmount += itemTotal;
        totalGstAmount += gstBreakdown.totalGst;

        // Deduct stock (F3.2: Auto stock deduction)
        await tx.retailProduct.update({
          where: { id: item.productId },
          data: {
            quantity: {
              decrement: item.quantity
            }
          }
        });

        saleItems.push({
          productId: item.productId,
          quantity: item.quantity,
          priceAtSale: product.sellingPrice,
          gstAtSale: product.gstRate,
          itemTotal,
          gstBreakdown,
          hsnCode: product.category === 'Mobile Phone' ? GST_CONFIG.HSN_CODE_MOBILE : GST_CONFIG.HSN_CODE_ACCESSORIES,
          productName: product.name,
          productBrand: product.brand,
          productModel: product.model
        });
      }

      // Apply discount proportionally
      const discountedAmount = Math.max(0, totalAmount - discountAmount);
      const finalGstAmount = totalGstAmount * (discountedAmount / totalAmount);

      // Create sale record
      const sale = await tx.sale.create({
        data: {
          totalAmount: Math.round(discountedAmount * 100) / 100,
          gstAmount: Math.round(finalGstAmount * 100) / 100,
          paymentMode,
          items: {
            create: saleItems.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              priceAtSale: item.priceAtSale,
              gstAtSale: item.gstAtSale
            }))
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      return {
        sale,
        saleItems,
        invoiceNumber,
        totalAmount,
        discountAmount,
        discountedAmount,
        finalGstAmount,
        customerInfo,
        isInterState,
        notes
      };
    });

    // Generate GST-compliant invoice
    const invoice = await generateGSTInvoice(result);

    res.status(201).json({
      message: 'Sale processed successfully',
      sale: result.sale,
      invoice
    });
  } catch (error) {
    console.error('Process sale error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// Generate GST-Compliant Invoice (Indian Standards)
const generateGSTInvoice = async (saleData) => {
  const {
    sale,
    saleItems,
    invoiceNumber,
    totalAmount,
    discountAmount,
    discountedAmount,
    finalGstAmount,
    customerInfo,
    isInterState,
    notes
  } = saleData;

  // Company Information (Should be configurable)
  const companyInfo = {
    name: 'Kings Mobile',
    address: 'Shop No. 123, Mobile Market, Tamil Nadu, India',
    gstin: '33AAAAA0000A1Z5', // Sample GSTIN (should be real)
    phone: '+91-9876543210',
    email: 'info@kingsmobile.com',
    stateCode: '33' // Tamil Nadu state code
  };

  // Calculate consolidated GST
  let consolidatedGST = {
    totalCGST: 0,
    totalSGST: 0,
    totalIGST: 0,
    totalGST: 0
  };

  const invoiceItems = saleItems.map(item => {
    consolidatedGST.totalCGST += item.gstBreakdown.cgst;
    consolidatedGST.totalSGST += item.gstBreakdown.sgst;
    consolidatedGST.totalIGST += item.gstBreakdown.igst;
    consolidatedGST.totalGST += item.gstBreakdown.totalGst;

    return {
      description: `${item.productBrand} ${item.productName} - ${item.productModel}`,
      hsnCode: item.hsnCode,
      quantity: item.quantity,
      unitPrice: item.priceAtSale,
      totalPrice: item.itemTotal,
      gstRate: item.gstAtSale,
      cgst: Math.round(item.gstBreakdown.cgst * 100) / 100,
      sgst: Math.round(item.gstBreakdown.sgst * 100) / 100,
      igst: Math.round(item.gstBreakdown.igst * 100) / 100,
      taxableValue: Math.round(item.gstBreakdown.baseAmount * 100) / 100
    };
  });

  // Round consolidated GST
  consolidatedGST = {
    totalCGST: Math.round(consolidatedGST.totalCGST * 100) / 100,
    totalSGST: Math.round(consolidatedGST.totalSGST * 100) / 100,
    totalIGST: Math.round(consolidatedGST.totalIGST * 100) / 100,
    totalGST: Math.round(consolidatedGST.totalGST * 100) / 100
  };

  const invoice = {
    // Invoice Header
    invoiceNumber,
    invoiceDate: new Date().toISOString().split('T')[0],
    invoiceTime: new Date().toLocaleTimeString('en-IN'),
    
    // Company Details
    company: companyInfo,
    
    // Customer Details
    customer: {
      name: customerInfo.name || 'Walk-in Customer',
      phone: customerInfo.phone || '',
      address: customerInfo.address || '',
      gstin: customerInfo.gstin || ''
    },
    
    // Invoice Items
    items: invoiceItems,
    
    // Financial Summary
    summary: {
      subtotal: Math.round(totalAmount * 100) / 100,
      discount: Math.round(discountAmount * 100) / 100,
      taxableAmount: Math.round((discountedAmount - finalGstAmount) * 100) / 100,
      ...consolidatedGST,
      grandTotal: Math.round(discountedAmount * 100) / 100,
      roundOff: 0, // Can be implemented for cash transactions
      paymentMode: sale.paymentMode
    },
    
    // Additional Information
    notes,
    termsAndConditions: [
      'Goods once sold will not be taken back or exchanged',
      'All disputes are subject to Tamil Nadu jurisdiction only',
      'Warranty as per manufacturer terms and conditions'
    ],
    
    // GST Compliance
    gstDetails: {
      isInterState,
      placeOfSupply: isInterState ? customerInfo.state || 'Unknown' : 'Tamil Nadu',
      reverseCharge: 'No',
      transportationMode: 'By Hand'
    },
    
    // System Information
    generatedBy: 'Kings Mobile POS System',
    generatedAt: new Date().toISOString()
  };

  return invoice;
};

// Get all sales (with filters)
const getAllSales = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      paymentMode, 
      minAmount, 
      maxAmount,
      page = 1,
      limit = 50 
    } = req.query;

    let whereClause = {};
    
    // Date range filter
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate);
      if (endDate) whereClause.createdAt.lte = new Date(endDate);
    }
    
    // Payment mode filter
    if (paymentMode) {
      whereClause.paymentMode = paymentMode;
    }
    
    // Amount range filter
    if (minAmount || maxAmount) {
      whereClause.totalAmount = {};
      if (minAmount) whereClause.totalAmount.gte = parseFloat(minAmount);
      if (maxAmount) whereClause.totalAmount.lte = parseFloat(maxAmount);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [sales, totalCount] = await Promise.all([
      prisma.sale.findMany({
        where: whereClause,
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  brand: true,
                  model: true,
                  category: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.sale.count({ where: whereClause })
    ]);

    res.json({ 
      sales, 
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        hasNext: skip + parseInt(limit) < totalCount,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get sale by ID with full invoice
const getSaleById = async (req, res) => {
  try {
    const { id } = req.params;

    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    // Regenerate invoice for this sale
    const saleItems = sale.items.map(item => ({
      productId: item.product.id,
      quantity: item.quantity,
      priceAtSale: item.priceAtSale,
      gstAtSale: item.gstAtSale,
      itemTotal: item.priceAtSale * item.quantity,
      gstBreakdown: calculateGST(item.priceAtSale * item.quantity, item.gstAtSale),
      hsnCode: item.product.category === 'Mobile Phone' ? GST_CONFIG.HSN_CODE_MOBILE : GST_CONFIG.HSN_CODE_ACCESSORIES,
      productName: item.product.name,
      productBrand: item.product.brand,
      productModel: item.product.model
    }));

    const invoiceNumber = await generateInvoiceNumber();
    const invoice = await generateGSTInvoice({
      sale,
      saleItems,
      invoiceNumber,
      totalAmount: sale.totalAmount,
      discountAmount: 0,
      discountedAmount: sale.totalAmount,
      finalGstAmount: sale.gstAmount,
      customerInfo: {},
      isInterState: false,
      notes: ''
    });

    res.json({ sale, invoice });
  } catch (error) {
    console.error('Get sale error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Search products for POS (F3.1: Sales Interface)
const searchProducts = async (req, res) => {
  try {
    const { query, barcode, category, inStock = true } = req.query;

    let whereClause = {};
    
    if (barcode) {
      whereClause.barcode = barcode;
    } else if (query) {
      // SQLite doesn't support case-insensitive contains, so we use LIKE with UPPER
      const upperQuery = query.toUpperCase();
      whereClause.OR = [
        { name: { contains: query } },
        { brand: { contains: query } },
        { model: { contains: query } }
      ];
    }
    
    if (category) {
      whereClause.category = category;
    }
    
    if (inStock === 'true') {
      whereClause.quantity = { gt: 0 };
    }

    const products = await prisma.retailProduct.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        brand: true,
        model: true,
        category: true,
        variants: true,
        sellingPrice: true,
        gstRate: true,
        quantity: true,
        barcode: true,
        lowStockThreshold: true
      },
      orderBy: [
        { quantity: 'desc' },
        { name: 'asc' }
      ],
      take: 20
    });

    // Parse variants for response
    const productsWithParsedVariants = products.map(product => ({
      ...product,
      variants: JSON.parse(product.variants),
      isLowStock: product.quantity <= product.lowStockThreshold
    }));

    res.json({ products: productsWithParsedVariants });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  // Sales Interface
  createSalesCart,
  searchProducts,
  
  // Billing & Invoicing
  processSale,
  getAllSales,
  getSaleById,
  
  // Utility functions (for testing)
  generateInvoiceNumber,
  calculateGST,
  generateGSTInvoice
};
