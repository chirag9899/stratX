import { FC } from 'react';
import { CircleUser, Home, PenLine } from 'lucide-react';

interface SideBarProps {
  activeComponent: string;
  setActiveComponent: (component: string) => void;
}

const SideBar: FC<SideBarProps> = ({ activeComponent, setActiveComponent }) => {
  const getButtonClasses = (component: string) =>
    `rounded-full transition p-3 ${
      activeComponent === component ? 'bg-black text-white' : 'hover:bg-stratx-accent-blue/50 hover:text-black'
    }`;

  return (
    <div className="fixed left-0 top-0 w-20 h-full bg-stratx-sidebar-bg flex flex-col items-center pt-4 space-y-2 z-50 text-black">
      <button
        className={getButtonClasses('popular')}
        onClick={() => setActiveComponent('popular')}
      >
        <Home className="w-5 h-5" />
      </button>
      <button
        className={getButtonClasses('dashboard')}
        onClick={() => setActiveComponent('dashboard')}
      >
        <CircleUser className="w-5 h-5" />
      </button>
      <button
        className={getButtonClasses('create')}
        onClick={() => setActiveComponent('create')}
      >
        <PenLine className="w-5 h-5" />
      </button>
    </div>
  );
};

export default SideBar;
