import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  AiOutlineHome,
  AiOutlineShoppingCart,
  AiOutlineInbox,
  AiOutlineBarChart 
} from 'react-icons/ai';

export default function MobileNav() {
  const location = useLocation();
  const { currentUser } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-50">
      <div className="flex justify-around items-center h-16">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center flex-1 min-w-0 text-sm font-medium ${
            isActive('/') ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
          }`}
        >
          <AiOutlineHome className="w-6 h-6" />
          <span className="truncate">Home</span>
        </Link>

        <Link
          to="/pos"
          className={`flex flex-col items-center justify-center flex-1 min-w-0 text-sm font-medium ${
            isActive('/pos') ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
          }`}
        >
          <AiOutlineShoppingCart className="w-6 h-6" />
          <span className="truncate">POS</span>
        </Link>

        <Link
          to="/inventory"
          className={`flex flex-col items-center justify-center flex-1 min-w-0 text-sm font-medium ${
            isActive('/inventory') ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
          }`}
        >
          <AiOutlineInbox className="w-6 h-6" />
          <span className="truncate">Inventory</span>
        </Link>

        <Link
          to="/reports"
          className={`flex flex-col items-center justify-center flex-1 min-w-0 text-sm font-medium ${
            isActive('/reports') ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
          }`}
        >
          <AiOutlineBarChart className="w-6 h-6" />
          <span className="truncate">Reports</span>
        </Link>
      </div>
    </nav>
  );
}