import { NavLink } from 'react-router-dom';
import { LayoutDashboard, LineChart, Briefcase, History, User } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dash', icon: LayoutDashboard },
  { path: '/markets', label: 'Markets', icon: LineChart },
  { path: '/portfolio', label: 'Portfolio', icon: Briefcase },
  { path: '/transactions', label: 'History', icon: History },
  { path: '/profile', label: 'Profile', icon: User },
];

const BottomNav = () => {
  return (
    <nav className="flex justify-around items-center h-16 px-2">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-full h-full space-y-1 ${
              isActive ? 'text-trade-primary' : 'text-trade-muted'
            }`
          }
        >
          <item.icon className="w-5 h-5" />
          <span className="text-[10px] font-medium">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
