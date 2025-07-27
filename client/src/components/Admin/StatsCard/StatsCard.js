import React from 'react';
import { useI18n } from '../../../hooks/useI18n';
import './styles.css';

const StatsCard = ({
    title,
    value,
    icon,
    trend,
    trendValue,
    color = 'default',
    loading = false,
}) => {
    const { t } = useI18n();
    const formatValue = (val) => {
        if (typeof val === 'number') {
            if (val >= 1000000) {
                return `${(val / 1000000).toFixed(1)}M`;
            } else if (val >= 1000) {
                return `${(val / 1000).toFixed(1)}K`;
            }
            return val.toLocaleString();
        }
        return val;
    };

    const getTrendIcon = () => {
        if (trend === 'up') return '📈';
        if (trend === 'down') return '📉';
        return '➡️';
    };

    const getTrendClass = () => {
        if (trend === 'up') return 'trend-up';
        if (trend === 'down') return 'trend-down';
        return 'trend-neutral';
    };

    if (loading) {
        return (
            <div className={`stats-card stats-card-${color} loading`}>
                <div className="stats-card-content">
                    <div className="stats-header">
                        <div className="stats-icon skeleton"></div>
                        <div className="stats-trend skeleton"></div>
                    </div>
                    <div className="stats-body">
                        <div className="stats-value skeleton"></div>
                        <div className="stats-title skeleton"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`stats-card stats-card-${color}`}>
            <div className="stats-card-content">
                <div className="stats-header">
                    <div className="stats-icon">{icon}</div>
                    {trend && trendValue && (
                        <div className={`stats-trend ${getTrendClass()}`}>
                            <span className="trend-icon">{getTrendIcon()}</span>
                            <span className="trend-value">{trendValue}%</span>
                        </div>
                    )}
                </div>

                <div className="stats-body">
                    <div className="stats-value">{formatValue(value)}</div>
                    <div className="stats-title">{title}</div>
                </div>
            </div>
        </div>
    );
};

export default StatsCard;
