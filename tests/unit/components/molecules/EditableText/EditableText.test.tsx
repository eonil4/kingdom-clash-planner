import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditableText } from '../../../../../src/components/molecules';

describe('EditableText', () => {
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the value text when not editing', () => {
    render(<EditableText value="Test Value" onSave={mockOnSave} />);

    expect(screen.getByText('Test Value')).toBeInTheDocument();
  });

  it('should render placeholder when value is empty', () => {
    render(<EditableText value="" onSave={mockOnSave} placeholder="Enter text" />);

    expect(screen.getByText('Enter text')).toBeInTheDocument();
  });

  it('should render edit button by default', () => {
    render(<EditableText value="Test" onSave={mockOnSave} />);

    expect(screen.getByLabelText('Edit')).toBeInTheDocument();
  });

  it('should hide edit button when showEditIcon is false', () => {
    render(<EditableText value="Test" onSave={mockOnSave} showEditIcon={false} />);

    expect(screen.queryByLabelText('Edit')).not.toBeInTheDocument();
  });

  it('should use custom aria-label for edit button', () => {
    render(<EditableText value="Test" onSave={mockOnSave} editAriaLabel="Edit name" />);

    expect(screen.getByLabelText('Edit name')).toBeInTheDocument();
  });

  it('should show input when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<EditableText value="Test Value" onSave={mockOnSave} />);

    await user.click(screen.getByLabelText('Edit'));

    expect(screen.getByDisplayValue('Test Value')).toBeInTheDocument();
  });

  it('should focus and select input when entering edit mode', async () => {
    const user = userEvent.setup();
    render(<EditableText value="Test Value" onSave={mockOnSave} />);

    await user.click(screen.getByLabelText('Edit'));

    const input = screen.getByDisplayValue('Test Value');
    expect(document.activeElement).toBe(input);
  });

  it('should call onSave when Enter is pressed', async () => {
    const user = userEvent.setup();
    render(<EditableText value="Test Value" onSave={mockOnSave} />);

    await user.click(screen.getByLabelText('Edit'));
    await user.clear(screen.getByDisplayValue('Test Value'));
    await user.type(screen.getByRole('textbox'), 'New Value');
    await user.keyboard('{Enter}');

    expect(mockOnSave).toHaveBeenCalledWith('New Value');
  });

  it('should call onSave when input loses focus', async () => {
    const user = userEvent.setup();
    render(<EditableText value="Test Value" onSave={mockOnSave} />);

    await user.click(screen.getByLabelText('Edit'));
    await user.clear(screen.getByDisplayValue('Test Value'));
    await user.type(screen.getByRole('textbox'), 'New Value');
    await user.tab();

    expect(mockOnSave).toHaveBeenCalledWith('New Value');
  });

  it('should not call onSave when value is empty and Enter is pressed', async () => {
    const user = userEvent.setup();
    render(<EditableText value="Test Value" onSave={mockOnSave} />);

    await user.click(screen.getByLabelText('Edit'));
    await user.clear(screen.getByDisplayValue('Test Value'));
    await user.keyboard('{Enter}');

    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should not call onSave when value is whitespace only', async () => {
    const user = userEvent.setup();
    render(<EditableText value="Test Value" onSave={mockOnSave} />);

    await user.click(screen.getByLabelText('Edit'));
    await user.clear(screen.getByDisplayValue('Test Value'));
    await user.type(screen.getByRole('textbox'), '   ');
    await user.keyboard('{Enter}');

    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should cancel editing when Escape is pressed', async () => {
    const user = userEvent.setup();
    render(<EditableText value="Test Value" onSave={mockOnSave} />);

    await user.click(screen.getByLabelText('Edit'));
    await user.clear(screen.getByDisplayValue('Test Value'));
    await user.type(screen.getByRole('textbox'), 'New Value');
    await user.keyboard('{Escape}');

    expect(mockOnSave).not.toHaveBeenCalled();
    expect(screen.getByText('Test Value')).toBeInTheDocument();
  });

  it('should render leftAction when provided', () => {
    render(
      <EditableText
        value="Test"
        onSave={mockOnSave}
        leftAction={<button data-testid="left-action">Left</button>}
      />
    );

    expect(screen.getByTestId('left-action')).toBeInTheDocument();
  });

  it('should trim whitespace from value before saving', async () => {
    const user = userEvent.setup();
    render(<EditableText value="Test" onSave={mockOnSave} />);

    await user.click(screen.getByLabelText('Edit'));
    await user.clear(screen.getByDisplayValue('Test'));
    await user.type(screen.getByRole('textbox'), '  Trimmed Value  ');
    await user.keyboard('{Enter}');

    expect(mockOnSave).toHaveBeenCalledWith('Trimmed Value');
  });

  it('should exit editing mode after saving', async () => {
    const user = userEvent.setup();
    render(<EditableText value="Test" onSave={mockOnSave} />);

    await user.click(screen.getByLabelText('Edit'));
    await user.clear(screen.getByDisplayValue('Test'));
    await user.type(screen.getByRole('textbox'), 'New');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });
  });

  it('should render with custom className', () => {
    const { container } = render(
      <EditableText value="Test" onSave={mockOnSave} className="custom-class" />
    );

    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('should render with custom variant', () => {
    render(<EditableText value="Test" onSave={mockOnSave} variant="h1" />);

    expect(screen.getByText('Test').tagName).toBe('H1');
  });
});

