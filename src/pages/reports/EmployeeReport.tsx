import { useState, useEffect, useMemo } from 'react';
import { Download, TrendingUp, TrendingDown, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { Employee, Sale } from '../../types';
import { exportToExcel } from '../../utils/export';
import { commonStyles } from '../../utils/styles';

type SortField = 'name' | 'totalSales' | 'transactions' | 'averageSale' | 'lastSale';
type SortOrder = 'asc' | 'desc';

interface EmployeeStats {
  totalSales: number;
  transactionCount: number;
  averageTransaction: number;
  lastSaleDate?: Date;
}

interface EmployeeWithStats extends Employee {
  stats: EmployeeStats;
}

export default function EmployeeReport() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('all');
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(1)).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [sortField, setSortField] = useState<SortField>('totalSales');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const storedEmployees = localStorage.getItem('employees');
      const storedSales = localStorage.getItem('sales');
      
      if (storedEmployees) setEmployees(JSON.parse(storedEmployees));
      if (storedSales) setSales(JSON.parse(storedSales));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const saleDate = new Date(sale.timestamp || sale.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      const dateInRange = saleDate >= start && saleDate <= end;
      const employeeMatch = selectedEmployeeId === 'all' || sale.employeeId === selectedEmployeeId;
      
      return dateInRange && employeeMatch;
    });
  }, [sales, startDate, endDate, selectedEmployeeId]);

  const employeeStats = useMemo(() => {
    const stats = new Map<string, EmployeeStats>();

    employees.forEach(employee => {
      const employeeSales = filteredSales.filter(sale => sale.employeeId === employee.id);
      const totalSales = employeeSales.reduce((sum, sale) => sum + sale.total, 0);
      
      const sortedSales = [...employeeSales].sort((a, b) => {
        const dateA = new Date(a.timestamp || a.date);
        const dateB = new Date(b.timestamp || b.date);
        return dateB.getTime() - dateA.getTime();
      });
      
      const lastSale = sortedSales[0];

      stats.set(employee.id, {
        totalSales,
        transactionCount: employeeSales.length,
        averageTransaction: employeeSales.length ? totalSales / employeeSales.length : 0,
        lastSaleDate: lastSale ? new Date(lastSale.timestamp || lastSale.date) : undefined
      });
    });

    return stats;
  }, [employees, filteredSales]);

  const sortedEmployees = useMemo(() => {
    const employeesWithStats: EmployeeWithStats[] = employees.map(employee => ({
      ...employee,
      stats: employeeStats.get(employee.id) || {
        totalSales: 0,
        transactionCount: 0,
        averageTransaction: 0
      }
    }));

    return [...employeesWithStats].sort((a, b) => {
      const multiplier = sortOrder === 'asc' ? 1 : -1;
      
      switch (sortField) {
        case 'name':
          return multiplier * a.name.localeCompare(b.name);
        case 'totalSales':
          return multiplier * (a.stats.totalSales - b.stats.totalSales);
        case 'transactions':
          return multiplier * (a.stats.transactionCount - b.stats.transactionCount);
        case 'averageSale':
          return multiplier * (a.stats.averageTransaction - b.stats.averageTransaction);
        case 'lastSale':
          const dateA = a.stats.lastSaleDate?.getTime() || 0;
          const dateB = b.stats.lastSaleDate?.getTime() || 0;
          return multiplier * (dateA - dateB);
        default:
          return 0;
      }
    });
  }, [employees, employeeStats, sortField, sortOrder]);

  const handleExport = () => {
    const data = employees.map(employee => {
      const stats = employeeStats.get(employee.id) || {
        totalSales: 0,
        transactionCount: 0,
        averageTransaction: 0,
        lastSaleDate: undefined
      };

      return {
        'Employee Name': employee.name,
        'Email': employee.email,
        'Total Sales': formatCurrency(stats.totalSales),
        'Transaction Count': stats.transactionCount,
        'Average Transaction': formatCurrency(stats.averageTransaction),
        'Last Sale': stats.lastSaleDate ? format(stats.lastSaleDate, 'MMM d, yyyy HH:mm') : 'N/A',
        'Status': employee.isActive ? 'Active' : 'Inactive'
      };
    });

    exportToExcel(data, `Employee_Performance_${format(new Date(), 'yyyy-MM-dd')}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  };

  const getTotalSales = () => {
    return Array.from(employeeStats.values()).reduce((sum, stat) => sum + stat.totalSales, 0);
  };

  const getTopPerformer = () => {
    let topEmployee = null;
    let maxSales = -1;

    employees.forEach(employee => {
      const stats = employeeStats.get(employee.id);
      if (stats && stats.totalSales > maxSales) {
        maxSales = stats.totalSales;
        topEmployee = employee;
      }
    });

    return topEmployee;
  };

  const topPerformer = getTopPerformer();
  const topStats = topPerformer ? employeeStats.get(topPerformer.id) : null;

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-gray-900 transition-colors"
    >
      {label}
      <ArrowUpDown size={14} className={
        sortField === field
          ? 'text-blue-500'
          : 'text-gray-400'
      } />
    </button>
  );

  return (
    <div className={commonStyles.container}>
      <div className={commonStyles.card}>
        <div className={commonStyles.flexBetween + " mb-6"}>
          <h2 className={commonStyles.heading}>Employee Report</h2>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={commonStyles.input}
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={commonStyles.input}
              />
            </div>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className={commonStyles.select}
            >
              <option value="all">All Employees</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleExport}
              className={commonStyles.buttonPrimary}
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        <div className={commonStyles.gridCols3 + " mb-8"}>
          <div className={commonStyles.statCard.blue}>
            <h3 className={commonStyles.subheading + " mb-2"}>Total Team Sales</h3>
            <p className="text-3xl font-bold text-blue-600">{formatCurrency(getTotalSales())}</p>
          </div>

          {topPerformer && topStats && (
            <>
              <div className={commonStyles.statCard.green}>
                <h3 className={commonStyles.subheading + " mb-2"}>Top Performer</h3>
                <p className="text-xl font-bold text-green-600">{topPerformer.name}</p>
                <p className="text-sm text-green-800">{formatCurrency(topStats.totalSales)} in sales</p>
              </div>

              <div className={commonStyles.statCard.orange}>
                <h3 className={commonStyles.subheading + " mb-2"}>Average Sale</h3>
                <p className="text-3xl font-bold text-orange-600">
                  {formatCurrency(topStats.averageTransaction)}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className={commonStyles.table}>
            <thead className={commonStyles.tableHeader}>
              <tr>
                <th className={commonStyles.tableHeaderCell}>
                  <SortButton field="name" label="Employee" />
                </th>
                <th className={commonStyles.tableHeaderCell + " text-right"}>
                  <div className="flex justify-end">
                    <SortButton field="totalSales" label="Total Sales" />
                  </div>
                </th>
                <th className={commonStyles.tableHeaderCell + " text-right"}>
                  <div className="flex justify-end">
                    <SortButton field="transactions" label="Transactions" />
                  </div>
                </th>
                <th className={commonStyles.tableHeaderCell + " text-right"}>
                  <div className="flex justify-end">
                    <SortButton field="averageSale" label="Average Sale" />
                  </div>
                </th>
                <th className={commonStyles.tableHeaderCell}>
                  <SortButton field="lastSale" label="Last Sale" />
                </th>
                <th className={commonStyles.tableHeaderCell + " text-center"}>Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedEmployees.map(employee => {
                const stats = employee.stats;
                const avgTeamSales = getTotalSales() / employees.length;
                const performance = stats.totalSales - avgTeamSales;

                return (
                  <tr key={employee.id} className={commonStyles.tableRow}>
                    <td className={commonStyles.tableCell}>
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {employee.name}
                          </div>
                          <div className="text-sm text-gray-500">{employee.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className={commonStyles.tableCell + " text-right"}>
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(stats.totalSales)}
                      </div>
                    </td>
                    <td className={commonStyles.tableCell + " text-right"}>
                      <div className="text-sm text-gray-900">
                        {stats.transactionCount}
                      </div>
                    </td>
                    <td className={commonStyles.tableCell + " text-right"}>
                      <div className="text-sm text-gray-900">
                        {formatCurrency(stats.averageTransaction)}
                      </div>
                    </td>
                    <td className={commonStyles.tableCell}>
                      <div className="text-sm text-gray-900">
                        {stats.lastSaleDate 
                          ? format(stats.lastSaleDate, 'MMM d, yyyy HH:mm')
                          : 'No sales'
                        }
                      </div>
                    </td>
                    <td className={commonStyles.tableCell}>
                      <div className={commonStyles.flexCenter}>
                        {performance > 0 ? (
                          <div className="flex items-center text-green-600">
                            <TrendingUp size={16} className="mr-1" />
                            <span className="text-sm">Above Avg</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-red-600">
                            <TrendingDown size={16} className="mr-1" />
                            <span className="text-sm">Below Avg</span>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
