import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { WhyChooseUs, WhyMilestone } from './WhyChooseUs';
import { EnquiryProvider } from '../context/EnquiryContext';
import { ImageViewerProvider } from '../context/ImageViewerContext';
import { EnquiryModal } from '../components/common/EnquiryModal';
import { ImageViewerModal } from '../components/common/ImageViewerModal';

const renderWhyChooseUsPage = () => {
  return render(
    <EnquiryProvider>
      <ImageViewerProvider>
        <MemoryRouter initialEntries={['/why-choose-us']}>
          <WhyChooseUs />
          <EnquiryModal />
          <ImageViewerModal />
        </MemoryRouter>
      </ImageViewerProvider>
    </EnquiryProvider>
  );
};

describe('WhyChooseUs Page Component', () => {
  it('preserves backward-compatibility export WhyMilestone', () => {
    expect(WhyMilestone).toBe(WhyChooseUs);
  });

  it('renders single H1 with engineering brand heading and motto quote', () => {
    renderWhyChooseUsPage();

    const h1 = screen.getByRole('heading', { level: 1, name: /Why Partner with/i });
    expect(h1).toBeInTheDocument();
    expect(screen.getAllByText(/"Keeping Customers First"/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/"Automating Today\.\.\. Building Tomorrow\.\.\."/i)).toBeInTheDocument();
  });

  it('renders 4 benchmark engineering metrics bar', () => {
    renderWhyChooseUsPage();

    expect(screen.getAllByText('≤ 0.0005 mm').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Gauge Repeatability').length).toBeGreaterThan(0);
    expect(screen.getByText('< 12s Cycle')).toBeInTheDocument();
    expect(screen.getByText('100% In-Line Audit')).toBeInTheDocument();
    expect(screen.getByText('ISO/IEC 17025')).toBeInTheDocument();
    expect(screen.getByText('0% Scoring')).toBeInTheDocument();
  });

  it('renders all 5 core strategic differentiators with technical capabilities', () => {
    renderWhyChooseUsPage();

    // Differentiator titles
    expect(screen.getByRole('heading', { name: 'Automated Multi-Gauging Expertise' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'OEM & Automation-Ready Architecture' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Custom-Built Tooling & Fixtures' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Strong Service & Technical Support' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Competitive & Value-Driven Pricing' })).toBeInTheDocument();

    // Differentiator key capability snippets
    expect(screen.getByText(/Simultaneous measurement of up to 16\+ parameters/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Discrete 24V DC relay I\/O gates/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Tungsten carbide wear-protected contact points/i)).toBeInTheDocument();
    expect(screen.getByText(/Hands-on single-master and double-master calibration training/i)).toBeInTheDocument();
    expect(screen.getByText(/Substantially lower capital expenditure compared to European and Japanese imports/i)).toBeInTheDocument();
  });

  it('renders strategic comparison matrix comparing AKIRA vs Conventional Gauging', () => {
    renderWhyChooseUsPage();

    expect(screen.getByRole('heading', { name: /AKIRA Automated Metrology vs Conventional Gauging/i })).toBeInTheDocument();
    expect(screen.getByText('Inspection Cycle Time')).toBeInTheDocument();
    expect(screen.getByText('Measurement Objectivity')).toBeInTheDocument();
    expect(screen.getByText('Surface Finish Protection')).toBeInTheDocument();
    expect(screen.getByText('Quality Data Traceability')).toBeInTheDocument();
    expect(screen.getByText('Production Line Integration')).toBeInTheDocument();

    // Check specific comparison entries
    expect(screen.getByText(/2 to 5 minutes per component across multiple separate manual gauges/i)).toBeInTheDocument();
    expect(screen.getByText(/< 12 seconds simultaneous multi-point automated inspection/i)).toBeInTheDocument();
    expect(screen.getByText(/Up to 80% cycle time reduction/i)).toBeInTheDocument();
  });

  it('renders 5 measurable operational benefits', () => {
    renderWhyChooseUsPage();

    expect(screen.getByRole('heading', { name: 'Reduced Inspection Time' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Higher Line Productivity' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Consistent Quality (Cp/Cpk)' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Automation-Ready Inspection' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Strong Return on Investment' })).toBeInTheDocument();
    expect(screen.getByText('Cp/Cpk ≥ 1.67')).toBeInTheDocument();
  });

  it('renders company motto & core values spotlight banner', () => {
    renderWhyChooseUsPage();

    expect(screen.getByRole('heading', { name: /Motto: "Keeping Customers First"/i })).toBeInTheDocument();
    expect(screen.getByText('Technical Support')).toBeInTheDocument();
    expect(screen.getByText('Quality Service')).toBeInTheDocument();
    expect(screen.getByText('Team Spirit')).toBeInTheDocument();
  });

  it('renders technical & procurement FAQ section with HeroUI Accordion items', () => {
    renderWhyChooseUsPage();

    expect(screen.getByRole('heading', { level: 2, name: /Frequently Asked Questions/i })).toBeInTheDocument();
    expect(screen.getByText(/How does Akira compare in cost and lead times to multinational gauging brands\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Can Akira multi-gauging stations interface directly with our existing factory PLCs\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Why is non-contact air gauging superior for micro-honed engine cylinder bores\?/i)).toBeInTheDocument();
    expect(screen.getByText(/What is the typical turnaround time for custom fixture engineering\?/i)).toBeInTheDocument();
    expect(screen.getByText(/How do you guarantee measurement repeatability and Gauge R&R\?/i)).toBeInTheDocument();
  });

  it('opens enquiry modal with prefilled differentiator context when action button is pressed', async () => {
    const user = userEvent.setup();
    renderWhyChooseUsPage();

    const consultButtons = screen.getAllByRole('button', { name: /Consult on Multi-Gauging/i });
    expect(consultButtons.length).toBeGreaterThan(0);
    await user.click(consultButtons[0]);

    // Verify Enquiry Modal opens with prefilled subject
    const modalHeading = await screen.findByRole('heading', { name: /Request Technical Proposal & Quotation/i });
    expect(modalHeading).toBeInTheDocument();
  });

  it('opens image viewer modal when hero blueprint image is clicked', async () => {
    const user = userEvent.setup();
    renderWhyChooseUsPage();

    const heroImage = screen.getByAltText(/Automated Shop-Floor Air Gauging Inspection Station/i);
    expect(heroImage).toBeInTheDocument();
    await user.click(heroImage);

    // Verify ImageViewer modal opens with close button
    const closeBtn = await screen.findByRole('button', { name: /Close image viewer/i });
    expect(closeBtn).toBeInTheDocument();
  });
});
