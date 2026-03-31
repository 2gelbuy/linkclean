import { useState, useEffect, useCallback } from "react";
import { Shield, ShieldOff, BarChart3, X, Lock, Sparkles } from "lucide-react";
import {
  getFilters,
  updateFilters,
  type FilterSettings,
  DEFAULT_FILTERS,
} from "@/lib/filters";
import { trackEvent } from "@/lib/analytics";
import { trackSession, getSettings, updateSettings } from "@/lib/storage";
import { isPro, isProFilter, CHECKOUT_URL, activateLicense } from "@/lib/license";

interface ToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  locked?: boolean;
  onLockedClick?: () => void;
}

function Toggle({
  label,
  description,
  checked,
  onChange,
  disabled,
  locked,
  onLockedClick,
}: ToggleProps) {
  if (locked) {
    return (
      <button
        type="button"
        onClick={onLockedClick}
        className="flex items-center justify-between py-2 w-full text-left group opacity-70 hover:opacity-100 transition-opacity"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {label}
            </span>
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
              <Lock className="w-2.5 h-2.5" />
              PRO
            </span>
          </div>
          {description && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {description}
            </p>
          )}
        </div>
        <div className="ml-3 flex-shrink-0">
          <div className="relative inline-flex h-5 w-9 items-center rounded-full bg-gray-200 dark:bg-gray-700">
            <span className="inline-block h-3.5 w-3.5 rounded-full bg-white shadow translate-x-[3px]" />
          </div>
        </div>
      </button>
    );
  }

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

function LicenseInput({ onActivated }: { onActivated: () => void }) {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    if (!key.trim()) return;
    setLoading(true);
    setError('');
    const result = await activateLicense(key.trim());
    setLoading(false);
    if (result.ok) {
      trackEvent('license_activated');
      onActivated();
    } else {
      setError(result.error ?? 'Invalid key');
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1.5">
        <input
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Enter license key"
          className="flex-1 text-xs px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:outline-none focus:border-blue-400"
        />
        <button
          onClick={handleActivate}
          disabled={loading || !key.trim()}
          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {loading ? '...' : 'Activate'}
        </button>
      </div>
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

export default function App() {
  const [filters, setFilters] = useState<FilterSettings>(DEFAULT_FILTERS);
  const [sessionCount, setSessionCount] = useState(0);
  const [reviewDismissed, setReviewDismissed] = useState(true);
  const [proStatus, setProStatus] = useState(false);
  const [showLicenseInput, setShowLicenseInput] = useState(false);

  useEffect(() => {
    trackEvent("popup_open");
    trackSession().then(setSessionCount);
    getSettings().then((s) => setReviewDismissed(s.reviewDismissed));
    getFilters().then(setFilters);
    isPro().then(setProStatus);

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

  const handleLockedClick = useCallback((filterKey: string) => {
    trackEvent("pro_feature_clicked", { filter: filterKey });
    chrome.tabs.create({ url: CHECKOUT_URL });
  }, []);

  const handleGetPro = useCallback(() => {
    trackEvent("upgrade_click", { source: "footer_banner" });
    chrome.tabs.create({ url: CHECKOUT_URL });
  }, []);

  const proFilters: Array<{
    key: keyof FilterSettings;
    label: string;
    description: string;
  }> = [
    { key: "hidePolls", label: "Hide Polls", description: "Posts with polls" },
    { key: "hideReshares", label: "Hide Reshares", description: "Shared posts from others" },
    { key: "hideVideoOnly", label: "Hide Video-Only", description: "Posts with video but no text" },
    { key: "hideSidebarAds", label: "Hide Sidebar Ads", description: "Promoted ads in the right sidebar" },
  ];

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
          {proStatus && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
              <Sparkles className="w-2.5 h-2.5" />
              PRO
            </span>
          )}
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
        {/* Free filters */}
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
          label="Show Badge Count"
          description="Hidden posts counter on icon"
          checked={filters.showBadge}
          onChange={(v) => handleToggle("showBadge", v)}
          disabled={!filters.enabled}
        />

        {/* Pro filters */}
        {proFilters.map(({ key, label, description }) =>
          proStatus ? (
            <Toggle
              key={key}
              label={label}
              description={description}
              checked={filters[key] as boolean}
              onChange={(v) => handleToggle(key, v)}
              disabled={!filters.enabled}
            />
          ) : (
            <Toggle
              key={key}
              label={label}
              description={description}
              checked={false}
              onChange={() => {}}
              locked
              onLockedClick={() => handleLockedClick(key)}
            />
          )
        )}
      </main>

      {/* Upgrade Banner (shown to free users) */}
      {!proStatus && (
        <div className="px-4 py-2.5 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                Unlock all filters
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Polls, Reshares, Videos, Sidebar Ads
              </p>
            </div>
            <button
              onClick={handleGetPro}
              className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              Get Pro
            </button>
          </div>
          {!showLicenseInput ? (
            <button
              onClick={() => setShowLicenseInput(true)}
              className="text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mt-1.5 underline"
            >
              Already have a key?
            </button>
          ) : (
            <div className="mt-2">
              <LicenseInput
                onActivated={() => {
                  setProStatus(true);
                  setShowLicenseInput(false);
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Review Prompt */}
      {sessionCount >= 3 && !reviewDismissed && (
        <footer className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <a
            href="https://chromewebstore.google.com/detail/linkclean/ipdckibncofmlnoaajkdhnbclbpgppdg/reviews"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-700"
            onClick={() => trackEvent("review_prompt_click")}
          >
            Enjoying LinkClean? Leave a review!
          </a>
          <button
            onClick={() => {
              setReviewDismissed(true);
              updateSettings({ reviewDismissed: true });
              trackEvent("review_prompt_dismiss");
            }}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-2"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </footer>
      )}
    </div>
  );
}
