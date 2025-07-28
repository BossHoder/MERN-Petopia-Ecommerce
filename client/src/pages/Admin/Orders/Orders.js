import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useI18n } from '../../../hooks/useI18n';
import {
    getAdminOrders,
    updateOrderStatus,
    clearAdminErrors
} from '../../../store/actions/adminActions';
import AdminTable from '../../../components/Admin/AdminTable/AdminTable';
import AdminPagination from '../../../components/Admin/AdminPagination/AdminPagination';
import BreadcrumbNavigation from '../../../components/BreadcrumbNavigation/BreadcrumbNavigation';
import OrderStatusBadge from '../../../components/Admin/OrderStatusBadge/OrderStatusBadge';
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

    // Redux state
    const {
        orders,
        ordersPagination,
        ordersLoading,
        orderUpdateLoading,
        error,
        success
    } = useSelector((state) => state.admin);

    // Local state
    const [selectedItems, setSelectedItems] = useState([]);
    const [searchInput, setSearchInput] = useState(searchTerm);
    const [statusFilterLocal, setStatusFilterLocal] = useState(statusFilter);

    // Breadcrumb items
    const breadcrumbItems = [
        { label: t('admin.dashboard', 'Dashboard'), path: '/admin/dashboard' },
        { label: t('admin.orders.title', 'Orders Management'), path: '/admin/orders' }
    ];

    // Load orders on component mount and when parameters change
    useEffect(() => {
        dispatch(getAdminOrders(currentPage, limit, statusFilter, searchTerm));
    }, [dispatch, currentPage, limit, statusFilter, searchTerm]);

    // Handle success/error messages
    useEffect(() => {
        if (success) {
            toast.success(success);
            dispatch(clearAdminErrors());
        }
        if (error) {
            toast.error(error);
            dispatch(clearAdminErrors());
        }
    }, [success, error, dispatch]);

    // Order status options
    const statusOptions = [
        { value: 'all', label: t('admin.orders.status.all', 'All Orders') },
        { value: 'pending', label: t('admin.orders.status.pending', 'Pending') },
        { value: 'processing', label: t('admin.orders.status.processing', 'Processing') },
        { value: 'shipped', label: t('admin.orders.status.shipped', 'Shipped') },
        { value: 'delivered', label: t('admin.orders.status.delivered', 'Delivered') },
        { value: 'cancelled', label: t('admin.orders.status.cancelled', 'Cancelled') }
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
            )
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
            )
        },
        {
            key: 'orderStatus',
            title: t('admin.orders.status.title', 'Status'),
            width: '12%',
            align: 'center',
            render: (value) => <OrderStatusBadge status={value} />
        },
        {
            key: 'totalPrice',
            title: t('admin.orders.total', 'Total'),
            width: '10%',
            align: 'right',
            render: (value) => `$${value?.toFixed(2) || '0.00'}`
        },
        {
            key: 'paymentMethod',
            title: t('admin.orders.paymentMethod', 'Payment'),
            width: '12%',
            render: (value) => (
                <span className="payment-method">
                    {t(`admin.orders.payment.${value}`, value?.toUpperCase() || 'N/A')}
                </span>
            )
        },
        {
            key: 'isPaid',
            title: t('admin.orders.paymentStatus', 'Paid'),
            width: '8%',
            align: 'center',
            render: (value) => (
                <span className={`payment-status ${value ? 'paid' : 'unpaid'}`}>
                    {value ? '✅' : '❌'}
                </span>
            )
        },
        {
            key: 'isDelivered',
            title: t('admin.orders.deliveryStatus', 'Delivered'),
            width: '8%',
            align: 'center',
            render: (value) => (
                <span className={`delivery-status ${value ? 'delivered' : 'pending'}`}>
                    {value ? '✅' : '❌'}
                </span>
            )
        },
        {
            key: 'createdAt',
            title: t('admin.orders.dateCreated', 'Date Created'),
            width: '12%',
            render: (value) => new Date(value).toLocaleDateString()
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
                    <button
                        className="table-action-btn edit"
                        onClick={() => handleUpdateStatus(item._id)}
                        title={t('admin.orders.updateStatus', 'Update Status')}
                    >
                        ✏️
                    </button>
                </div>
            )
        }
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

    const handleViewOrder = (orderIdToView) => {
        const params = new URLSearchParams(searchParams);
        params.set('view', 'details');
        params.set('orderId', orderIdToView);
        navigate(`${location.pathname}?${params.toString()}`);
    };

    const handleUpdateStatus = (orderIdToUpdate) => {
        // This will be implemented with a modal/dropdown
        console.log('Update status for order:', orderIdToUpdate);
    };

    const handleCloseDetails = () => {
        const params = new URLSearchParams(searchParams);
        params.delete('view');
        params.delete('orderId');
        navigate(`${location.pathname}?${params.toString()}`);
    };

    // Show order details if view mode is details
    if (viewMode === 'details' && orderId) {
        return (
            <OrderDetails
                orderId={orderId}
                onClose={handleCloseDetails}
            />
        );
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
                    <h1 className="page-title">
                        {t('admin.orders.title', 'Orders Management')}
                    </h1>
                    <p className="page-subtitle">
                        {t('admin.orders.subtitle', 'Manage customer orders, update status, and track deliveries')}
                    </p>
                </div>
            </div>

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
                            placeholder={t('admin.orders.searchPlaceholder', 'Search by order number or customer email...')}
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
                emptyMessage={t('admin.orders.noData', 'No orders found. Orders will appear here once customers start placing orders.')}
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
