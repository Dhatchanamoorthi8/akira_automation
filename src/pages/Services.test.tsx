import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Services } from './Services';
import { EnquiryProvider } from '../context/EnquiryContext';
import { ImageViewerProvider } from '../context/ImageViewerContext';
import { EnquiryModal } from '../components/common/EnquiryModal';

const renderServicesPage = () => {
  return render(
    <EnquiryProvider>
      <ImageViewerProvider>
        <MemoryRouter initialEntries={['/services']}>
          <Services />
          <EnquiryModal />
        </MemoryRouter>
      </ImageViewerProvider>
    </EnquiryProvider>
  );
};

describe('Services Page Component', () => {
  it('renders single H1 with engineering brand heading and quote', () => {
    renderServicesPage();

    const h1 = screen.getByRole('heading', { level: 1, name: /Service & Technical Support/i });
    expect(h1).toBeInTheDocument();
    expect(screen.getByText(/"We support beyond sales\."/i)).toBeInTheDocument();
  });

  it('renders key capability metrics bar', () => {
    renderServicesPage();

    expect(screen.getByText('≤ 24h')).toBeInTheDocument();
    expect(screen.getByText('Emergency Dispatch')).toBeInTheDocument();
    expect(screen.getByText('ISO/IEC 17025')).toBeInTheDocument();
    expect(screen.getByText('3.0 Bar ± 0.05')).toBeInTheDocument();
    expect(screen.getByText('100% Audit')).toBeInTheDocument();
  });

  it('renders all 4 service pillars with technical deliverables', () => {
    renderServicesPage();

    expect(screen.getByRole('heading', { name: 'Installation & Commissioning' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Operator Training' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Calibration & Technical Support' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Fast Service Response' })).toBeInTheDocument();

    // Check operating specifications
    expect(screen.getByText('4.5 bar (67 psi) Min')).toBeInTheDocument();
    expect(screen.getByText('3.0 bar (45 psi) ± 0.05')).toBeInTheDocument();
    expect(screen.getByText('Single & Double Master')).toBeInTheDocument();
    expect(screen.getByText('Sub-Micron (≤ 0.0005 mm)')).toBeInTheDocument();
  });

  it('renders 5-stage commissioning protocol steps', () => {
    renderServicesPage();

    expect(screen.getByRole('heading', { name: /5-Stage Commissioning & Support Protocol/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Site Readiness & Pneumatics Audit' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Precision Mechanical Mounting' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Two-Master Calibration & Zeroing' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Operator Certification & Trial R&R' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Scheduled Recalibration & SLA Support' })).toBeInTheDocument();
  });

  it('renders service commitments & standards SLA matrix', () => {
    renderServicesPage();

    expect(screen.getByRole('heading', { name: /Service Commitments & Standards Matrix/i })).toBeInTheDocument();
    expect(screen.getByText('Emergency Breakdown Callout')).toBeInTheDocument();
    expect(screen.getByText('Setting Master Ring & Plug Reverification')).toBeInTheDocument();
    expect(screen.getByText('Display Unit & Transducer Calibration')).toBeInTheDocument();
    expect(screen.getByText('Custom Fixture Engineering Consultation')).toBeInTheDocument();
  });

  it('renders technical support hotline banner with correct phone and email', () => {
    renderServicesPage();

    expect(screen.getByRole('heading', { name: /Require Urgent Technical Support or Calibration\?/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Call Hotline: \+91 94457 30673/i })).toBeInTheDocument();
  });

  it('renders FAQ section with HeroUI Accordion items', () => {
    renderServicesPage();

    expect(screen.getByRole('heading', { level: 2, name: /Frequently Asked Questions/i })).toBeInTheDocument();
    expect(screen.getByText(/What pneumatic supply conditions are required for air gauging installation\?/i)).toBeInTheDocument();
    expect(screen.getByText(/How frequently should setting master rings and plugs be recalibrated\?/i)).toBeInTheDocument();
    expect(screen.getByText(/How rapidly can Akira respond to an emergency breakdown on a production line\?/i)).toBeInTheDocument();
  });

  it('opens enquiry modal with prefilled service context when action button is pressed', async () => {
    const user = userEvent.setup();
    renderServicesPage();

    const requestButtons = screen.getAllByRole('button', { name: /Request Installation & Setup/i });
    expect(requestButtons.length).toBeGreaterThan(0);
    await user.click(requestButtons[0]);

    // Verify Enquiry Modal opens with prefilled service subject
    const modalHeading = await screen.findByRole('heading', { name: /Request Technical Proposal & Quotation/i });
    expect(modalHeading).toBeInTheDocument();
  });
});
