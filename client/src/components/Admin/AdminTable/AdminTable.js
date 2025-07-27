import React from 'react';
import { useI18n } from '../../../hooks/useI18n';
import './styles.css';

const AdminTable = ({
    columns,
    data,
    selectedItems,
    onSelectItem,
    onSelectAll,
    loading = false,
    emptyMessage = 'No data available',
    className = '',
}) => {
    const { t } = useI18n();

    const isAllSelected = data.length > 0 && selectedItems.length === data.length;
    const isIndeterminate = selectedItems.length > 0 && selectedItems.length < data.length;

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            onSelectAll(data.map((item) => item._id));
        } else {
            onSelectAll([]);
        }
    };

    const handleSelectItem = (itemId) => {
        if (selectedItems.includes(itemId)) {
            onSelectItem(selectedItems.filter((id) => id !== itemId));
        } else {
            onSelectItem([...selectedItems, itemId]);
        }
    };

    if (loading) {
        return (
            <div className="admin-table-loading">
                <div className="admin-table-skeleton">
                    {[...Array(5)].map((_, index) => (
                        <div key={index} className="admin-table-skeleton-row">
                            {[...Array(columns.length + 1)].map((_, colIndex) => (
                                <div key={colIndex} className="admin-table-skeleton-cell"></div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="admin-table-empty">
                <div className="admin-table-empty-icon">📋</div>
                <h3 className="admin-table-empty-title">{t('table.noData', 'No Data Found')}</h3>
                <p className="admin-table-empty-message">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className={`admin-table-container ${className}`}>
            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead className="admin-table-header">
                        <tr>
                            <th className="admin-table-checkbox-cell">
                                <input
                                    type="checkbox"
                                    checked={isAllSelected}
                                    ref={(input) => {
                                        if (input) input.indeterminate = isIndeterminate;
                                    }}
                                    onChange={handleSelectAll}
                                    className="admin-table-checkbox"
                                    aria-label={t('table.selectAll', 'Select all items')}
                                />
                            </th>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={`admin-table-header-cell ${
                                        column.align ? `text-${column.align}` : ''
                                    }`}
                                    style={{ width: column.width }}
                                >
                                    {column.title}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="admin-table-body">
                        {data.map((item) => (
                            <tr
                                key={item._id}
                                className={`admin-table-row ${
                                    selectedItems.includes(item._id) ? 'selected' : ''
                                }`}
                            >
                                <td className="admin-table-checkbox-cell">
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.includes(item._id)}
                                        onChange={() => handleSelectItem(item._id)}
                                        className="admin-table-checkbox"
                                        aria-label={t('table.selectItem', 'Select item')}
                                    />
                                </td>
                                {columns.map((column) => (
                                    <td
                                        key={column.key}
                                        className={`admin-table-cell ${
                                            column.align ? `text-${column.align}` : ''
                                        }`}
                                    >
                                        {column.render
                                            ? column.render(item[column.key], item)
                                            : item[column.key] || '-'}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminTable;
