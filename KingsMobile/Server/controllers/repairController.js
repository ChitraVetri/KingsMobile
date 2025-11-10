const { validationResult } = require('express-validator');
const prisma = require('../utils/prisma');

// F4.1: Job Creation & Tracking

// Create new repair job
const createRepairJob = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { customerName, customerPhone, deviceInfo, reportedIssue } = req.body;

    // Check if customer exists, create if not
    let customer = await prisma.customer.findUnique({
      where: { phone: customerPhone }
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: customerName,
          phone: customerPhone
        }
      });
    } else {
      // Update customer name if provided and different
      if (customerName && customer.name !== customerName) {
        customer = await prisma.customer.update({
          where: { id: customer.id },
          data: { name: customerName }
        });
      }
    }

    // Create repair job
    const repairJob = await prisma.repairJob.create({
      data: {
        customerId: customer.id,
        deviceInfo,
        reportedIssue,
        status: 'RECEIVED'
      },
      include: {
        customer: {
          select: { id: true, name: true, phone: true }
        }
      }
    });

    res.status(201).json({
      message: 'Repair job created successfully',
      repairJob
    });
  } catch (error) {
    console.error('Create repair job error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all repair jobs
const getAllRepairJobs = async (req, res) => {
  try {
    const { status, technicianId } = req.query;
    
    let whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (technicianId) {
      whereClause.technicianId = technicianId;
    }

    const repairJobs = await prisma.repairJob.findMany({
      where: whereClause,
      include: {
        customer: {
          select: { id: true, name: true, phone: true }
        },
        technician: {
          select: { id: true, username: true }
        },
        partsUsed: {
          include: {
            repairPart: {
              select: { id: true, name: true, partNumber: true, costPrice: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ repairJobs });
  } catch (error) {
    console.error('Get repair jobs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get repair job by ID
const getRepairJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const repairJob = await prisma.repairJob.findUnique({
      where: { id },
      include: {
        customer: {
          select: { id: true, name: true, phone: true }
        },
        technician: {
          select: { id: true, username: true }
        },
        partsUsed: {
          include: {
            repairPart: {
              select: { id: true, name: true, partNumber: true, costPrice: true }
            }
          }
        }
      }
    });

    if (!repairJob) {
      return res.status(404).json({ error: 'Repair job not found' });
    }

    res.json({ repairJob });
  } catch (error) {
    console.error('Get repair job error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// F4.2: Repair Workflow

// Assign technician to repair job (Admin only)
const assignTechnician = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { technicianId } = req.body;

    // Verify technician exists and has TECHNICIAN role
    const technician = await prisma.user.findUnique({
      where: { id: technicianId }
    });

    if (!technician) {
      return res.status(404).json({ error: 'Technician not found' });
    }

    if (technician.role !== 'TECHNICIAN') {
      return res.status(400).json({ error: 'User is not a technician' });
    }

    // Update repair job
    const updatedJob = await prisma.repairJob.update({
      where: { id },
      data: { 
        technicianId,
        status: 'IN_PROGRESS'
      },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        technician: { select: { id: true, username: true } }
      }
    });

    res.json({
      message: 'Technician assigned successfully',
      repairJob: updatedJob
    });
  } catch (error) {
    console.error('Assign technician error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update repair job status
const updateRepairJobStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status, laborCost } = req.body;

    // Check if repair job exists
    const existingJob = await prisma.repairJob.findUnique({
      where: { id },
      include: {
        partsUsed: {
          include: {
            repairPart: true
          }
        }
      }
    });

    if (!existingJob) {
      return res.status(404).json({ error: 'Repair job not found' });
    }

    // Calculate total cost if completing the job
    let updateData = { status };
    
    if (status === 'COMPLETED' && laborCost !== undefined) {
      // Calculate parts cost
      const partsCost = existingJob.partsUsed.reduce((total, usage) => {
        return total + (usage.repairPart.costPrice * usage.quantityUsed);
      }, 0);

      updateData.laborCost = parseFloat(laborCost) || 0;
      updateData.totalCost = partsCost + updateData.laborCost;
    }

    const updatedJob = await prisma.repairJob.update({
      where: { id },
      data: updateData,
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        technician: { select: { id: true, username: true } },
        partsUsed: {
          include: {
            repairPart: { select: { id: true, name: true, partNumber: true, costPrice: true } }
          }
        }
      }
    });

    res.json({
      message: 'Repair job status updated successfully',
      repairJob: updatedJob
    });
  } catch (error) {
    console.error('Update repair job status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Add spare part to repair job (F4.2: Stock auto-deduction)
const addPartToRepairJob = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { repairPartId, quantityUsed } = req.body;

    // Check if repair job exists
    const repairJob = await prisma.repairJob.findUnique({
      where: { id }
    });

    if (!repairJob) {
      return res.status(404).json({ error: 'Repair job not found' });
    }

    // Check if repair part exists and has sufficient stock
    const repairPart = await prisma.repairPart.findUnique({
      where: { id: repairPartId }
    });

    if (!repairPart) {
      return res.status(404).json({ error: 'Repair part not found' });
    }

    if (repairPart.quantity < quantityUsed) {
      return res.status(400).json({ 
        error: `Insufficient stock. Available: ${repairPart.quantity}, Requested: ${quantityUsed}` 
      });
    }

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Add part usage record
      const partUsage = await tx.repairPartUsage.create({
        data: {
          repairJobId: id,
          repairPartId,
          quantityUsed: parseInt(quantityUsed)
        },
        include: {
          repairPart: {
            select: { id: true, name: true, partNumber: true, costPrice: true }
          }
        }
      });

      // Deduct stock from repair part (F4.2: Stock auto-deduction)
      await tx.repairPart.update({
        where: { id: repairPartId },
        data: {
          quantity: {
            decrement: parseInt(quantityUsed)
          }
        }
      });

      return partUsage;
    });

    res.status(201).json({
      message: 'Part added to repair job and stock deducted',
      partUsage: result
    });
  } catch (error) {
    console.error('Add part to repair job error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Remove spare part from repair job (restore stock)
const removePartFromRepairJob = async (req, res) => {
  try {
    const { id, usageId } = req.params;

    // Find the part usage record
    const partUsage = await prisma.repairPartUsage.findUnique({
      where: { id: usageId },
      include: {
        repairPart: true
      }
    });

    if (!partUsage) {
      return res.status(404).json({ error: 'Part usage record not found' });
    }

    if (partUsage.repairJobId !== id) {
      return res.status(400).json({ error: 'Part usage does not belong to this repair job' });
    }

    // Use transaction to restore stock and remove usage
    await prisma.$transaction(async (tx) => {
      // Restore stock
      await tx.repairPart.update({
        where: { id: partUsage.repairPartId },
        data: {
          quantity: {
            increment: partUsage.quantityUsed
          }
        }
      });

      // Remove usage record
      await tx.repairPartUsage.delete({
        where: { id: usageId }
      });
    });

    res.json({
      message: 'Part removed from repair job and stock restored'
    });
  } catch (error) {
    console.error('Remove part from repair job error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// F4.3: Repair Billing - Generate repair invoice
const generateRepairInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const repairJob = await prisma.repairJob.findUnique({
      where: { id },
      include: {
        customer: true,
        technician: { select: { username: true } },
        partsUsed: {
          include: {
            repairPart: {
              select: { name: true, partNumber: true, costPrice: true }
            }
          }
        }
      }
    });

    if (!repairJob) {
      return res.status(404).json({ error: 'Repair job not found' });
    }

    if (repairJob.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Repair job must be completed to generate invoice' });
    }

    // Calculate invoice details
    const partsTotal = repairJob.partsUsed.reduce((total, usage) => {
      return total + (usage.repairPart.costPrice * usage.quantityUsed);
    }, 0);

    const invoice = {
      repairJobId: repairJob.id,
      customer: repairJob.customer,
      deviceInfo: repairJob.deviceInfo,
      reportedIssue: repairJob.reportedIssue,
      technician: repairJob.technician?.username || 'Unassigned',
      partsUsed: repairJob.partsUsed.map(usage => ({
        partName: usage.repairPart.name,
        partNumber: usage.repairPart.partNumber,
        quantity: usage.quantityUsed,
        unitPrice: usage.repairPart.costPrice,
        totalPrice: usage.repairPart.costPrice * usage.quantityUsed
      })),
      partsTotal,
      laborCost: repairJob.laborCost,
      totalAmount: repairJob.totalCost,
      completedAt: repairJob.updatedAt,
      invoiceDate: new Date().toISOString()
    };

    res.json({
      message: 'Repair invoice generated successfully',
      invoice
    });
  } catch (error) {
    console.error('Generate repair invoice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get customer repair history
const getCustomerRepairHistory = async (req, res) => {
  try {
    const { customerId } = req.params;

    const repairHistory = await prisma.repairJob.findMany({
      where: { customerId },
      include: {
        technician: { select: { username: true } },
        partsUsed: {
          include: {
            repairPart: { select: { name: true, partNumber: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ repairHistory });
  } catch (error) {
    console.error('Get customer repair history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  // Job Creation & Tracking
  createRepairJob,
  getAllRepairJobs,
  getRepairJobById,
  
  // Repair Workflow
  assignTechnician,
  updateRepairJobStatus,
  addPartToRepairJob,
  removePartFromRepairJob,
  
  // Repair Billing
  generateRepairInvoice,
  getCustomerRepairHistory
};
