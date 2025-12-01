import type { ReactNode } from 'react';
import './AppLayout.css';
import HeaderIcon from '../../assets/headericon';
import { Sidebar } from '../SidebarContainer/SideBar/Sidebar';

interface AppLayoutProps {
  children: ReactNode;
  companyName?: string;
}

export function AppLayout({
  children,
  companyName = 'ABC Solutions',
}: AppLayoutProps) {
  return (
    <div className="app-layout">
      <header className="app-layout__header">
        <div className="app-layout__logo">
          <HeaderIcon />
          <span className="app-layout__company-name">{companyName}</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="app-layout__container">
        {/* Sidebar */}
        <aside className="app-layout__sidebar"><Sidebar/></aside>

        {/* Content Area */}
        <main className="app-layout__content">{children}</main>
      </div>
    </div>
  );
}