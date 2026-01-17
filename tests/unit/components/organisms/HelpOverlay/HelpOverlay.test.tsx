import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HelpOverlay } from '../../../../../src/components/organisms';

vi.stubGlobal('import.meta', { env: { VITE_APP_VERSION: '0.11.0' } });

vi.mock('../../../../../src/components/atoms', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../../../src/components/atoms')>();
  return {
    ...actual,
    IconButton: ({ icon, onClick, 'aria-label': ariaLabel, ...props }: { icon: React.ReactNode; onClick: () => void; 'aria-label'?: string; [key: string]: unknown }) => (
      <button onClick={onClick} aria-label={ariaLabel} {...props}>
        {icon}
      </button>
    ),
  };
});

vi.mock('@mui/material', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@mui/material')>();
  return {
    ...actual,
    Dialog: ({ children, open, ...props }: { children: React.ReactNode; open: boolean; onClose?: () => void; maxWidth?: string; fullWidth?: boolean; PaperProps?: { className?: string }; [key: string]: unknown }) => {
      if (!open) return null;
      return (
        <div data-testid="mui-dialog" role="dialog" {...props}>
          {children}
        </div>
      );
    },
    DialogTitle: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
      <div data-testid="dialog-title" {...props}>
        {children}
      </div>
    ),
    DialogContent: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
      <div data-testid="dialog-content" {...props}>
        {children}
      </div>
    ),
  };
});

describe('HelpOverlay', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when closed', () => {
    render(<HelpOverlay open={false} onClose={mockOnClose} />);
    
    expect(screen.queryByText('Application Guide')).not.toBeInTheDocument();
  });

  it('should render when open', () => {
    render(<HelpOverlay open={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('Application Guide')).toBeInTheDocument();
  });

  it('should display all main sections', () => {
    render(<HelpOverlay open={true} onClose={mockOnClose} />);
    
    expect(screen.getByText(`Overview (v${import.meta.env.VITE_APP_VERSION})`)).toBeInTheDocument();
    expect(screen.getByText('Visual Structure')).toBeInTheDocument();
    expect(screen.getByText('Usage Guide')).toBeInTheDocument();
    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<HelpOverlay open={true} onClose={mockOnClose} />);
    
    const closeButton = screen.getByLabelText('Close help overlay');
    await user.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should display formation header information', () => {
    render(<HelpOverlay open={true} onClose={mockOnClose} />);
    
    expect(screen.getAllByText(/Formation Header/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Formation Name:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Power Display:/i).length).toBeGreaterThan(0);
  });

  it('should display formation grid information', () => {
    render(<HelpOverlay open={true} onClose={mockOnClose} />);
    
    expect(screen.getAllByText(/Formation Grid \(7x7\)/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Place Units:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Remove Units:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Swap Units:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Replace Units:/i).length).toBeGreaterThan(0);
  });

  it('should display available units list information', () => {
    render(<HelpOverlay open={true} onClose={mockOnClose} />);
    
    expect(screen.getAllByText(/Available Units List/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Sort Controls:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Search:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Manage Units Button:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Withdraw All Button:/i).length).toBeGreaterThan(0);
  });

  it('should display usage guide sections', () => {
    render(<HelpOverlay open={true} onClose={mockOnClose} />);
    
    expect(screen.getAllByText(/Adding Units to Formation/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Removing Units from Formation/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Swapping and Replacing Units/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Managing Your Roster/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Unit Information/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/URL Sharing/i).length).toBeGreaterThan(0);
  });

  it('should display limits and constraints', () => {
    render(<HelpOverlay open={true} onClose={mockOnClose} />);
    
    expect(screen.getAllByText(/Limits and Constraints/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Maximum 1 000 units total/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Maximum 49 units of the same name and level/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/7x7 grid \(49 tiles maximum\)/i).length).toBeGreaterThan(0);
  });

  it('should display keyboard shortcuts', () => {
    render(<HelpOverlay open={true} onClose={mockOnClose} />);
    
    expect(screen.getAllByText(/Enter:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Escape:/i).length).toBeGreaterThan(0);
  });

  it('should display overview content', () => {
    render(<HelpOverlay open={true} onClose={mockOnClose} />);
    
    expect(screen.getByText(/Kingdom Clash Planner is a formation planning tool/i)).toBeInTheDocument();
    expect(screen.getByText(/create formations by placing units on a 7x7 grid/i)).toBeInTheDocument();
  });

  it('should display drag and drop instructions', () => {
    render(<HelpOverlay open={true} onClose={mockOnClose} />);
    
    expect(screen.getAllByText(/Drag and Drop:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Double-Click:/i).length).toBeGreaterThan(0);
  });

  it('should display unit rarity information', () => {
    render(<HelpOverlay open={true} onClose={mockOnClose} />);
    
    expect(screen.getAllByText(/Rarity Colors:/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Common: Gray, Rare: Blue, Epic: Purple, Legendary: Yellow/i)).toBeInTheDocument();
  });

  it('should display URL parameter information', () => {
    render(<HelpOverlay open={true} onClose={mockOnClose} />);
    
    expect(screen.getByText(/formation and roster are automatically saved in the URL/i)).toBeInTheDocument();
    expect(screen.getAllByText(/formation/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/units/i).length).toBeGreaterThan(0);
  });
});
