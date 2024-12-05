import { Link } from 'react-router-dom';
import { BarChart3, Package, Users } from 'lucide-react';

const reportTypes = [
  {
    title: 'Sales Report',
    description: 'View detailed sales analytics, revenue trends, and transaction history',
    icon: <BarChart3 className="w-8 h-8 text-blue-500" />,
    link: '/reports/sales',
    color: 'bg-blue-50 hover:bg-blue-100'
  },
  {
    title: 'Inventory Report',
    description: 'Track stock levels, monitor low inventory alerts, and view product movement',
    icon: <Package className="w-8 h-8 text-green-500" />,
    link: '/reports/inventory',
    color: 'bg-green-50 hover:bg-green-100'
  },
  {
    title: 'Employee Report',
    description: 'View employee performance metrics, attendance, and sales records',
    icon: <Users className="w-8 h-8 text-purple-500" />,
    link: '/reports/employees',
    color: 'bg-purple-50 hover:bg-purple-100'
  }
];

export default function Reports() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="mt-2 text-gray-600">
          Access and analyze your business data through various reports
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reportTypes.map((report, index) => (
          <Link
            key={index}
            to={report.link}
            className={`p-6 rounded-lg shadow-sm ${report.color} transition-colors duration-200`}
          >
            <div className="mb-4">{report.icon}</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {report.title}
            </h2>
            <p className="text-gray-600">{report.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}