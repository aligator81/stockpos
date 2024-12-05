# StockPOS - Point of Sale & Inventory Management System

StockPOS is a modern, web-based Point of Sale and Inventory Management System built with React, TypeScript, and Tailwind CSS. It provides a comprehensive solution for managing sales, inventory, employees, and generating reports.

## Features

### 🛍️ Point of Sale (POS)
- Easy-to-use interface for processing sales
- Support for both cash and e-transfer payments
- Real-time stock updates
- Quick product selection
- Cart management

### 📦 Inventory Management
- Product tracking with detailed information
- Stock level monitoring
- Low stock alerts
- Cost and sale price tracking
- Product categorization
- Supplier management

### 👥 Employee Management
- Employee records management
- Role assignment
- Contact information tracking
- Hire date tracking

### 📊 Reports & Analytics
- Sales trends visualization
- Revenue tracking
- Payment method analysis
- Inventory value calculation
- Customizable date ranges (7, 30, 90 days)

### 👤 User Management
- Secure admin login
- Admin user management
- Role-based access control

### 🏢 Business Organization
- Category management
- Supplier management
- Product-supplier relationship

## Technology Stack

- **Frontend Framework**: React
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Build Tool**: Vite
- **Storage**: LocalStorage (can be extended to use backend)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd stockpos
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Default Login Credentials

- Username: admin
- Password: admin123

## Project Structure

```
src/
├── components/         # Reusable UI components
├── contexts/          # React contexts (auth, etc.)
├── pages/             # Page components
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
├── App.tsx            # Main app component
└── main.tsx          # Application entry point
```

## Features in Detail

### Dashboard
- Overview of key metrics
- Sales statistics
- Low stock alerts
- Recent transactions

### POS Interface
- Product grid with quick selection
- Cart management
- Payment processing
- Real-time stock updates

### Inventory Management
- Product CRUD operations
- Stock level tracking
- Category assignment
- Supplier assignment

### Reports
- Sales trends
- Revenue analysis
- Payment method distribution
- Customizable date ranges

### Employee Management
- Employee records
- Role assignment
- Contact information
- Employment history

### Supplier Management
- Supplier directory
- Contact information
- Supply chain tracking

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the repository or contact the project maintainers.

## Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- UI inspiration from Linear and Notion