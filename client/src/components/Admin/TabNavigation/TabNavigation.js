import React from 'react';
import './TabNavigation.css';

const TabNavigation = ({ activeTab, onTabChange, tabs }) => {
    return (
        <div className="tab-navigation">
            <div className="tab-nav-container">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => onTabChange(tab.id)}
                    >
                        <span className="tab-icon">{tab.icon}</span>
                        <span className="tab-label">{tab.label}</span>
                        {tab.count && <span className="tab-count">{tab.count}</span>}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default TabNavigation;
