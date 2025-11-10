# NEW DATABASE SCHEMA DESIGN
**Task 1.1.1 - Hierarchical Inventory Architecture**

## 🎯 DESIGN PRINCIPLES

1. **Separation of Concerns**: Product definition vs. inventory tracking
2. **Hierarchical Structure**: Product → Variant → SerializedItem → LocationStock
3. **Audit Trail**: Complete device lifecycle tracking
4. **Multi-Location**: Support for multiple stores/warehouses
5. **Scalability**: Designed for growth and future features

---

## 📋 NEW SCHEMA STRUCTURE

### **HIERARCHY OVERVIEW**
```
Product (Master Product Definition)
├── ProductVariant (Color, Storage, Carrier combinations)
│   ├── SerializedItem (Individual devices with IMEI/Serial)
│   └── LocationStock (Quantity per location)
└── DeviceHistory (Lifecycle events)
```

---

## 🗃️ NEW TABLES DESIGN

### **1. Location Table**
```prisma
model Location {
  id          String   @id @default(cuid())
  name        String   @unique
  address     String?
  type        LocationType
  isActive    Boolean  @default(true)
  
  // Relationships
  stocks      LocationStock[]
  serializedItems SerializedItem[]
  deviceHistory   DeviceHistory[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum LocationType {
  STORE           // Retail storefront
  WAREHOUSE       // Storage facility
  REPAIR_CENTER   // Service location
  KIOSK          // Small retail point
}
```

### **2. Product Table (Enhanced)**
```prisma
model Product {
  id          String   @id @default(cuid())
  name        String   // From MasterProductName
  category    String   // From MasterCategory
  brand       String   // From MasterBrand
  model       String   // From MasterModel
  description String?
  isActive    Boolean  @default(true)
  
  // Product specifications
  productType ProductType
  
  // Relationships
  variants    ProductVariant[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([name, brand, model])
}

enum ProductType {
  MOBILE_PHONE
  TABLET
  ACCESSORY
  REPAIR_PART
}
```

### **3. ProductVariant Table**
```prisma
model ProductVariant {
  id          String   @id @default(cuid())
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  productId   String
  
  // Variant specifications
  color       String?
  storage     String?  // "128GB", "256GB", etc.
  carrier     String?  // "Unlocked", "Verizon", "AT&T", etc.
  sku         String   @unique
  
  // Pricing
  purchasePrice Float
  sellingPrice  Float
  gstRate      Float   @default(18)
  
  // Inventory settings
  lowStockThreshold Int @default(5)
  
  // Relationships
  serializedItems SerializedItem[]
  locationStocks  LocationStock[]
  saleItems      SaleItem[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([productId, color, storage, carrier])
}
```

### **4. SerializedItem Table**
```prisma
model SerializedItem {
  id          String         @id @default(cuid())
  variant     ProductVariant @relation(fields: [variantId], references: [id], onDelete: Cascade)
  variantId   String
  
  // Serial identification
  serialNumber String?       @unique
  imei        String?        @unique
  barcode     String?        @unique
  
  // Device state
  condition   DeviceCondition
  status      DeviceStatus
  
  // Location tracking
  location    Location       @relation(fields: [locationId], references: [id])
  locationId  String
  
  // Additional info
  notes       String?
  
  // Relationships
  history     DeviceHistory[]
  saleItems   SaleItem[]
  
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
}

enum DeviceCondition {
  NEW           // Brand new, unopened
  USED          // Previously owned, good condition
  REFURBISHED   // Restored to like-new condition
  DAMAGED       // Has defects, needs repair
  DEFECTIVE     // Non-functional
}

enum DeviceStatus {
  IN_STOCK      // Available for sale
  RESERVED      // Held for customer
  SOLD          // Completed sale
  IN_REPAIR     // Being repaired
  TRANSFERRED   // Moving between locations
  RETURNED      // Customer return
  DISPOSED      // End of lifecycle
}
```

### **5. LocationStock Table**
```prisma
model LocationStock {
  id               String         @id @default(cuid())
  variant          ProductVariant @relation(fields: [variantId], references: [id], onDelete: Cascade)
  variantId        String
  location         Location       @relation(fields: [locationId], references: [id], onDelete: Cascade)
  locationId       String
  
  // Stock quantities
  quantity         Int            @default(0)
  reservedQuantity Int            @default(0)
  
  // Calculated fields (updated by triggers/functions)
  availableQuantity Int           @default(0) // quantity - reservedQuantity
  
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt
  
  @@unique([variantId, locationId])
}
```

### **6. DeviceHistory Table**
```prisma
model DeviceHistory {
  id             String         @id @default(cuid())
  serializedItem SerializedItem @relation(fields: [serializedItemId], references: [id], onDelete: Cascade)
  serializedItemId String
  
  // Event details
  event          HistoryEvent
  description    String?
  
  // Context
  fromLocation   Location?      @relation(fields: [fromLocationId], references: [id])
  fromLocationId String?
  toLocation     Location?      @relation(fields: [toLocationId], references: [id])
  toLocationId   String?
  
  // User tracking
  user           User           @relation(fields: [userId], references: [id])
  userId         String
  
  // Additional data (JSON for flexibility)
  metadata       Json?
  
  createdAt      DateTime       @default(now())
}

enum HistoryEvent {
  RECEIVED       // Item received into inventory
  TRANSFERRED    // Moved between locations
  SOLD           // Item sold to customer
  RETURNED       // Customer return
  CONDITION_CHANGED // Condition updated
  REPAIRED       // Repair completed
  DAMAGED        // Damage reported
  DISPOSED       // End of lifecycle
  RESERVED       // Reserved for customer
  UNRESERVED     // Reservation cancelled
}
```

---

## 🔄 UPDATED EXISTING TABLES

### **Updated User Table**
```prisma
model User {
  id        String     @id @default(cuid())
  username  String     @unique
  password  String
  role      UserRole   @default(SALES_STAFF)
  
  // Relationships
  repairs   RepairJob[]
  deviceHistory DeviceHistory[]
  
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}
```

### **Updated SaleItem Table**
```prisma
model SaleItem {
  id              String          @id @default(cuid())
  sale            Sale            @relation(fields: [saleId], references: [id])
  saleId          String
  
  // Can link to either variant (for non-serialized) or specific serialized item
  variant         ProductVariant? @relation(fields: [variantId], references: [id])
  variantId       String?
  serializedItem  SerializedItem? @relation(fields: [serializedItemId], references: [id])
  serializedItemId String?
  
  quantity        Int
  priceAtSale     Float
  gstAtSale       Float
  
  // Ensure either variant or serializedItem is specified
  @@check(variantId IS NOT NULL OR serializedItemId IS NOT NULL)
}
```

---

## 🔗 RELATIONSHIPS SUMMARY

### **Master Data → Product Hierarchy**
- MasterBrand → Product.brand
- MasterModel → Product.model
- MasterProductName → Product.name
- MasterCategory → Product.category

### **Product Hierarchy**
- Product (1) → ProductVariant (many)
- ProductVariant (1) → SerializedItem (many)
- ProductVariant (1) → LocationStock (many)

### **Location Management**
- Location (1) → LocationStock (many)
- Location (1) → SerializedItem (many)
- Location (1) → DeviceHistory (many)

### **Audit Trail**
- SerializedItem (1) → DeviceHistory (many)
- User (1) → DeviceHistory (many)

---

## 📊 BENEFITS OF NEW SCHEMA

### **1. Scalability**
- Supports unlimited product variants
- Multi-location inventory tracking
- Individual device lifecycle management

### **2. Data Integrity**
- Proper foreign key relationships
- Enum constraints for data consistency
- Unique constraints prevent duplicates

### **3. Flexibility**
- JSON metadata for extensibility
- Support for both serialized and non-serialized items
- Configurable location types

### **4. Audit Trail**
- Complete device history tracking
- User accountability for all actions
- Detailed event logging

### **5. Business Intelligence**
- Rich data for analytics
- Location-based reporting
- Device lifecycle insights

---

## ⚠️ MIGRATION CONSIDERATIONS

### **Data Migration Path**
1. **RetailProduct → Product + ProductVariant + SerializedItem**
   - Split existing products into hierarchy
   - Create default variants for existing products
   - Convert IMEI to SerializedItem records

2. **Inventory Quantities → LocationStock**
   - Create default location if none exists
   - Migrate quantities to LocationStock table

3. **Sales History → Updated SaleItem**
   - Link existing sales to new variant structure
   - Maintain historical data integrity

### **Backward Compatibility**
- Keep old tables during transition
- Create views for old API compatibility
- Gradual migration of functionality

---

## ✅ VALIDATION CHECKLIST

- [ ] All relationships properly defined
- [ ] Enum values cover all use cases
- [ ] Unique constraints prevent data issues
- [ ] Indexes planned for performance
- [ ] Migration path documented
- [ ] Backward compatibility considered

---

**Next Step: Review and approve this schema design before proceeding to Task 1.1.2 (Migration Scripts)**
