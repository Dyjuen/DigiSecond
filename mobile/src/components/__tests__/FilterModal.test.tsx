import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FilterModal } from '../FilterModal';
import { Provider as PaperProvider } from 'react-native-paper';

// Mock dependencies
jest.mock('react-native/src/private/animated/NativeAnimatedHelper');

describe('FilterModal', () => {
    const mockOnApply = jest.fn();
    const mockOnDismiss = jest.fn();
    const mockOnReset = jest.fn();

    const defaultProps = {
        visible: true,
        onDismiss: mockOnDismiss,
        currentFilters: {},
        onApply: mockOnApply,
        onReset: mockOnReset,
    };

    const renderModal = (props = {}) => {
        return render(
            <PaperProvider>
                <FilterModal {...defaultProps} {...props} />
            </PaperProvider>
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders type filter options', () => {
        const { getByText } = renderModal();

        expect(getByText('Tipe Listing')).toBeTruthy();
        expect(getByText('Semua')).toBeTruthy();
        expect(getByText('Listing')).toBeTruthy();
        expect(getByText('Lelang')).toBeTruthy();
    });

    it('selects "Lelang" type and applies filter', () => {
        const { getByText } = renderModal();

        // Select "Lelang"
        fireEvent.press(getByText('Lelang'));

        // Apply
        fireEvent.press(getByText('Terapkan Filter'));

        expect(mockOnApply).toHaveBeenCalledWith(expect.objectContaining({
            type: 'AUCTION'
        }));
    });

    it('selects "Listing" type and applies filter', () => {
        const { getByText } = renderModal();

        // Select "Listing"
        fireEvent.press(getByText('Listing'));

        // Apply
        fireEvent.press(getByText('Terapkan Filter'));

        expect(mockOnApply).toHaveBeenCalledWith(expect.objectContaining({
            type: 'FIXED'
        }));
    });

    it('resets type filter to "all" (undefined in output)', () => {
        const { getByText } = renderModal({
            currentFilters: { type: 'AUCTION' }
        });

        // Reset
        fireEvent.press(getByText('Reset'));

        // Apply (to check what state is currently held)
        fireEvent.press(getByText('Terapkan Filter'));

        expect(mockOnApply).toHaveBeenCalledWith(expect.objectContaining({
            type: undefined
        }));
    });
});
