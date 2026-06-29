interface WorkspaceTabsProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function WorkspaceTabs({ tabs, activeTab, onTabChange }: WorkspaceTabsProps) {
  return (
    <div className="border-b border-slate-200">
      <div className="flex gap-1 px-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}
