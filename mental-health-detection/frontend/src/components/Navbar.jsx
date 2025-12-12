import React from 'react';
import { Home, Search, Bookmark, Menu, X, Activity } from 'react-feather';

// Note: We accept 'activeTab' and 'setActiveTab' as props from App.js
export function Navbar({ activeTab, setActiveTab, onResourcesClick }) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: <Home className="w-4 h-4 mr-1" /> },
    { id: 'detect', label: 'Analysis Tool', icon: <Search className="w-4 h-4 mr-1" /> },
    { id: 'resources', label: 'Resources', icon: <Bookmark className="w-4 h-4 mr-1" /> }
  ];

  // This function now correctly updates the state in App.js
  const handleNavClick = (tabId) => {
    if (tabId === 'resources') {
      onResourcesClick(); // This opens the modal
    } else {
      setActiveTab(tabId); // This changes the page view
    }
    setIsMenuOpen(false); // Close mobile menu after click
  };

  return (
    <nav className="fixed z-20 w-full shadow-sm bg-white/80 backdrop-blur-md">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 cursor-pointer" onClick={() => setActiveTab('home')}>
            <Activity className="w-8 h-8 text-indigo-500" />
            <span className="ml-2 text-xl font-bold text-gray-800">MindScope</span>
          </div>

          {/* Desktop Navigation (Using buttons instead of <a> tags) */}
          <div className="hidden md:block">
            <div className="flex items-baseline ml-10 space-x-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button" // Important for preventing form submission issues
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    activeTab === item.id
                      ? 'text-indigo-500 bg-indigo-100'
                      : 'text-gray-600 hover:text-indigo-500 hover:bg-indigo-50'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex -mr-2 md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 text-gray-400 bg-gray-100 rounded-md hover:text-gray-500 hover:bg-gray-200 focus:outline-none"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center w-full px-3 py-2 rounded-md text-base font-medium ${
                  activeTab === item.id
                    ? 'text-indigo-500 bg-indigo-100'
                    : 'text-gray-600 hover:text-indigo-500 hover:bg-indigo-50'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

