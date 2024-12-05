export const commonStyles = {
  // Layout containers
  container: "container mx-auto p-4",
  card: "bg-white rounded-lg shadow-lg p-6",
  
  // Flexbox layouts
  flexBetween: "flex justify-between items-center",
  flexCenter: "flex items-center justify-center",
  flexCol: "flex flex-col",
  
  // Grid layouts
  gridCols3: "grid grid-cols-1 md:grid-cols-3 gap-6",
  gridCols2: "grid grid-cols-1 md:grid-cols-2 gap-6",
  
  // Text styles
  heading: "text-2xl font-bold text-gray-800",
  subheading: "text-lg font-semibold text-gray-800",
  text: "text-gray-600",
  
  // Form elements
  input: "px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
  select: "px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
  
  // Buttons
  buttonPrimary: "flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors",
  buttonSecondary: "flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors",
  buttonSuccess: "flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors",
  buttonDanger: "flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors",
  
  // Stats cards
  statCard: {
    blue: "bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg",
    green: "bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg",
    orange: "bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg",
    purple: "bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg"
  },
  
  // Tables
  table: "min-w-full divide-y divide-gray-200",
  tableHeader: "bg-gray-50",
  tableHeaderCell: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
  tableRow: "hover:bg-gray-50",
  tableCell: "px-6 py-4 whitespace-nowrap",
  
  // Responsive
  responsive: {
    sm: "hidden sm:block",
    md: "hidden md:block",
    lg: "hidden lg:block"
  }
};
