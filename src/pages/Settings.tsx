import React, { useState } from 'react';
import {
  User as UserIcon,
  Building,
  Bell,
  Sun,
  CheckCircle2,
  Save
} from 'lucide-react';
import { toast } from 'sonner';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'workspace' | 'notifications' | 'appearance'>('workspace');

  // Form states
  const [name, setName] = useState('Local Administrator');
  const [email, setEmail] = useState('workspace@documind.local');
  const [organization, setOrganization] = useState('Enterprise Workspace');
  const [role, setRole] = useState('Document Intelligence User');

  // Notification toggles
  const [riskAlerts, setRiskAlerts] = useState(true);
  const [deadlineReminders, setDeadlineReminders] = useState(true);
  const [analysisCompletion, setAnalysisCompletion] = useState(true);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Workspace settings saved');
  };

  return (
    <div className="space-y-6 fade-in text-[#242321]">
      {/* HEADER BAR */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-[#242321]">Workspace Settings</h1>
        <p className="text-xs text-[#6F6A62] mt-0.5">
          Manage local storage options, system notifications, and theme settings.
        </p>
      </div>

      {/* TABS CONTAINER */}
      <div className="bg-white border border-[#E4DED4] rounded-2xl shadow-warm-sm overflow-hidden">
        {/* TAB HEADERS */}
        <div className="flex border-b border-[#E4DED4] overflow-x-auto bg-[#FAF8F5]">
          <button
            onClick={() => setActiveTab('workspace')}
            className={`px-5 py-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition shrink-0 ${
              activeTab === 'workspace'
                ? 'border-[#8B7355] text-[#8B7355] bg-white'
                : 'border-transparent text-[#6F6A62] hover:text-[#242321]'
            }`}
          >
            <Building className="w-4 h-4" /> Workspace & Storage
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-5 py-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition shrink-0 ${
              activeTab === 'profile'
                ? 'border-[#8B7355] text-[#8B7355] bg-white'
                : 'border-transparent text-[#6F6A62] hover:text-[#242321]'
            }`}
          >
            <UserIcon className="w-4 h-4" /> Local User Settings
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-5 py-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition shrink-0 ${
              activeTab === 'notifications'
                ? 'border-[#8B7355] text-[#8B7355] bg-white'
                : 'border-transparent text-[#6F6A62] hover:text-[#242321]'
            }`}
          >
            <Bell className="w-4 h-4" /> Notifications
          </button>
          <button
            onClick={() => setActiveTab('appearance')}
            className={`px-5 py-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition shrink-0 ${
              activeTab === 'appearance'
                ? 'border-[#8B7355] text-[#8B7355] bg-white'
                : 'border-transparent text-[#6F6A62] hover:text-[#242321]'
            }`}
          >
            <Sun className="w-4 h-4" /> Appearance
          </button>
        </div>

        {/* TAB 1: WORKSPACE */}
        {activeTab === 'workspace' && (
          <div className="p-6 space-y-6 max-w-xl text-xs text-[#6F6A62]">
            <div className="space-y-2">
              <h3 className="font-heading font-bold text-sm text-[#242321]">Local Storage & Vector Store</h3>
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4DED4] space-y-2">
                <div className="flex justify-between font-medium">
                  <span>FastAPI Local Document Storage</span>
                  <span className="text-[#242321]">data/documents/</span>
                </div>
                <div className="flex justify-between font-medium pt-1">
                  <span>ChromaDB Vector Store</span>
                  <span className="text-[#242321]">data/chroma/</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-heading font-bold text-sm text-[#242321]">Data Isolation & Privacy</h3>
              <p className="text-xs text-[#6F6A62] leading-relaxed">
                DocuMind AI processes document vectors locally and isolates uploaded documents by browser local user ID.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: PROFILE */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="p-6 space-y-4 max-w-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#6F6A62] uppercase tracking-wider mb-1">
                  User Display Tag
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Local Administrator"
                  className="w-full bg-[#FAF8F5] border border-[#E4DED4] rounded-xl px-3 py-2 text-xs text-[#242321] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6F6A62] uppercase tracking-wider mb-1">
                  Workspace Email Tag
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="workspace@documind.local"
                  className="w-full bg-[#FAF8F5] border border-[#E4DED4] rounded-xl px-3 py-2 text-xs text-[#242321] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#6F6A62] uppercase tracking-wider mb-1">
                  Workspace Label
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="Enterprise Workspace"
                  className="w-full bg-[#FAF8F5] border border-[#E4DED4] rounded-xl px-3 py-2 text-xs text-[#242321] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6F6A62] uppercase tracking-wider mb-1">
                  Role Description
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Document Analyst"
                  className="w-full bg-[#FAF8F5] border border-[#E4DED4] rounded-xl px-3 py-2 text-xs text-[#242321] focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="bg-[#8B7355] hover:bg-[#5F4B35] text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-warm-sm transition flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Local Preferences
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="p-6 space-y-4 max-w-xl text-xs">
            <h3 className="font-heading font-bold text-sm text-[#242321] mb-2">System Alerts & Notifications</h3>

            <label className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#E4DED4] cursor-pointer">
              <div>
                <p className="font-bold text-[#242321]">High-Risk Clause Alerts</p>
                <p className="text-[#6F6A62]">Receive immediate alerts when uncapped liability or harsh terms are identified.</p>
              </div>
              <input
                type="checkbox"
                checked={riskAlerts}
                onChange={(e) => setRiskAlerts(e.target.checked)}
                className="w-4 h-4 text-[#8B7355] accent-[#8B7355]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#E4DED4] cursor-pointer">
              <div>
                <p className="font-bold text-[#242321]">Contract Deadline Reminders</p>
                <p className="text-[#6F6A62]">Get notified 14 days before non-renewal opt-out windows close.</p>
              </div>
              <input
                type="checkbox"
                checked={deadlineReminders}
                onChange={(e) => setDeadlineReminders(e.target.checked)}
                className="w-4 h-4 text-[#8B7355] accent-[#8B7355]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#E4DED4] cursor-pointer">
              <div>
                <p className="font-bold text-[#242321]">Document Ingest Completion</p>
                <p className="text-[#6F6A62]">Notification when vector indexing finishes parsing a newly uploaded file.</p>
              </div>
              <input
                type="checkbox"
                checked={analysisCompletion}
                onChange={(e) => setAnalysisCompletion(e.target.checked)}
                className="w-4 h-4 text-[#8B7355] accent-[#8B7355]"
              />
            </label>
          </div>
        )}

        {/* TAB 4: APPEARANCE */}
        {activeTab === 'appearance' && (
          <div className="p-6 space-y-4 max-w-xl text-xs">
            <h3 className="font-heading font-bold text-sm text-[#242321]">Theme & Visual Palette</h3>
            <p className="text-[#6F6A62]">DocuMind AI uses a clean White + Beige neutral theme.</p>

            <div className="p-4 rounded-xl border-2 border-[#8B7355] bg-[#FAF8F5] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sun className="w-5 h-5 text-[#8B7355]" />
                <div>
                  <p className="font-bold text-[#242321]">White & Beige Editorial (Active)</p>
                  <p className="text-[11px] text-[#6F6A62]">#F8F6F1 canvas, #FFFFFF cards, #8B7355 warm accent.</p>
                </div>
              </div>
              <CheckCircle2 className="w-5 h-5 text-[#8B7355]" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
