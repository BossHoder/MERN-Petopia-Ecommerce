import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useI18n } from '../../../hooks/useI18n';
import { showSuccessToast, showErrorToast, showToastWithReload } from '../../../utils/toastUtils';
import {
    getAdminOrders,
    updateOrderStatus,
    updatePaymentStatus,
    clearAdminErrors,
} from '../../../store/actions/adminActions';
import AdminTable from '../../../components/Admin/AdminTable/AdminTable';
import AdminPagination from '../../../components/Admin/AdminPagination/AdminPagination';
import BreadcrumbNavigation from '../../../components/BreadcrumbNavigation/BreadcrumbNavigation';
import OrderStatusBadge from '../../../components/Admin/OrderStatusBadge/OrderStatusBadge';
import PaymentStatusControl from '../../../components/Admin/PaymentStatusControl/PaymentStatusControl';
import OrderStatusControl from '../../../components/Admin/OrderStatusControl/OrderStatusControl';
import DateFilter from '../../../components/Admin/DateFilter/DateFilter';
import OrderDetails from './OrderDetails';
import './styles.css';

const Orders = () => {
    const { t } = useI18n();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    // Get URL parameters
    const currentPage = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const statusFilter = searchParams.get('status') || 'all';
    const searchTerm = searchParams.get('search') || '';
    const viewMode = searchParams.get('view') || 'list';
    const orderId = searchParams.get('orderId');
    const dateRange = searchParams.get('dateRange') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';

    // Redux state
    const { orders, ordersPagination, ordersLoading, orderUpdateLoading, error, success } =
        useSelector((state) => state.admin);

    // Local state
    const [selectedItems, setSelectedItems] = useState([]);
    const [searchInput, setSearchInput] = useState(searchTerm);
    const [statusFilterLocal, setStatusFilterLocal] = useState(statusFilter);

    // Breadcrumb items
    const breadcrumbItems = [
        { name: t('admin.title', 'Admin Dashboard'), path: '/admin/dashboard' },
        { name: t('admin.orders.title', 'Orders Management'), path: '/admin/orders' },
    ];

    // Load orders on component mount and when parameters change
    useEffect(() => {
        dispatch(
            getAdminOrders(
                currentPage,
                limit,
                statusFilter,
                searchTerm,
                dateRange,
                dateFrom,
                dateTo,
            ),
        );
    }, [dispatch, currentPage, limit, statusFilter, searchTerm, dateRange, dateFrom, dateTo]);

    // Handle success/error messages
    useEffect(() => {
        if (success) {
            showSuccessToast(success);
            dispatch(clearAdminErrors());
        }
        if (error) {
            showErrorToast(error);
            dispatch(clearAdminErrors());
        }
    }, [success, error, dispatch]);

    // Order status options
    const statusOptions = [
        { value: 'all', label: t('admin.orders.status.all', 'All Orders') },
        { value: 'pending', label: t('admin.orders.status.pending', 'Pending') },
        { value: 'processing', label: t('admin.orders.status.processing', 'Processing') },
        { value: 'delivering', label: t('admin.orders.status.delivering', 'Delivering') },
        { value: 'delivered', label: t('admin.orders.status.delivered', 'Delivered') },
        { value: 'cancelled', label: t('admin.orders.status.cancelled', 'Cancelled') },
    ];

    // Table columns configuration
    const columns = [
        {
            key: 'orderNumber',
            title: t('admin.orders.orderNumber', 'Order #'),
            width: '12%',
            render: (value, item) => (
                <div className="order-number-cell">
                    <span className="order-number">{value}</span>
                    {item.isGuestOrder && (
                        <span className="guest-badge">{t('admin.orders.guest', 'Guest')}</span>
                    )}
                </div>
            ),
        },
        {
            key: 'customer',
            title: t('admin.orders.customer', 'Customer'),
            width: '18%',
            render: (_, item) => (
                <div className="customer-cell">
                    <div className="customer-name">
                        {item.user ? item.user.name : item.guestInfo?.fullName || 'N/A'}
                    </div>
                    <div className="customer-email">
                        {item.user ? item.user.email : item.guestInfo?.email || 'N/A'}
                    </div>
                </div>
            ),
        },
        {
            key: 'orderStatus',
            title: t('admin.orders.status.title', 'Status'),
            width: '18%',
            align: 'center',
            render: (value, item) => (
                <OrderStatusControl
                    currentStatus={value}
                    orderId={item._id}
                    orderNumber={item.orderNumber}
                    isPaid={item.isPaid}
                    paymentMethod={item.paymentMethod}
                    onStatusUpdate={handleUpdateStatus}
                    size="small"
                />
            ),
        },
        {
            key: 'totalPrice',
            title: t('admin.orders.total', 'Total'),
            width: '10%',
            align: 'right',
            render: (value) => `$${value?.toFixed(2) || '0.00'}`,
        },
        {
            key: 'paymentMethod',
            title: t('admin.orders.paymentMethod', 'Payment'),
            width: '12%',
            render: (value) => (
                <span className="payment-method">
                    {t(`admin.orders.payment.${value}`, value?.toUpperCase() || 'N/A')}
                </span>
            ),
        },
        {
            key: 'isPaid',
            title: t('admin.orders.paymentStatusControl.title', 'Payment Status'),
            width: '12%',
            align: 'center',
            render: (value, item) => (
                <PaymentStatusControl
                    currentStatus={value}
                    orderId={item._id}
                    orderStatus={item.orderStatus}
                    onStatusUpdate={handlePaymentStatusUpdate}
                    size="small"
                />
            ),
        },
        {
            key: 'createdAt',
            title: t('admin.orders.dateCreated', 'Date Created'),
            width: '12%',
            render: (value) => new Date(value).toLocaleDateString(),
        },
        {
            key: 'actions',
            title: t('admin.orders.actions', 'Actions'),
            width: '8%',
            align: 'center',
            render: (_, item) => (
                <div className="table-actions">
                    <button
                        className="table-action-btn view"
                        onClick={() => handleViewOrder(item._id)}
                        title={t('admin.orders.viewDetails', 'View Details')}
                    >
                        👁️
                    </button>
                </div>
            ),
        },
    ];

    // Event handlers
    const handlePageChange = (page) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', page);
        navigate(`${location.pathname}?${params.toString()}`);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams);
        if (searchInput.trim()) {
            params.set('search', searchInput.trim());
        } else {
            params.delete('search');
        }
        params.set('page', '1'); // Reset to first page
        navigate(`${location.pathname}?${params.toString()}`);
    };

    const handleStatusFilter = (status) => {
        setStatusFilterLocal(status);
        const params = new URLSearchParams(searchParams);
        if (status !== 'all') {
            params.set('status', status);
        } else {
            params.delete('status');
        }
        params.set('page', '1'); // Reset to first page
        navigate(`${location.pathname}?${params.toString()}`);
    };

    // Date filter handlers
    const handleDateRangeChange = (range) => {
        const params = new URLSearchParams(searchParams);
        if (range) {
            params.set('dateRange', range);
            // Clear custom date params when using predefined range
            params.delete('dateFrom');
            params.delete('dateTo');
        } else {
            params.delete('dateRange');
        }
        params.set('page', '1'); // Reset to first page
        navigate(`${location.pathname}?${params.toString()}`);
    };

    const handleCustomDateChange = (fromDate, toDate) => {
        const params = new URLSearchParams(searchParams);
        // Clear predefined range when using custom dates
        params.delete('dateRange');

        if (fromDate) {
            params.set('dateFrom', fromDate);
        } else {
            params.delete('dateFrom');
        }

        if (toDate) {
            params.set('dateTo', toDate);
        } else {
            params.delete('dateTo');
        }

        params.set('page', '1'); // Reset to first page
        navigate(`${location.pathname}?${params.toString()}`);
    };

    const handleClearDateFilter = () => {
        const params = new URLSearchParams(searchParams);
        params.delete('dateRange');
        params.delete('dateFrom');
        params.delete('dateTo');
        params.set('page', '1'); // Reset to first page
        navigate(`${location.pathname}?${params.toString()}`);
    };

    // Auto-reload function
    const reloadOrders = () => {
        dispatch(
            getAdminOrders(
                currentPage,
                10, // Default page size
                statusFilter,
                searchTerm,
                dateRange,
                dateFrom,
                dateTo,
            ),
        );
    };

    const handleViewOrder = (orderIdToView) => {
        const params = new URLSearchParams(searchParams);
        params.set('view', 'details');
        params.set('orderId', orderIdToView);
        navigate(`${location.pathname}?${params.toString()}`);
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await dispatch(updateOrderStatus(orderId, newStatus));
            showToastWithReload(
                t('admin.orders.statusUpdateSuccess', 'Order status updated successfully'),
                'success',
                reloadOrders,
                1500,
            );
        } catch (error) {
            showErrorToast(t('admin.orders.statusUpdateError', 'Failed to update order status'));
        }
    };

    // Handle payment status update
    const handlePaymentStatusUpdate = async (orderId, isPaid) => {
        try {
            await dispatch(updatePaymentStatus(orderId, isPaid));
            showToastWithReload(
                t(
                    'admin.orders.paymentStatusControl.updateSuccess',
                    'Payment status updated successfully',
                ),
                'success',
                reloadOrders,
                1500,
            );
        } catch (error) {
            showErrorToast(
                t(
                    'admin.orders.paymentStatusControl.updateError',
                    'Failed to update payment status',
                ),
            );
        }
    };

    const handleCloseDetails = () => {
        const params = new URLSearchParams(searchParams);
        params.delete('view');
        params.delete('orderId');
        navigate(`${location.pathname}?${params.toString()}`);
    };

    // Show order details if view mode is details
    if (viewMode === 'details' && orderId) {
        return <OrderDetails orderId={orderId} onClose={handleCloseDetails} />;
    }

    const canBulkUpdate = selectedItems.length > 0;

    return (
        <div className="admin-orders">
            {/* Breadcrumb Navigation */}
            <BreadcrumbNavigation
                items={breadcrumbItems}
                ariaLabel={t('breadcrumb.ordersManagement', 'Orders management navigation')}
            />

            {/* Page Header */}
            <div className="page-header">
                <div className="header-content">
                    <h1 className="page-title">{t('admin.orders.title', 'Orders Management')}</h1>
                    <p className="page-subtitle">
                        {t(
                            'admin.orders.subtitle',
                            'Manage customer orders, update status, and track deliveries',
                        )}
                    </p>
                </div>
            </div>

            {/* Date Filter */}
            <DateFilter
                dateRange={dateRange}
                dateFrom={dateFrom}
                dateTo={dateTo}
                onDateRangeChange={handleDateRangeChange}
                onCustomDateChange={handleCustomDateChange}
                onClearFilter={handleClearDateFilter}
            />

            {/* Filters and Search */}
            <div className="page-controls">
                <div className="controls-left">
                    {/* Status Filter */}
                    <div className="filter-group">
                        <label className="filter-label">
                            {t('admin.orders.filterByStatus', 'Filter by Status')}
                        </label>
                        <select
                            value={statusFilterLocal}
                            onChange={(e) => handleStatusFilter(e.target.value)}
                            className="filter-select"
                        >
                            {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="controls-right">
                    {/* Search */}
                    <form onSubmit={handleSearch} className="search-form">
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder={t(
                                'admin.orders.searchPlaceholder',
                                'Search by order number or customer email...',
                            )}
                            className="search-input"
                        />
                        <button type="submit" className="search-btn">
                            🔍
                        </button>
                    </form>
                </div>
            </div>

            {/* Bulk Actions */}
            {canBulkUpdate && (
                <div className="bulk-actions">
                    <span className="selected-count">
                        {t('admin.orders.selectedCount', `${selectedItems.length} orders selected`)}
                    </span>
                    <div className="bulk-buttons">
                        <button
                            className="bulk-btn update"
                            onClick={() => console.log('Bulk update status')}
                        >
                            {t('admin.orders.bulkUpdateStatus', 'Update Status')}
                        </button>
                    </div>
                </div>
            )}

            {/* Table */}
            <AdminTable
                columns={columns}
                data={orders}
                selectedItems={selectedItems}
                onSelectItem={setSelectedItems}
                onSelectAll={setSelectedItems}
                loading={ordersLoading}
                emptyMessage={t(
                    'admin.orders.noData',
                    'No orders found. Orders will appear here once customers start placing orders.',
                )}
            />

            {/* Pagination */}
            <AdminPagination
                pagination={ordersPagination}
                onPageChange={handlePageChange}
                limit={limit}
            />
        </div>
    );
};

export default Orders;
