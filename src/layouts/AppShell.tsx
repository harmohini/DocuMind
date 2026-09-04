import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Bot,
  ShieldAlert,
  FileCheck,
  GitCompare,
  Calendar,
  Network,
  FileBarChart,
  Settings,
  HelpCircle,
  Search,
  Bell,
  Menu,
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';
import { GlobalSearchModal } from '../components/GlobalSearchModal';
import { NotificationsDropdown } from '../components/NotificationsDropdown';
import { UploadDocumentModal } from '../components/UploadDocumentModal';
import { toast } from 'sonner';

export const AppShell: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Documents', path: '/documents', icon: FileText },
    { name: 'AI Workspace', path: '/ai-workspace', icon: Bot },
    { name: 'Contract Summarizer', path: '/contract-summarizer', icon: FileSpreadsheet, badge: 'New' },
    { name: 'Risk Intelligence', path: '/risks', icon: ShieldAlert },
    { name: 'Compliance', path: '/compliance', icon: FileCheck },
    { name: 'Document Changes', path: '/changes', icon: GitCompare },
    { name: 'Deadlines', path: '/deadlines', icon: Calendar },
    { name: 'Knowledge Graph', path: '/knowledge-graph', icon: Network },
    { name: 'Reports', path: '/reports', icon: FileBarChart },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F8F6F1] text-[#242321] flex flex-col font-sans">
      {/* Search & Upload Modals */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <UploadDocumentModal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} onSuccess={() => navigate('/documents')} />

      <div className="flex-1 flex overflow-hidden">
        {/* DESKTOP SIDEBAR */}
        <aside
          className={`hidden md:flex flex-col bg-[#F1EDE5] border-r border-[#E4DED4] transition-all duration-300 z-30 ${
            sidebarCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          {/* Logo Branding */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-[#E4DED4]">
            {!sidebarCollapsed ? (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#8B7355] text-white flex items-center justify-center font-heading font-bold shadow-warm-sm">
                  <Sparkles className="w-4 h-4 fill-white" />
                </div>
                <div>
                  <span className="font-heading font-extrabold text-base tracking-tight text-[#242321]">
                    DOCUMIND <span className="text-[#8B7355] font-semibold text-xs ml-0.5">AI</span>
                  </span>
                  <p className="text-[10px] text-[#6F6A62] font-medium tracking-wide uppercase">Document Intelligence</p>
                </div>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-[#8B7355] text-white flex items-center justify-center font-heading font-bold mx-auto">
                <Sparkles className="w-4 h-4" />
              </div>
            )}

            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1 rounded-lg text-[#6F6A62] hover:bg-[#E8E0D2] transition hidden md:block"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Quick Action Upload Button */}
          <div className="p-3">
            <button
              onClick={() => setUploadOpen(true)}
              className={`w-full bg-[#8B7355] hover:bg-[#5F4B35] text-white font-medium text-xs rounded-xl shadow-warm-sm transition flex items-center justify-center gap-2 py-2.5 px-3 ${
                sidebarCollapsed ? 'px-0' : ''
              }`}
            >
              <Plus className="w-4 h-4 shrink-0" />
              {!sidebarCollapsed && <span>Upload Document</span>}
            </button>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? 'bg-white text-[#242321] shadow-warm-sm font-semibold border border-[#E4DED4]'
                      : 'text-[#6F6A62] hover:bg-[#E8E0D2]/60 hover:text-[#242321]'
                  }`}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#8B7355]' : 'text-[#6F6A62]'}`} />
                  {!sidebarCollapsed && (
                    <div className="flex-1 flex items-center justify-between truncate">
                      <span className="truncate">{item.name}</span>
                      {item.badge && (
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-[#8B7355]/10 text-[#8B7355] px-1.5 py-0.5 rounded-md">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Bottom Help Section */}
          <div className="p-3 border-t border-[#E4DED4]">
            <button
              onClick={() => toast.info('DocuMind Intelligence System is active.')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-[#6F6A62] hover:bg-[#E8E0D2] transition"
            >
              <HelpCircle className="w-4 h-4 shrink-0 text-[#6F6A62]" />
              {!sidebarCollapsed && <span>System Status: Ready</span>}
            </button>
          </div>
        </aside>

        {/* MOBILE DRAWER */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden bg-black/40 backdrop-blur-xs">
            <div className="w-64 bg-[#F1EDE5] h-full flex flex-col p-4 shadow-warm-lg">
              <div className="flex items-center justify-between pb-4 border-b border-[#E4DED4] mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#8B7355] text-white flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="font-heading font-bold text-base">DOCUMIND AI</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-[#6F6A62]">
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-[#6F6A62] hover:bg-[#E8E0D2] transition"
                  >
                    <item.icon className="w-4 h-4 text-[#8B7355]" />
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)}></div>
          </div>
        )}

        {/* MAIN BODY WRAPPER */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* TOP NAVBAR */}
          <header className="h-16 bg-white border-b border-[#E4DED4] px-4 md:px-6 flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3 flex-1 max-w-xl">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 rounded-xl text-[#6F6A62] hover:bg-[#F1EDE5] md:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Global Search Bar */}
              <div
                onClick={() => setSearchOpen(true)}
                className="w-full bg-[#FAF8F5] border border-[#E4DED4] hover:border-[#8B7355] rounded-xl px-3 py-1.5 flex items-center justify-between text-xs text-[#9A948A] cursor-pointer transition shadow-warm-sm"
              >
                <div className="flex items-center gap-2 truncate">
                  <Search className="w-4 h-4 text-[#8B7355] shrink-0" />
                  <span className="truncate">Search documents, risks, deadlines, reports...</span>
                </div>
                <kbd className="hidden sm:inline-block text-[10px] font-bold text-[#6F6A62] bg-[#E8E0D2] px-1.5 py-0.5 rounded-md">
                  ⌘K
                </kbd>
              </div>
            </div>

            {/* Top Right Header Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setUploadOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#8B7355] hover:bg-[#5F4B35] text-white text-xs font-semibold shadow-warm-sm transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Upload Document
              </button>

              {/* Notifications Button & Popover */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2 rounded-xl text-[#6F6A62] hover:bg-[#F1EDE5] hover:text-[#242321] relative transition"
                >
                  <Bell className="w-4 h-4" />
                </button>
                <NotificationsDropdown
                  isOpen={notificationsOpen}
                  onClose={() => setNotificationsOpen(false)}
                />
              </div>
            </div>
          </header>

          {/* PAGE CONTENT ROUTE OUTLET */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#F8F6F1]">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
