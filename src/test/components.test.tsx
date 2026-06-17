import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { LogActivityView } from '../components/LogActivityView';
import { DashboardView } from '../components/DashboardView';
import { InsightsView } from '../components/InsightsView';
import { Activity } from '../types';

// Mock Recharts to avoid ResizeObserver/JSDOM canvas size errors
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div className="recharts-responsive">{children}</div>,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div />,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
  CartesianGrid: () => <div />
}));

describe('Component Testing Suite', () => {
  afterEach(() => {
    cleanup();
  });

  describe('LogActivityView Form', () => {
    it('renders the logging options', () => {
      render(<LogActivityView onAddActivity={() => {}} />);
      expect(screen.getByText('Log Daily Activities')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Transport/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Energy/i })).toBeInTheDocument();
    });

    it('displays validation error on negative distance in transport mode', async () => {
      render(<LogActivityView onAddActivity={() => {}} />);
      
      const distanceInput = screen.getByLabelText(/Distance Traveled/i);
      fireEvent.change(distanceInput, { target: { value: '-20' } });
      
      const submitBtn = screen.getByRole('button', { name: /Record Entry in Ledger/i });
      fireEvent.submit(submitBtn.closest('form')!);

      const errorMsg = await screen.findByText('Distance cannot be negative');
      expect(errorMsg).toBeInTheDocument();
    });

    it('triggers callback on valid form submission', () => {
      const mockAdd = vi.fn();
      render(<LogActivityView onAddActivity={mockAdd} />);
      
      const distanceInput = screen.getByLabelText(/Distance Traveled/i);
      fireEvent.change(distanceInput, { target: { value: '45' } });
      
      const submitBtn = screen.getByRole('button', { name: /Record Entry in Ledger/i });
      fireEvent.submit(submitBtn.closest('form')!);

      expect(mockAdd).toHaveBeenCalled();
      expect(mockAdd.mock.calls[0][0].category).toBe('transport');
      expect(mockAdd.mock.calls[0][0].details.distance).toBe(45);
    });
  });

  describe('DashboardView', () => {
    const mockActivities: Activity[] = [
      {
        id: 'act-1',
        date: new Date().toISOString().split('T')[0],
        category: 'transport',
        details: { mode: 'car-petrol', distance: 100 }, // 19.2 kg
        emissions: 19.2
      },
      {
        id: 'act-2',
        date: new Date().toISOString().split('T')[0],
        category: 'energy',
        details: { electricity: 20, lpg: 0 }, // 20 * 0.71 = 14.2 kg
        emissions: 14.2
      }
    ];

    it('renders the aggregated total emissions', () => {
      render(
        <DashboardView 
          activities={mockActivities} 
          onNavigateToLog={() => {}} 
          onNavigateToInsights={() => {}} 
        />
      );
      // Total should be 19.2 + 14.2 = 33.4. Use getAllByText due to screen reader alternative.
      expect(screen.getAllByText('33.4')[0]).toBeInTheDocument();
      // Use getAllByText to locate fragments since texts are split and duplicated for screen readers
      expect(screen.getAllByText(/Transport/i)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/Energy/i)[0]).toBeInTheDocument();
    });

    it('displays comparisons to average baseline', () => {
      render(
        <DashboardView 
          activities={mockActivities} 
          onNavigateToLog={() => {}} 
          onNavigateToInsights={() => {}} 
        />
      );
      expect(screen.getByText(/Average Indian Citizen/i)).toBeInTheDocument();
      expect(screen.getByText(/You are logging/i)).toBeInTheDocument();
    });

    it('toggles the periods when buttons are pressed', () => {
      render(
        <DashboardView 
          activities={mockActivities} 
          onNavigateToLog={() => {}} 
          onNavigateToInsights={() => {}} 
        />
      );
      const btns = screen.getAllByRole('button');
      const monthlyButton = btns.find((b: HTMLElement) => b.textContent?.includes('Monthly'));
      if (monthlyButton) {
        fireEvent.click(monthlyButton);
      }
      expect(screen.getByText('2%')).toBeInTheDocument();
    });
  });

  describe('InsightsView Panel', () => {
    const mockActivities: Activity[] = [
      {
        id: 'act-1',
        date: new Date().toISOString().split('T')[0],
        category: 'transport',
        details: { mode: 'car-petrol', distance: 200 }, // 38.4 kg
        emissions: 38.4
      }
    ];

    it('renders ranked recommendations based on mock activities', () => {
      render(<InsightsView activities={mockActivities} />);
      expect(screen.getByText('Primary Footprint Driver')).toBeInTheDocument();
      expect(screen.getAllByText(/Transport/i)[0]).toBeInTheDocument();
      expect(screen.getByText('Swap Petrol Commutes for Metro/Train')).toBeInTheDocument();
    });
  });
});
