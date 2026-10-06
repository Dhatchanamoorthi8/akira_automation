import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Clarity from '@microsoft/clarity';
import {
  initClarity,
  isClarityInitialized,
  trackClarityEvent,
  setClarityTag,
  identifyClarityUser,
  setClarityConsent,
  upgradeClaritySession,
  _resetClarityForTesting,
} from './clarity';

vi.mock('@microsoft/clarity', () => ({
  default: {
    init: vi.fn(),
    event: vi.fn(),
    setTag: vi.fn(),
    identify: vi.fn(),
    consent: vi.fn(),
    consentV2: vi.fn(),
    upgrade: vi.fn(),
  },
}));

describe('Microsoft Clarity Integration (lib/clarity)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    _resetClarityForTesting();
  });

  afterEach(() => {
    _resetClarityForTesting();
  });

  it('1. skips initialization when project ID is empty and returns false', () => {
    const initialized = initClarity('');
    expect(initialized).toBe(false);
    expect(isClarityInitialized()).toBe(false);
    expect(Clarity.init).not.toHaveBeenCalled();
  });

  it('2. successfully initializes Clarity when project ID is provided', () => {
    const initialized = initClarity('test-clarity-id-123');
    expect(initialized).toBe(true);
    expect(isClarityInitialized()).toBe(true);
    expect(Clarity.init).toHaveBeenCalledWith('test-clarity-id-123');
  });

  it('3. ignores redundant initialization calls if already initialized', () => {
    initClarity('project-abc');
    expect(Clarity.init).toHaveBeenCalledTimes(1);

    const secondCall = initClarity('project-xyz');
    expect(secondCall).toBe(true);
    expect(Clarity.init).toHaveBeenCalledTimes(1);
  });

  it('4. tracks custom events only after successful initialization', () => {
    trackClarityEvent('uninitialized_event');
    expect(Clarity.event).not.toHaveBeenCalled();

    initClarity('valid-id');
    trackClarityEvent('enquiry_submitted');
    expect(Clarity.event).toHaveBeenCalledWith('enquiry_submitted');
  });

  it('5. sets custom tags only after successful initialization', () => {
    setClarityTag('page', '/about');
    expect(Clarity.setTag).not.toHaveBeenCalled();

    initClarity('valid-id');
    setClarityTag('industry', 'Automotive');
    expect(Clarity.setTag).toHaveBeenCalledWith('industry', 'Automotive');
  });

  it('6. identifies users only after successful initialization', () => {
    identifyClarityUser('cust-001', 'sess-001', 'page-001', 'John Doe');
    expect(Clarity.identify).not.toHaveBeenCalled();

    initClarity('valid-id');
    identifyClarityUser('cust-001', 'sess-001', 'page-001', 'John Doe');
    expect(Clarity.identify).toHaveBeenCalledWith('cust-001', 'sess-001', 'page-001', 'John Doe');
  });

  it('7. sets consent with boolean or consentV2 options', () => {
    initClarity('valid-id');

    setClarityConsent(true);
    expect(Clarity.consent).toHaveBeenCalledWith(true);

    setClarityConsent({ ad_Storage: 'denied', analytics_Storage: 'granted' });
    expect(Clarity.consentV2).toHaveBeenCalledWith({
      ad_Storage: 'denied',
      analytics_Storage: 'granted',
    });

    setClarityConsent();
    expect(Clarity.consentV2).toHaveBeenCalledTimes(2);
  });

  it('8. upgrades session recording priority only after initialization', () => {
    upgradeClaritySession('enquiry_conversion');
    expect(Clarity.upgrade).not.toHaveBeenCalled();

    initClarity('valid-id');
    upgradeClaritySession('enquiry_conversion');
    expect(Clarity.upgrade).toHaveBeenCalledWith('enquiry_conversion');
  });

  it('9. catches Clarity exceptions gracefully without throwing to the caller', () => {
    vi.mocked(Clarity.event).mockImplementationOnce(() => {
      throw new Error('Clarity script failed');
    });

    initClarity('valid-id');
    expect(() => trackClarityEvent('test_event')).not.toThrow();
  });
});
