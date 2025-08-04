import React, { useState } from 'react';
import { useI18n } from '../../../hooks/useI18n';
import './DateRangeControls.css';

const DateRangeControls = ({
    dateRange,
    customDateFrom,
    customDateTo,
    onDateRangeChange,
    onRefresh,
    loading = false,
}) => {
    const { t } = useI18n();
    const [fromDate, setFromDate] = useState(customDateFrom || '');
    const [toDate, setToDate] = useState(customDateTo || '');

    // Quick date range options for analytics
    const quickRangeOptions = [
        { value: '7days', label: 'Last 7 days' },
        { value: '30days', label: 'Last 30 days' },
        { value: '90days', label: 'Last 90 days' },
    ];

    const handleQuickRangeSelect = (value) => {
        onDateRangeChange({
            range: value,
            customFrom: null,
            customTo: null,
        });

        // Reset date inputs when using quick ranges
        if (value !== 'custom') {
            setFromDate('');
            setToDate('');
        }
    };

    const handleCustomDateApply = () => {
        if (fromDate && toDate) {
            const startDate = new Date(fromDate);
            const endDate = new Date(toDate);

            // Validate date range
            if (startDate > endDate) {
                alert('Start date cannot be after end date');
                return;
            }

            // Set end date to end of day
            endDate.setHours(23, 59, 59, 999);

            onDateRangeChange({
                range: 'custom',
                customFrom: startDate.toISOString(),
                customTo: endDate.toISOString(),
            });
        } else {
            alert('Please select both start and end dates');
        }
    };

    const handleClearDates = () => {
        setFromDate('');
        setToDate('');

        // Reset to default range
        onDateRangeChange({
            range: '30days',
            customFrom: null,
            customTo: null,
        });
    };

    // Format date for input (YYYY-MM-DD)
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    // Get display text for current range
    const getCurrentRangeDisplay = () => {
        if (dateRange === 'custom' && customDateFrom && customDateTo) {
            const from = new Date(customDateFrom).toLocaleDateString();
            const to = new Date(customDateTo).toLocaleDateString();
            return `${from} - ${to}`;
        }
        return quickRangeOptions.find((opt) => opt.value === dateRange)?.label || 'Last 30 days';
    };

    return (
        <div className="date-range-controls">
            {/* Always Visible Date Inputs */}
            <div className="date-inputs-section">
                <div className="date-input-group">
                    <label>From:</label>
                    <input
                        type="date"
                        value={formatDateForInput(fromDate || customDateFrom)}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="date-input"
                        disabled={loading}
                    />
                </div>
                <div className="date-input-group">
                    <label>To:</label>
                    <input
                        type="date"
                        value={formatDateForInput(toDate || customDateTo)}
                        onChange={(e) => setToDate(e.target.value)}
                        className="date-input"
                        disabled={loading}
                    />
                </div>
                <div className="date-actions">
                    <button
                        type="button"
                        onClick={handleCustomDateApply}
                        className="apply-date-btn"
                        disabled={!fromDate || !toDate || loading}
                    >
                        Apply
                    </button>
                    <button
                        type="button"
                        onClick={handleClearDates}
                        className="clear-date-btn"
                        disabled={loading}
                    >
                        Clear
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DateRangeControls;
