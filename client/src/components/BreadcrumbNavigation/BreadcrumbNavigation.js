import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import './BreadcrumbNavigation.css';

/**
 * Enhanced Breadcrumb Navigation Component
 * WCAG 2.1 AA compliant with mobile-responsive design
 *
 * @param {Array} items - Array of breadcrumb items
 * @param {string} separator - Separator between breadcrumb items
 * @param {boolean} showHome - Whether to show home link
 * @param {number} maxItems - Maximum items to show on mobile
 * @param {string} ariaLabel - ARIA label for navigation
 * @param {string} className - Additional CSS classes
 */
const BreadcrumbNavigation = ({
    items = [],
    separator = '/',
    showHome = true,
    maxItems = 3,
    ariaLabel,
    className = '',
}) => {
    const { t } = useTranslation('common');

    // Generate home item if showHome is true
    const homeItem = showHome
        ? {
              name: t('navigation.home'),
              path: '/',
              slug: '',
              current: false,
          }
        : null;

    // Combine home with provided items
    const allItems = homeItem ? [homeItem, ...items] : items;

    // Handle empty or invalid items
    if (!allItems || allItems.length === 0) {
        return null;
    }

    // Mobile optimization: truncate items if too many
    const shouldTruncate = allItems.length > maxItems;
    const displayItems = shouldTruncate
        ? [
              allItems[0], // Always show home
              { name: '...', path: null, truncated: true },
              ...allItems.slice(-2), // Show last 2 items
          ]
        : allItems;

    // Generate ARIA label
    const defaultAriaLabel = t('breadcrumb.navigation');
    const navigationAriaLabel = ariaLabel || defaultAriaLabel;

    return (
        <nav
            className={`breadcrumb-navigation ${className}`}
            aria-label={navigationAriaLabel}
            role="navigation"
        >
            <ol className="breadcrumb-list" itemScope itemType="https://schema.org/BreadcrumbList">
                {displayItems.map((item, index) => {
                    const isLast = index === displayItems.length - 1;
                    const isCurrent = item.current || isLast;
                    const isTruncated = item.truncated;

                    return (
                        <li
                            key={`${item.slug || item.name}-${index}`}
                            className={`breadcrumb-item ${isCurrent ? 'current' : ''} ${
                                isTruncated ? 'truncated' : ''
                            }`}
                            itemProp="itemListElement"
                            itemScope
                            itemType="https://schema.org/ListItem"
                        >
                            {isTruncated ? (
                                <span className="breadcrumb-truncated" aria-hidden="true">
                                    {item.name}
                                </span>
                            ) : isCurrent ? (
                                <span
                                    className="breadcrumb-current"
                                    aria-current="page"
                                    itemProp="name"
                                >
                                    {item.name}
                                </span>
                            ) : (
                                <Link
                                    to={item.path}
                                    className="breadcrumb-link"
                                    itemProp="item"
                                    title={`${t('breadcrumb.goTo')} ${item.name}`}
                                >
                                    <span itemProp="name">{item.name}</span>
                                </Link>
                            )}

                            {/* Schema.org position */}
                            <meta itemProp="position" content={index + 1} />

                            {/* Separator */}
                            {!isLast && (
                                <span
                                    className="breadcrumb-separator"
                                    aria-hidden="true"
                                    role="presentation"
                                >
                                    {separator}
                                </span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

BreadcrumbNavigation.propTypes = {
    items: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired,
            path: PropTypes.string,
            slug: PropTypes.string,
            current: PropTypes.bool,
        }),
    ),
    separator: PropTypes.string,
    showHome: PropTypes.bool,
    maxItems: PropTypes.number,
    ariaLabel: PropTypes.string,
    className: PropTypes.string,
};

export default BreadcrumbNavigation;
