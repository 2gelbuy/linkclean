import { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { activateLicense } from '@/lib/license';
import { trackEvent } from '@/lib/analytics';

interface UpgradePromptProps {
  /** LemonSqueezy checkout URL */
  checkoutUrl: string;
  /** Feature name that triggered the prompt */
  feature?: string;
  onClose: () => void;
  onActivated: () => void;
}

export function UpgradePrompt({ checkoutUrl, feature, onClose, onActivated }: UpgradePromptProps) {
  const [licenseKey, setLicenseKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    if (!licenseKey.trim()) return;
    setLoading(true);
    setError('');
    const result = await activateLicense(licenseKey.trim());
    setLoading(false);
    if (result.ok) {
      trackEvent('license_activated', { feature: feature ?? 'manual' });
      onActivated();
    } else {
      setError(result.error ?? 'Activation failed');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mx-4 max-w-sm w-full shadow-2xl animate-scale-in">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-semibold">Unlock Pro</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {feature && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            <strong>{feature}</strong> is a Pro feature. Upgrade to unlock it and all other Pro features.
          </p>
        )}

        <a
          href={checkoutUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent('upgrade_click', { feature: feature ?? 'general' })}
          className="block w-full text-center bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors mb-3"
        >
          Get Pro
        </a>

        {!showKeyInput ? (
          <button
            onClick={() => setShowKeyInput(true)}
            className="w-full text-center text-xs text-gray-500 hover:text-gray-700"
          >
            Already have a license key?
          </button>
        ) : (
          <div className="space-y-2">
            <input
              type="text"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              placeholder="Enter license key"
              className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              onClick={handleActivate}
              disabled={loading || !licenseKey.trim()}
              className="w-full text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Activating...' : 'Activate'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
