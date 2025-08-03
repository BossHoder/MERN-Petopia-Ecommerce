import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BreadcrumbNavigation from '../../../components/BreadcrumbNavigation';
import { useBreadcrumb } from '../../../hooks/useBreadcrumb';
import './AnalyticsEnhanced.css';

// Import tab components
import OverviewTab from './tabs/OverviewTab';
import RevenueTab from './tabs/RevenueTab';
import ProductsTab from './tabs/ProductsTab';
import CustomersTab from './tabs/CustomersTab';
import TrafficTab from './tabs/TrafficTab';
import ConversionTab from './tabs/ConversionTab';
import MarketingTab from './tabs/MarketingTab';

const AnalyticsEnhanced = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [dateRange, setDateRange] = useState('30days');

    // Breadcrumb hook
    const { items: breadcrumbItems } = useBreadcrumb('admin/analytics');

    // Available tabs configuration
    const tabs = [
        {
            id: 'overview',
            label: 'Overview',
            icon: '📊',
            description: 'Key metrics and performance summary',
        },
        {
            id: 'revenue',
            label: 'Revenue',
            icon: '💰',
            description: 'Sales, income and financial performance',
        },
        {
            id: 'products',
            label: 'Products',
            icon: '📦',
            description: 'Product performance and inventory',
        },
        {
            id: 'customers',
            label: 'Customers',
            icon: '👥',
            description: 'Customer behavior and lifetime value',
        },
        {
            id: 'traffic',
            label: 'Traffic',
            icon: '🚀',
            description: 'Website traffic and user acquisition',
        },
        {
            id: 'conversion',
            label: 'Conversion',
            icon: '🎯',
            description: 'Sales funnel and conversion rates',
        },
        {
            id: 'marketing',
            label: 'Marketing',
            icon: '📢',
            description: 'Campaign performance and ROI',
        },
    ];

    // Extract tab from URL parameter
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const tabParam = urlParams.get('tab');

        if (tabParam && tabs.find((tab) => tab.id === tabParam)) {
            setActiveTab(tabParam);
        } else {
            setActiveTab('overview');
        }
    }, [location.search]);

    // Handle tab change
    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        navigate(`/admin/analytics?tab=${tabId}`);
    };

    // Handle date range change
    const handleDateRangeChange = (newRange) => {
        setDateRange(newRange);
    };

    // Render active tab component
    const renderActiveTab = () => {
        const commonProps = { dateRange, onDateRangeChange: handleDateRangeChange };

        switch (activeTab) {
            case 'overview':
                return <OverviewTab {...commonProps} />;
            case 'revenue':
                return <RevenueTab {...commonProps} />;
            case 'products':
                return <ProductsTab {...commonProps} />;
            case 'customers':
                return <CustomersTab {...commonProps} />;
            case 'traffic':
                return <TrafficTab {...commonProps} />;
            case 'conversion':
                return <ConversionTab {...commonProps} />;
            case 'marketing':
                return <MarketingTab {...commonProps} />;
            default:
                return <OverviewTab {...commonProps} />;
        }
    };

    return (
        <div className="analytics-enhanced">
            {/* Breadcrumb Navigation */}
            <BreadcrumbNavigation items={breadcrumbItems} />

            {/* Page Header */}
            <div className="analytics-header">
                <div className="header-content">
                    <h1 className="analytics-title">🔍 Petopia Analytics Dashboard</h1>
                    <p className="analytics-subtitle">
                        Comprehensive insights into your pet store performance
                    </p>
                </div>

                {/* Global Date Range Selector */}
                <div className="global-controls">
                    <select
                        value={dateRange}
                        onChange={(e) => handleDateRangeChange(e.target.value)}
                        className="date-range-select"
                    >
                        <option value="7days">Last 7 days</option>
                        <option value="30days">Last 30 days</option>
                        <option value="90days">Last 90 days</option>
                        <option value="1year">Last year</option>
                    </select>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="analytics-tabs">
                <div className="tabs-container">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => handleTabChange(tab.id)}
                            title={tab.description}
                        >
                            <span className="tab-icon">{tab.icon}</span>
                            <span className="tab-label">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="analytics-content">{renderActiveTab()}</div>
        </div>
    );
};

export default AnalyticsEnhanced;
