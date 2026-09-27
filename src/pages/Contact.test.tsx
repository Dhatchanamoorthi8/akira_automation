import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Contact } from './Contact';
import { EnquiryProvider } from '../context/EnquiryContext';
import { ImageViewerProvider } from '../context/ImageViewerContext';

const renderContactPage = () => {
  return render(
    <EnquiryProvider>
      <ImageViewerProvider>
        <MemoryRouter initialEntries={['/contact']}>
          <Contact />
        </MemoryRouter>
      </ImageViewerProvider>
    </EnquiryProvider>
  );
};

describe('Contact Page Component', () => {
  it('renders single H1 with engineering brand heading, motto, and slogan quote', () => {
    renderContactPage();

    const h1 = screen.getByRole('heading', { level: 1, name: /Contact & Technical Inquiries/i });
    expect(h1).toBeInTheDocument();
    expect(screen.getAllByText(/"Keeping Customers First"/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/"Automating Today\.\.\. Building Tomorrow\.\.\."/i)).toBeInTheDocument();
    expect(screen.getByText(/"Connect with us to explore custom solutions tailored for your manufacturing needs\."/i)).toBeInTheDocument();
  });

  it('renders 4 rapid response benchmark metrics bar', () => {
    renderContactPage();

    expect(screen.getByText('< 2h Response')).toBeInTheDocument();
    expect(screen.getByText('Technical Inquiries Triage')).toBeInTheDocument();
    expect(screen.getByText('≤ 24h Dispatch')).toBeInTheDocument();
    expect(screen.getByText('Emergency Breakdown Support')).toBeInTheDocument();
    expect(screen.getByText('ISO/IEC 17025')).toBeInTheDocument();
    expect(screen.getByText('100% NDA')).toBeInTheDocument();
  });

  it('renders official registered facility card with address, hours, and map link', () => {
    renderContactPage();

    expect(screen.getByText('Registered Facility & Office')).toBeInTheDocument();
    expect(screen.getByText(/No\.18 2nd Street, Thamarai Street/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Gerugambakkam/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/600 122/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Open in Google Maps/i })).toBeInTheDocument();
    expect(screen.getByText(/Monday – Saturday: 9:00 AM – 6:30 PM IST/i)).toBeInTheDocument();
  });

  it('renders specialized department contact channels', () => {
    renderContactPage();

    expect(screen.getByRole('heading', { name: /Specialized Department Desks/i })).toBeInTheDocument();
    expect(screen.getByText('Technical Sales & Proposals')).toBeInTheDocument();
    expect(screen.getByText('Calibration & Setting Masters')).toBeInTheDocument();
    expect(screen.getByText('Field Service & Breakdown Triage')).toBeInTheDocument();
    expect(screen.getByText(/Rapid 24h/i)).toBeInTheDocument();
  });

  it('renders B2B engineering enquiry form with inputs and validation', () => {
    renderContactPage();

    expect(screen.getByRole('heading', { name: /Submit Gauging \/ Fixture Enquiry/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Business Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contact Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Manufacturing Sector/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Product \/ Solution Category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Technical Requirement/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit Technical Enquiry/i })).toBeInTheDocument();
  });

  it('renders drawing and CAD specification submission guidelines', () => {
    renderContactPage();

    expect(screen.getByRole('heading', { name: /How to Submit Your Component Drawings/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'CAD & Drawing Formats' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Critical Tolerances' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Target Cycle Time' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Confidentiality & NDA' })).toBeInTheDocument();
    expect(screen.getByText('3D STEP / 2D PDF')).toBeInTheDocument();
  });

  it('renders regional automotive and precision corridor reach', () => {
    renderContactPage();

    expect(screen.getByRole('heading', { name: /Automotive & Precision Corridors We Support/i })).toBeInTheDocument();
    expect(screen.getByText('Chennai Automotive Hub')).toBeInTheDocument();
    expect(screen.getByText('Southern Precision Engineering')).toBeInTheDocument();
    expect(screen.getByText('Pan-India Manufacturing Hubs')).toBeInTheDocument();
    expect(screen.getByText(/Sriperumbudur • Oragadam/i)).toBeInTheDocument();
  });

  it('renders technical sales & procurement FAQ section with HeroUI Accordion items', () => {
    renderContactPage();

    expect(screen.getByRole('heading', { level: 2, name: /Frequently Asked Questions/i })).toBeInTheDocument();
    expect(screen.getByText(/What technical parameters are required to quote a custom gauging fixture\?/i)).toBeInTheDocument();
    expect(screen.getByText(/How fast can Akira dispatch an application engineer for an emergency breakdown\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Can our quality and production team visit your Chennai works for trial inspection\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Are your setting master rings and plugs supplied with traceable calibration certificates\?/i)).toBeInTheDocument();
    expect(screen.getByText(/How do you protect proprietary CAD drawings and confidential component designs\?/i)).toBeInTheDocument();
  });

  it('renders emergency hotline banner with direct phone and email links', () => {
    renderContactPage();

    expect(screen.getByRole('heading', { name: /Require Immediate Technical Support or Urgent Quotation\?/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Call: \+91 94457 30673/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Email Engineering/i })).toBeInTheDocument();
  });

  it('interacts with form inputs properly', async () => {
    const user = userEvent.setup();
    renderContactPage();

    const nameInput = screen.getByLabelText(/Full Name/i);
    await user.type(nameInput, 'Rajesh Kumar');
    expect(nameInput).toHaveValue('Rajesh Kumar');

    const emailInput = screen.getByLabelText(/Business Email/i);
    await user.type(emailInput, 'rajesh@precisionauto.in');
    expect(emailInput).toHaveValue('rajesh@precisionauto.in');
  }, 15000);
});
