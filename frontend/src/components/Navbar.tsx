import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { useState } from 'react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showHomeDropdown, setShowHomeDropdown] = useState(false);

  // Helper function to check if link is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Helper function to get link classes
  const getLinkClasses = (path: string) => {
    const baseClasses = "transition font-medium";
    if (isActive(path)) {
      return `${baseClasses} text-teal-500 dark:text-teal-400 font-semibold`;
    }
    return `${baseClasses} text-gray-500 dark:text-gray-400 hover:text-teal-500`;
  };

  // Scroll to section smoothly
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className="bg-white/95 dark:bg-black/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-teal-500 to-cyan-500 p-2.5 rounded-xl">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
              </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Rehab AI
            </span>
          </Link>
          
          {/* Navigation Links */}
          <div className="hidden md:flex space-x-8 items-center">
            {/* Trang Chủ with Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setShowHomeDropdown(true)}
              onMouseLeave={() => setShowHomeDropdown(false)}
            >
              <Link to="/" className={getLinkClasses('/')}>
                Trang Chủ
              </Link>
              
              {/* Dropdown Menu */}
              {showHomeDropdown && isActive('/') && (
                <div className="absolute top-full left-0 pt-2">
                  <div className="w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden">
                    <button
                      onClick={() => {
                        scrollToSection('features');
                        setShowHomeDropdown(false);
                      }}
                      className="w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-gray-700 hover:text-teal-600 dark:hover:text-teal-400 transition font-medium"
                    >
                      Tính Năng
                    </button>
                    <button
                      onClick={() => {
                        scrollToSection('how-it-works');
                        setShowHomeDropdown(false);
                      }}
                      className="w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-gray-700 hover:text-teal-600 dark:hover:text-teal-400 transition font-medium border-t border-gray-100 dark:border-gray-700"
                    >
                      Cách Hoạt Động
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {user && (
              <>
                <Link to="/exercise" className={getLinkClasses('/exercise')}>
                  Bài Tập
                </Link>
                <Link to="/history" className={getLinkClasses('/history')}>
                  Lịch Sử
                </Link>
                {user.role === 'patient' && (
                  <Link to="/profile" className={getLinkClasses('/profile')}>
                    Thông Tin
                  </Link>
                )}
                {user.role === 'doctor' && (
                  <Link to="/dashboard" className={getLinkClasses('/dashboard')}>
                    Dashboard
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Right Side: Theme Toggle + User Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            
            {user ? (
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Xin chào,</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">{user.full_name}</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-5 py-2.5 rounded-lg font-medium transition"
                >
                  Đăng Xuất
                </button>
              </div>
            ) : (
              <Link
                to="/login-choice"
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-6 py-2.5 rounded-lg font-semibold transition shadow-lg shadow-teal-500/30"
              >
                Đăng Nhập
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
