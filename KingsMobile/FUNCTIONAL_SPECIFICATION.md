# Kings Mobile Management System - Functional Specification

**Version:** 1.0
**Date:** 28-10-2025

## 1. Introduction

This document outlines the functional requirements and implementation plan for the Kings Mobile Management System. It breaks down the system into modules and specific features that will be developed and tested incrementally.

## 2. Core Modules & Features

### Module 1: User Management & Authentication

*   **F1.1: User Roles:** The system will support three distinct user roles:
    *   **Admin:** Full access to all system modules.
    *   **Sales Staff:** Access to Retail Sales (POS) and limited inventory viewing.
    *   **Technician:** Access to Repair Management and spare parts inventory.
*   **F1.2: User Authentication:**
    *   Users must log in using a unique username and password.
    *   The system will use secure password hashing (e.g., bcrypt).
    *   A login page will be the entry point to the application.
*   **F1.3: User Administration (Admin Only):**
    *   Admins can create, view, edit, and deactivate user accounts.
    *   When creating a user, the admin will assign a role.

### Module 2: Inventory Management

*   **F2.1: Dual Inventory System:** The system will maintain two separate inventories.
    *   **Retail Inventory:** For products sold directly to customers (mobiles, accessories).
    *   **Repair Inventory:** For spare parts used in repairs.
*   **F2.2: Product & Spare Part Attributes:**
    *   **Retail Product:** Name, Category, Brand, Model, Variants (Color, Storage), IMEI/Serial Number, Purchase Price, Selling Price, GST Rate, Quantity, Barcode, Low-Stock Threshold.
    *   **Spare Part:** Name, Part Number, Compatible Models, Cost Price, Quantity, Low-Stock Threshold.
*   **F2.3: Inventory Operations:**
    *   Admins can add new products and spare parts to the inventory.
    *   Stock levels will be automatically decremented upon a retail sale or when a part is used in a repair.
    *   A low-stock alert mechanism will notify the admin when inventory levels fall below the defined threshold.

### Module 3: Retail Sales (Point of Sale - POS)

*   **F3.1: Sales Interface:**
    *   A user-friendly interface to search for products by name or scan a barcode.
    *   Ability to add multiple items to a sales cart.
*   **F3.2: Billing & Invoicing:**
    *   The system will automatically calculate the total amount, including GST.
    *   Support for multiple payment methods (Cash, UPI, Card).
    *   Upon successful payment, a GST-compliant invoice will be generated.
    *   The invoice will be printable and include all necessary details (Shop Name, GSTIN, Item Details, Tax Breakdown).

### Module 4: Repair Management

*   **F4.1: Job Creation & Tracking:**
    *   Create a new repair job with a unique Job ID.
    *   Record customer details (Name, Phone), device information, and the reported issue.
*   **F4.2: Repair Workflow:**
    *   Assign a technician to the job.
    *   Track the job status: `Received` -> `In Progress` -> `Completed` -> `Delivered`.
    *   Technicians can select spare parts from the Repair Inventory to be used for the job. Stock will be automatically deducted.
*   **F4.3: Repair Billing:**
    *   Calculate the final bill based on the cost of spare parts used plus a configurable labor charge.
    *   Generate a separate invoice for repair services.

### Module 5: Reporting & Analytics

*   **F5.1: Standard Reports:**
    *   **Sales Report:** View total sales by day, week, or month.
    *   **Profit Report:** Analyze profit margins on retail products.
    *   **Low Stock Report:** A list of all items that have fallen below their reorder threshold.
    *   **Repair Parts Usage Report:** Track which spare parts are used most frequently.

## 3. Incremental Development Plan

We will develop and test the system one module at a time to ensure quality and adherence to requirements. The updated development order is as follows:

1.  **Project Setup:** Initialize the React (Frontend) and Node.js/Express (Backend) projects.
2.  **Database Schema Design:** Design and create the initial database tables for all modules.
3.  **Module 1: User Management:** Implement user creation, login, and role-based access.
4.  **Module 2: Inventory Management:** Build the backend and UI for managing products and spare parts.
5.  **Module 4: Repair Management:** Implement the repair job workflow and billing.
6.  **Module 3: Retail Sales (POS):** Develop the POS interface and sales billing.
7.  **Module 5: Reporting:** Create the reporting dashboards.

Each step will be followed by a testing phase before moving to the next.
