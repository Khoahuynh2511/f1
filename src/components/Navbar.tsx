import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Bars3Icon, 
  XMarkIcon,
  TrophyIcon,
  CalendarIcon,
  UserGroupIcon,
  FlagIcon,
  BuildingOffice2Icon,
  ClipboardDocumentListIcon,
  ClockIcon,
  BoltIcon,
  WrenchScrewdriverIcon,
  ChartBarIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

interface NavbarProps {}

export function Navbar({}: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const location = useLocation();

  const navigationItems = [
    { name: 'Dashboard', href: '/', icon: TrophyIcon },
    { name: 'Races', href: '/races', icon: FlagIcon },
    { name: 'Drivers', href: '/drivers', icon: UserGroupIcon },
    { name: 'Teams', href: '/teams', icon: BuildingOffice2Icon },
    { name: 'Calendar', href: '/calendar', icon: CalendarIcon },
  ];

  const analyticsItems = [
    { name: 'Race Results', href: '/results', icon: ClipboardDocumentListIcon },
    { name: 'Qualifying', href: '/qualifying', icon: ClockIcon },
    { name: 'Sprint Races', href: '/sprint', icon: BoltIcon },
    { name: 'Pit Stops', href: '/pitstops', icon: WrenchScrewdriverIcon },
    { name: 'Lap Times', href: '/laptimes', icon: ChartBarIcon },
    { name: 'Statistics', href: '/statistics', icon: TrophyIcon },
  ];

  const isActive = (path: string) => location.pathname === path;
  const isAnalyticsActive = analyticsItems.some(item => isActive(item.href));

  return (
    <nav className="glass border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-xl">F1</span>
              </div>
              <div>
                <h1 className="text-xl font-black text-gray-900 dark:text-white">
                  <span className="text-gradient">FORMULA 1</span>
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Live Dashboard
                </p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              {/* Analytics Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsAnalyticsOpen(!isAnalyticsOpen)}
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-all duration-200 ${
                    isAnalyticsActive
                      ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <ChartBarIcon className="h-4 w-4" />
                  <span>Analytics</span>
                  <ChevronDownIcon className={`h-4 w-4 transition-transform ${isAnalyticsOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isAnalyticsOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                    {analyticsItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={`flex items-center space-x-3 px-4 py-2 text-sm transition-colors ${
                            isActive(item.href)
                              ? 'bg-gradient-to-r from-red-600 to-red-500 text-white'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                          onClick={() => setIsAnalyticsOpen(false)}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-4">
            {/* Live Indicator */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase">
                Live Data
              </span>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <XMarkIcon className="block h-6 w-6" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-red-600 to-red-500 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            
            {/* Mobile Analytics Section */}
            <div className="pt-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Analytics
              </div>
              {analyticsItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-gradient-to-r from-red-600 to-red-500 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
            
            {/* Mobile Live Indicator */}
            <div className="flex items-center space-x-3 px-3 py-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-green-700 dark:text-green-400 uppercase">
                Live Data Connected
              </span>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
} 