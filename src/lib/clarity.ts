import Clarity from '@microsoft/clarity';

const envProjectId = (import.meta.env.VITE_CLARITY_PROJECT_ID || '').trim();

let isInitialized = false;

/**
 * Returns whether Microsoft Clarity has been initialized in the current browser session.
 */
export const isClarityInitialized = (): boolean => isInitialized;

/**
 * Initializes Microsoft Clarity analytics if running in a client browser environment
 * and a valid Clarity Project ID is provided.
 *
 * @param projectId Optional project ID to override the VITE_CLARITY_PROJECT_ID environment variable.
 * @returns boolean indicating whether Clarity was successfully initialized.
 */
export const initClarity = (projectId?: string): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  const targetId = (projectId !== undefined ? projectId : envProjectId).trim();

  if (!targetId) {
    if (import.meta.env.DEV) {
      console.info(
        '[Clarity] Project ID is not configured (VITE_CLARITY_PROJECT_ID). Behavioral analytics skipped.'
      );
    }
    return false;
  }

  if (isInitialized) {
    return true;
  }

  try {
    Clarity.init(targetId);
    isInitialized = true;
    if (import.meta.env.DEV) {
      console.info(`[Clarity] Initialized successfully with Project ID: ${targetId}`);
    }
    return true;
  } catch (err) {
    console.warn('[Clarity] Initialization failed:', err);
    return false;
  }
};

/**
 * Records a custom smart event in Microsoft Clarity (e.g. 'enquiry_submitted', 'rfq_modal_opened').
 */
export const trackClarityEvent = (eventName: string): void => {
  if (typeof window === 'undefined' || !isInitialized) return;
  try {
    Clarity.event(eventName);
  } catch (err) {
    console.warn(`[Clarity] Failed to track event "${eventName}":`, err);
  }
};

/**
 * Sets a custom tag in Microsoft Clarity for session segmentation and filtering.
 */
export const setClarityTag = (key: string, value: string | string[]): void => {
  if (typeof window === 'undefined' || !isInitialized) return;
  try {
    Clarity.setTag(key, value);
  } catch (err) {
    console.warn(`[Clarity] Failed to set tag "${key}":`, err);
  }
};

/**
 * Identifies a user in Microsoft Clarity.
 * Note: Clarity securely hashes customId on the client before transmission.
 */
export const identifyClarityUser = (
  customId: string,
  customSessionId?: string,
  customPageId?: string,
  friendlyName?: string
): void => {
  if (typeof window === 'undefined' || !isInitialized) return;
  try {
    Clarity.identify(customId, customSessionId, customPageId, friendlyName);
  } catch (err) {
    console.warn('[Clarity] Failed to identify user:', err);
  }
};

/**
 * Updates cookie consent for Microsoft Clarity tracking.
 */
export const setClarityConsent = (
  consentOptions?: { ad_Storage: 'granted' | 'denied'; analytics_Storage: 'granted' | 'denied' } | boolean
): void => {
  if (typeof window === 'undefined' || !isInitialized) return;
  try {
    if (typeof consentOptions === 'boolean') {
      Clarity.consent(consentOptions);
    } else if (consentOptions) {
      Clarity.consentV2(consentOptions);
    } else {
      Clarity.consentV2();
    }
  } catch (err) {
    console.warn('[Clarity] Failed to set consent:', err);
  }
};

/**
 * Prioritizes a session for recording upgrade (e.g. for high-value interactions like RFQ submission).
 */
export const upgradeClaritySession = (reason: string): void => {
  if (typeof window === 'undefined' || !isInitialized) return;
  try {
    Clarity.upgrade(reason);
  } catch (err) {
    console.warn(`[Clarity] Failed to upgrade session for "${reason}":`, err);
  }
};

/**
 * Reset initialization state for unit testing purposes only.
 * @internal
 */
export const _resetClarityForTesting = (): void => {
  isInitialized = false;
};

export { Clarity };
export default Clarity;
