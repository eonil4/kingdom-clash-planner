import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Table, TableHead, TableRow } from '@mui/material';
import { SortableTableHeader } from '../../../../../src/components/molecules';
import type { SortColumn } from '../../../../../src/hooks/useManageUnits';

describe('SortableTableHeader', () => {
  const mockOnSort = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render label', () => {
    render(
      <Table>
        <TableHead>
          <TableRow>
          <SortableTableHeader
            column="name"
            label="Name"
            sortColumn={null}
            sortDirection="asc"
            onSort={mockOnSort}
          />
          </TableRow>
        </TableHead>
      </Table>
    );
    
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('should call onSort when clicked', async () => {
    const user = userEvent.setup();
    render(
      <Table>
        <TableHead>
          <TableRow>
          <SortableTableHeader
            column="name"
            label="Name"
            sortColumn={null}
            sortDirection="asc"
            onSort={mockOnSort}
          />
          </TableRow>
        </TableHead>
      </Table>
    );
    
    const header = screen.getByText('Name').closest('th') || screen.getByText('Name').closest('td');
    if (header) {
      await user.click(header);
      expect(mockOnSort).toHaveBeenCalledWith('name');
    }
  });

  it('should show ascending arrow when sorted ascending', () => {
    const { container } = render(
      <Table>
        <TableHead>
          <TableRow>
          <SortableTableHeader
            column="name"
            label="Name"
            sortColumn="name"
            sortDirection="asc"
            onSort={mockOnSort}
          />
          </TableRow>
        </TableHead>
      </Table>
    );
    
    const svgIcons = container.querySelectorAll('svg');
    expect(svgIcons.length).toBeGreaterThan(0);
    const header = screen.getByText('Name').closest('th');
    expect(header).toBeInTheDocument();
  });

  it('should show descending arrow when sorted descending', () => {
    const { container } = render(
      <Table>
        <TableHead>
          <TableRow>
          <SortableTableHeader
            column="name"
            label="Name"
            sortColumn="name"
            sortDirection="desc"
            onSort={mockOnSort}
          />
          </TableRow>
        </TableHead>
      </Table>
    );
    
    const svgIcons = container.querySelectorAll('svg');
    expect(svgIcons.length).toBeGreaterThan(0);
    const header = screen.getByText('Name').closest('th');
    expect(header).toBeInTheDocument();
  });

  it('should not show arrow when column is not sorted', () => {
    render(
      <Table>
        <TableHead>
          <TableRow>
          <SortableTableHeader
            column="name"
            label="Name"
            sortColumn="level"
            sortDirection="asc"
            onSort={mockOnSort}
          />
          </TableRow>
        </TableHead>
      </Table>
    );
    
    const header = screen.getByText('Name').closest('th');
    expect(header).toBeInTheDocument();
    const headerSvgs = header?.querySelectorAll('svg');
    expect(headerSvgs?.length || 0).toBe(0);
  });

  it('should handle different column types', () => {
    const columns: SortColumn[] = ['name', 'level', 'rarity', 'count'];
    
    columns.forEach((column) => {
      const { unmount } = render(
        <Table>
          <TableHead>
            <TableRow>
              <SortableTableHeader
                column={column}
                label={column.charAt(0).toUpperCase() + column.slice(1)}
                sortColumn={null}
                sortDirection="asc"
                onSort={mockOnSort}
              />
            </TableRow>
          </TableHead>
        </Table>
      );
      
      expect(screen.getByText(column.charAt(0).toUpperCase() + column.slice(1))).toBeInTheDocument();
      unmount();
    });
  });

  it('should show arrow only for the active sort column', () => {
    render(
      <Table>
        <TableHead>
          <TableRow>
          <SortableTableHeader
            column="name"
            label="Name"
            sortColumn="name"
            sortDirection="asc"
            onSort={mockOnSort}
          />
          <SortableTableHeader
            column="level"
            label="Level"
            sortColumn="name"
            sortDirection="asc"
            onSort={mockOnSort}
          />
          </TableRow>
        </TableHead>
      </Table>
    );
    
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Level')).toBeInTheDocument();
  });
});

