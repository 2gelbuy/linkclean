import { useState, useEffect, useCallback } from "react";
import { Shield, ShieldOff, Eye, EyeOff, BarChart3 } from "lucide-react";
import {
  getFilters,
  updateFilters,
  type FilterSettings,
  DEFAULT_FILTERS,
} from "@/lib/filters";
import { trackEvent } from "@/lib/analytics";
import { trackSession } from "@/lib/storage";

interface ToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

function Toggle({
  label,
  description,
  checked,
  onChange,
  disabled,
}: ToggleProps) {
  return (
    <label className="flex items-center justify-between py-2 cursor-pointer group">
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {label}
        </span>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {description}
          </p>
        )}
      </div>
      <div className="ml-3 flex-shrink-0">
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => onChange(!checked)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            checked ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
              checked ? "translate-x-[18px]" : "translate-x-[3px]"
            }`}
          />
        </button>
      </div>
    </label>
  );
}

export default function App() {
  const [filters, setFilters] = useState<FilterSettings>(DEFAULT_FILTERS);
  const [sessionCount, setSessionCount] = useState(0);

  useEffect(() => {
    trackEvent("popup_open");
    trackSession().then(setSessionCount);
    getFilters().then(setFilters);

    const listener = (
      changes: Record<string, chrome.storage.StorageChange>,
      area: string,
    ) => {
      if (area === "local" && changes.linkclean_filters) {
        setFilters(changes.linkclean_filters.newValue);
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  const handleToggle = useCallback(
    async (key: keyof FilterSettings, value: boolean) => {
      const updated = await updateFilters({ [key]: value });
      setFilters(updated);
      trackEvent("filter_toggle", { filter: key, enabled: value });
    },
    [],
  );

  return (
    <div className="w-[340px] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {filters.enabled ? (
            <Shield className="w-5 h-5 text-blue-600" />
          ) : (
            <ShieldOff className="w-5 h-5 text-gray-400" />
          )}
          <h1 className="text-base font-semibold">LinkClean</h1>
        </div>
        <button
          onClick={() => handleToggle("enabled", !filters.enabled)}
          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
            filters.enabled
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
          }`}
        >
          {filters.enabled ? "Active" : "Paused"}
        </button>
      </header>

      {/* Stats */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="w-4 h-4 text-gray-500" />
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Posts Hidden
          </span>
        </div>
        <div className="flex gap-6">
          <div>
            <span className="text-2xl font-bold text-blue-600">
              {filters.sessionHiddenCount}
            </span>
            <span className="text-xs text-gray-500 ml-1">this session</span>
          </div>
          <div>
            <span className="text-2xl font-bold text-gray-700 dark:text-gray-300">
              {filters.hiddenCount}
            </span>
            <span className="text-xs text-gray-500 ml-1">all time</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <main className="px-4 py-2 divide-y divide-gray-100 dark:divide-gray-800">
        <Toggle
          label="Hide Promoted"
          description="Sponsored ads and promoted content"
          checked={filters.hidePromoted}
          onChange={(v) => handleToggle("hidePromoted", v)}
          disabled={!filters.enabled}
        />
        <Toggle
          label="Hide Suggested"
          description="Suggested posts from people you don't follow"
          checked={filters.hideSuggested}
          onChange={(v) => handleToggle("hideSuggested", v)}
          disabled={!filters.enabled}
        />
        <Toggle
          label="Hide Newsletter Ads"
          description="Newsletter subscribe prompts"
          checked={filters.hideNewsletterAds}
          onChange={(v) => handleToggle("hideNewsletterAds", v)}
          disabled={!filters.enabled}
        />
        <Toggle
          label="Hide Polls"
          description="Posts with polls"
          checked={filters.hidePolls}
          onChange={(v) => handleToggle("hidePolls", v)}
          disabled={!filters.enabled}
        />
        <Toggle
          label="Hide Reshares"
          description="Shared posts from others"
          checked={filters.hideReshares}
          onChange={(v) => handleToggle("hideReshares", v)}
          disabled={!filters.enabled}
        />
        <Toggle
          label="Hide Video-Only"
          description="Posts with video but no text"
          checked={filters.hideVideoOnly}
          onChange={(v) => handleToggle("hideVideoOnly", v)}
          disabled={!filters.enabled}
        />
        <Toggle
          label="Hide Sidebar Ads"
          description="Promoted ads in the right sidebar"
          checked={filters.hideSidebarAds}
          onChange={(v) => handleToggle("hideSidebarAds", v)}
          disabled={!filters.enabled}
        />
        <Toggle
          label="Show Badge Count"
          description="Hidden posts counter on icon"
          checked={filters.showBadge}
          onChange={(v) => handleToggle("showBadge", v)}
          disabled={!filters.enabled}
        />
      </main>

      {/* Footer */}
      {sessionCount >= 5 && (
        <footer className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 text-center">
          <a
            href="https://chromewebstore.google.com/detail/linkclean/ipdckibncofmlnoaajkdhnbclbpgppdg/reviews"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-700"
            onClick={() => trackEvent("review_prompt_click")}
          >
            Enjoying LinkClean? Leave a review!
          </a>
        </footer>
      )}
    </div>
  );
}
