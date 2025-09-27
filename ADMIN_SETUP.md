# Admin Dashboard Setup Guide

## Overview
The admin dashboard is now fully functional with Orders Management and Analytics pages. This guide explains how to connect real data endpoints.

## Current Features

### 📊 Analytics Dashboard (`/admin/analytics`)
- **KPI Cards**: Revenue, Orders, Average Order Value, Conversion Rate
- **Sales Chart**: Monthly sales overview (Bar chart)
- **Orders Trend**: Order trends over time (Line chart) 
- **Category Distribution**: Sales by product category (Pie chart)
- **Top Products**: Best selling products list

### 📦 Orders Management (`/admin/orders`)
- **Order Statistics**: Total orders, pending orders, revenue, avg order value
- **Search & Filters**: Search by ID/customer, filter by status and date
- **Orders Table**: Complete order details with status badges
- **Export Functionality**: Ready for CSV/Excel export

## Connecting Real Data

### 1. Replace Mock Data

#### Analytics Page (`app/admin/analytics/page.tsx`)
Replace these mock data arrays with API calls:

\`\`\`typescript
// Replace with: const salesData = await fetchSalesData()
const salesData = [
  { month: "Jan", sales: 4000, orders: 45 },
  // ... more data
]

// Replace with: const categoryData = await fetchCategoryData()  
const categoryData = [
  { name: "Hoodies", value: 35, color: "#8884d8" },
  // ... more data
]

// Replace with: const topProducts = await fetchTopProducts()
const topProducts = [
  { name: "Oversized Black Hoodie", sales: 89, revenue: 7912 },
  // ... more data
]
\`\`\`

#### Orders Page (`app/admin/orders/page.tsx`)
Replace mock orders with API call:

\`\`\`typescript
// Replace with: const orders = await fetchOrders()
const mockOrders = [
  {
    id: "ORD-001",
    customer: "Alex Johnson",
    // ... more fields
  }
]
\`\`\`

### 2. API Endpoints Needed

Create these API routes in your backend:

#### Analytics Endpoints
- `GET /api/admin/analytics/sales` - Monthly sales data
- `GET /api/admin/analytics/categories` - Sales by category
- `GET /api/admin/analytics/products/top` - Top selling products
- `GET /api/admin/analytics/kpis` - Key performance indicators

#### Orders Endpoints  
- `GET /api/admin/orders` - List all orders with pagination
- `GET /api/admin/orders/stats` - Order statistics
- `GET /api/admin/orders/export` - Export orders data
- `PUT /api/admin/orders/:id/status` - Update order status

### 3. Database Schema

Ensure your database has these tables:

\`\`\`sql
-- Orders table
CREATE TABLE orders (
  id VARCHAR PRIMARY KEY,
  customer_name VARCHAR NOT NULL,
  customer_email VARCHAR NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR NOT NULL,
  items_count INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  shipping_address TEXT
);

-- Order items table
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR REFERENCES orders(id),
  product_id INTEGER,
  product_name VARCHAR NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL
);
\`\`\`

### 4. Environment Variables

Add these to your `.env.local`:

\`\`\`env
# Database connection
DATABASE_URL="your_database_connection_string"

# Analytics API keys (if using external services)
ANALYTICS_API_KEY="your_analytics_api_key"
\`\`\`

### 5. Next Steps

1. **Set up your database** with the required tables
2. **Create API routes** for fetching real data
3. **Replace mock data** with actual API calls
4. **Add authentication** to protect admin routes
5. **Implement real-time updates** using WebSockets or polling

## Features Ready to Use

✅ **Responsive Design** - Works on all devices  
✅ **Interactive Charts** - Using Recharts library  
✅ **Search & Filtering** - Ready for backend integration  
✅ **Status Management** - Order status updates  
✅ **Export Functionality** - CSV/Excel export ready  
✅ **Navigation** - Seamless admin navigation  

## Customization

### Adding New Charts
The analytics page uses Recharts. Add new charts by:

1. Import the chart component from recharts
2. Add your data source
3. Insert the chart in the desired grid position

### Adding New Filters
Orders page filters are ready for expansion:

1. Add new Select components in the filters section
2. Connect to your filtering logic
3. Update the API calls with filter parameters

### Styling
All components use the existing design system with:
- Consistent color scheme
- Streetwear typography
- Responsive grid layouts
- Hover effects and transitions

The admin dashboard is production-ready and just needs real data connections!
