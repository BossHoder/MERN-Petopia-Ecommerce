import React, { useState } from 'react';
import { useI18n } from '../../../hooks/useI18n';
import './DateFilter.css';

const DateFilter = ({ 
    dateRange, 
    dateFrom, 
    dateTo, 
    onDateRangeChange, 
    onCustomDateChange,
    onClearFilter 
}) => {
    const { t } = useI18n();
    const [showCustomRange, setShowCustomRange] = useState(dateRange === 'custom');

    // Predefined date range options
    const dateRangeOptions = [
        { value: '', label: t('admin.orders.dateFilter.allTime', 'All Time') },
        { value: 'today', label: t('admin.orders.dateFilter.today', 'Today') },
        { value: 'yesterday', label: t('admin.orders.dateFilter.yesterday', 'Yesterday') },
        { value: 'last7Days', label: t('admin.orders.dateFilter.last7Days', 'Last 7 Days') },
        { value: 'thisWeek', label: t('admin.orders.dateFilter.thisWeek', 'This Week') },
        { value: 'last30Days', label: t('admin.orders.dateFilter.last30Days', 'Last 30 Days') },
        { value: 'thisMonth', label: t('admin.orders.dateFilter.thisMonth', 'This Month') },
        { value: 'lastMonth', label: t('admin.orders.dateFilter.lastMonth', 'Last Month') },
        { value: 'custom', label: t('admin.orders.dateFilter.custom', 'Custom Range') },
    ];

    const handleDateRangeChange = (value) => {
        if (value === 'custom') {
            setShowCustomRange(true);
        } else {
            setShowCustomRange(false);
            onDateRangeChange(value);
        }
    };

    const handleCustomDateSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const fromDate = formData.get('dateFrom');
        const toDate = formData.get('dateTo');
        
        if (fromDate || toDate) {
            onCustomDateChange(fromDate, toDate);
        }
    };

    const handleClearFilter = () => {
        setShowCustomRange(false);
        onClearFilter();
    };

    // Format date for input (YYYY-MM-DD)
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    // Check if any filter is active
    const hasActiveFilter = dateRange || dateFrom || dateTo;

    return (
        <div className="date-filter">
            <div className="date-filter-header">
                <label className="filter-label">
                    📅 {t('admin.orders.dateFilter.title', 'Filter by Date')}
                </label>
                {hasActiveFilter && (
                    <button 
                        type="button" 
                        className="clear-filter-btn"
                        onClick={handleClearFilter}
                        title={t('admin.orders.dateFilter.clearFilter', 'Clear date filter')}
                    >
                        ✕
                    </button>
                )}
            </div>

            <div className="date-filter-content">
                {/* Predefined Date Ranges */}
                <div className="date-range-selector">
                    <select
                        value={showCustomRange ? 'custom' : dateRange}
                        onChange={(e) => handleDateRangeChange(e.target.value)}
                        className="date-range-select"
                    >
                        {dateRangeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Custom Date Range */}
                {showCustomRange && (
                    <form onSubmit={handleCustomDateSubmit} className="custom-date-range">
                        <div className="date-inputs">
                            <div className="date-input-group">
                                <label htmlFor="dateFrom" className="date-label">
                                    {t('admin.orders.dateFilter.from', 'From')}
                                </label>
                                <input
                                    type="date"
                                    id="dateFrom"
                                    name="dateFrom"
                                    defaultValue={formatDateForInput(dateFrom)}
                                    className="date-input"
                                />
                            </div>
                            <div className="date-input-group">
                                <label htmlFor="dateTo" className="date-label">
                                    {t('admin.orders.dateFilter.to', 'To')}
                                </label>
                                <input
                                    type="date"
                                    id="dateTo"
                                    name="dateTo"
                                    defaultValue={formatDateForInput(dateTo)}
                                    className="date-input"
                                />
                            </div>
                        </div>
                        <div className="custom-date-actions">
                            <button type="submit" className="apply-date-btn">
                                {t('admin.orders.dateFilter.apply', 'Apply')}
                            </button>
                            <button 
                                type="button" 
                                className="cancel-date-btn"
                                onClick={() => setShowCustomRange(false)}
                            >
                                {t('common.cancel', 'Cancel')}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Active Filter Display */}
            {hasActiveFilter && (
                <div className="active-filter-display">
                    <span className="active-filter-text">
                        {dateRange && dateRange !== 'custom' && (
                            <>
                                📅 {dateRangeOptions.find(opt => opt.value === dateRange)?.label}
                            </>
                        )}
                        {(dateFrom || dateTo) && (
                            <>
                                📅 {dateFrom && new Date(dateFrom).toLocaleDateString()} 
                                {dateFrom && dateTo && ' - '}
                                {dateTo && new Date(dateTo).toLocaleDateString()}
                            </>
                        )}
                    </span>
                </div>
            )}
        </div>
    );
};

export default DateFilter;
