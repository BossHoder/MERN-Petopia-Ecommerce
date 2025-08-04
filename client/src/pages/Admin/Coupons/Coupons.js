import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useI18n } from '../../../hooks/useI18n';
import {
    getAdminCoupons,
    deleteCoupon,
    bulkDeleteCoupons,
    clearAdminErrors,
} from '../../../store/actions/adminActions';
import AdminTable from '../../../components/Admin/AdminTable/AdminTable';
import AdminPagination from '../../../components/Admin/AdminPagination/AdminPagination';
import BreadcrumbNavigation from '../../../components/BreadcrumbNavigation/BreadcrumbNavigation';
import CouponForm from './CouponForm';
import './styles.css';

const Coupons = () => {
    const { t } = useI18n();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    // State
    const [selectedItems, setSelectedItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [discountTypeFilter, setDiscountTypeFilter] = useState('all');

    // Get URL parameters
    const currentPage = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const tab = searchParams.get('tab');
    const editId = searchParams.get('id');

    // Redux state
    const { coupons, couponsPagination, couponsLoading, couponDeleteLoading, error } = useSelector(
        (state) => state.admin,
    );

    // Load coupons on component mount and when parameters change
    useEffect(() => {
        const filters = {};
        if (statusFilter !== 'all') {
            filters.isActive = statusFilter === 'active';
        }
        if (discountTypeFilter !== 'all') {
            filters.discountType = discountTypeFilter;
        }

        dispatch(getAdminCoupons(currentPage, limit, searchTerm, sortBy, sortOrder, filters));
    }, [
        dispatch,
        currentPage,
        limit,
        searchTerm,
        sortBy,
        sortOrder,
        statusFilter,
        discountTypeFilter,
    ]);

    // Handle errors
    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearAdminErrors());
        }
    }, [error, dispatch]);

    // Table columns configuration
    const columns = [
        {
            key: 'code',
            title: t('admin.coupons.code', 'Code'),
            width: '15%',
            render: (value) => <span className="coupon-code">{value}</span>,
        },
        {
            key: 'description',
            title: t('admin.coupons.description', 'Description'),
            width: '25%',
            render: (value) => (
                <span className="coupon-description" title={value}>
                    {value.length > 50 ? `${value.substring(0, 50)}...` : value}
                </span>
            ),
        },
        {
            key: 'discountType',
            title: t('admin.coupons.discountType', 'Type'),
            width: '10%',
            render: (value) => (
                <span className={`discount-type ${value}`}>
                    {value === 'percentage' ? '%' : 'đ'}
                </span>
            ),
        },
        {
            key: 'discountValue',
            title: t('admin.coupons.discountValue', 'Value'),
            width: '10%',
            render: (value, item) => (
                <span className="discount-value">
                    {item.discountType === 'percentage' ? `${value}%` : `${value}đ`}
                </span>
            ),
        },
        {
            key: 'usageCount',
            title: t('admin.coupons.usage', 'Usage'),
            width: '10%',
            render: (value, item) => (
                <span className="usage-count">
                    {value}/{item.usageLimit || '∞'}
                </span>
            ),
        },
        {
            key: 'validUntil',
            title: t('admin.coupons.validUntil', 'Valid Until'),
            width: '12%',
            render: (value) => new Date(value).toLocaleDateString(),
        },
        {
            key: 'isActive',
            title: t('admin.coupons.status', 'Status'),
            width: '8%',
            align: 'center',
            render: (value, item) => (
                <span className={`status-badge ${value ? 'active' : 'inactive'}`}>
                    {value ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                </span>
            ),
        },
        {
            key: 'createdAt',
            title: t('admin.coupons.dateCreated', 'Date Created'),
            width: '12%',
            render: (value) => new Date(value).toLocaleDateString(),
        },
        {
            key: 'actions',
            title: t('admin.coupons.actions', 'Actions'),
            width: '8%',
            align: 'center',
            render: (_, item) => (
                <div className="table-actions">
                    <button
                        className="table-action-btn edit"
                        onClick={() => handleEdit(item.id)}
                        title={t('common.edit', 'Edit')}
                    >
                        ✏️
                    </button>
                    <button
                        className="table-action-btn delete"
                        onClick={() => handleDelete([item.id])}
                        title={t('common.delete', 'Delete')}
                    >
                        🗑️
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
        params.set('page', '1');
        if (searchTerm) {
            params.set('search', searchTerm);
        } else {
            params.delete('search');
        }
        navigate(`${location.pathname}?${params.toString()}`);
    };

    const handleStatusFilter = (status) => {
        setStatusFilter(status);
        const params = new URLSearchParams(searchParams);
        params.set('page', '1');
        if (status !== 'all') {
            params.set('status', status);
        } else {
            params.delete('status');
        }
        navigate(`${location.pathname}?${params.toString()}`);
    };

    const handleDiscountTypeFilter = (type) => {
        setDiscountTypeFilter(type);
        const params = new URLSearchParams(searchParams);
        params.set('page', '1');
        if (type !== 'all') {
            params.set('discountType', type);
        } else {
            params.delete('discountType');
        }
        navigate(`${location.pathname}?${params.toString()}`);
    };

    const handleAdd = () => {
        const params = new URLSearchParams(searchParams);
        params.set('tab', 'addnew');
        navigate(`${location.pathname}?${params.toString()}`);
    };

    const handleEdit = (couponId) => {
        const params = new URLSearchParams(searchParams);
        params.set('tab', 'edit');
        params.set('id', couponId);
        navigate(`${location.pathname}?${params.toString()}`);
    };

    const handleDelete = async (ids) => {
        if (
            !window.confirm(
                t(
                    'admin.coupons.confirmDelete',
                    'Are you sure you want to delete the selected coupon(s)?',
                ),
            )
        ) {
            return;
        }

        try {
            if (ids.length === 1) {
                await dispatch(deleteCoupon(ids[0]));
                toast.success(t('admin.coupons.deleteSuccess', 'Coupon deleted successfully'));
            } else {
                await dispatch(bulkDeleteCoupons(ids));
                toast.success(t('admin.coupons.bulkDeleteSuccess', 'Coupons deleted successfully'));
            }
            setSelectedItems([]);
            // Reload data
            dispatch(getAdminCoupons(currentPage, limit, searchTerm, sortBy, sortOrder));
        } catch (error) {
            toast.error(t('admin.coupons.deleteError', 'Failed to delete coupon(s)'));
        }
    };

    const handleSelectItem = (selectedIds) => {
        setSelectedItems(selectedIds);
    };

    const handleSelectAll = (selectedIds) => {
        setSelectedItems(selectedIds);
    };

    const handleFormClose = () => {
        const params = new URLSearchParams(searchParams);
        params.delete('tab');
        params.delete('id');
        navigate(`${location.pathname}?${params.toString()}`);
    };

    const handleFormSuccess = () => {
        handleFormClose();
        // Reload data
        dispatch(getAdminCoupons(currentPage, limit, searchTerm, sortBy, sortOrder));
    };

    // Show form if tab parameter is present
    if (tab === 'addnew' || tab === 'edit') {
        return (
            <CouponForm
                mode={tab}
                couponId={editId}
                onClose={handleFormClose}
                onSuccess={handleFormSuccess}
            />
        );
    }

    const canEdit = selectedItems.length === 1;
    const canDelete = selectedItems.length > 0;
    const canAdd = selectedItems.length === 0;

    return (
        <div className="admin-coupons">
            {/* Breadcrumb */}
            <BreadcrumbNavigation />

            {/* Header */}
            <div className="admin-page-header">
                <div className="admin-page-title">
                    <h1>{t('admin.coupons.title', 'Coupons Management')}</h1>
                    <p className="admin-page-subtitle">
                        {t(
                            'admin.coupons.subtitle',
                            'Manage discount coupons and promotional codes',
                        )}
                    </p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="admin-toolbar">
                <div className="admin-toolbar-left">
                    <form onSubmit={handleSearch} className="admin-search-form">
                        <input
                            type="text"
                            placeholder={t('admin.coupons.searchPlaceholder', 'Search coupons...')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="admin-search-input"
                        />
                        <button type="submit" className="admin-search-btn">
                            🔍
                        </button>
                    </form>

                    {/* Filters */}
                    <div className="admin-filters">
                        <select
                            value={statusFilter}
                            onChange={(e) => handleStatusFilter(e.target.value)}
                            className="admin-filter-select"
                        >
                            <option value="all">
                                {t('admin.coupons.allStatuses', 'All Statuses')}
                            </option>
                            <option value="active">{t('common.active', 'Active')}</option>
                            <option value="inactive">{t('common.inactive', 'Inactive')}</option>
                        </select>

                        <select
                            value={discountTypeFilter}
                            onChange={(e) => handleDiscountTypeFilter(e.target.value)}
                            className="admin-filter-select"
                        >
                            <option value="all">{t('admin.coupons.allTypes', 'All Types')}</option>
                            <option value="percentage">
                                {t('admin.coupons.percentage', 'Percentage')}
                            </option>
                            <option value="fixed">
                                {t('admin.coupons.fixed', 'Fixed Amount')}
                            </option>
                        </select>
                    </div>
                </div>

                <div className="admin-toolbar-right">
                    <button
                        className="admin-btn admin-btn-primary"
                        onClick={handleAdd}
                        disabled={!canAdd}
                    >
                        ➕ {t('admin.coupons.addNew', 'Add New Coupon')}
                    </button>
                    {canEdit && (
                        <button
                            className="admin-btn admin-btn-secondary"
                            onClick={() => handleEdit(selectedItems[0])}
                        >
                            ✏️ {t('common.edit', 'Edit')}
                        </button>
                    )}
                    {canDelete && (
                        <button
                            className="admin-btn admin-btn-danger"
                            onClick={() => handleDelete(selectedItems)}
                            disabled={couponDeleteLoading}
                        >
                            🗑️ {t('common.delete', 'Delete')} ({selectedItems.length})
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <AdminTable
                columns={columns}
                data={coupons}
                selectedItems={selectedItems}
                onSelectItem={handleSelectItem}
                onSelectAll={handleSelectAll}
                loading={couponsLoading}
                emptyMessage={t('admin.coupons.noCoupons', 'No coupons found')}
            />

            {/* Pagination */}
            <AdminPagination
                pagination={couponsPagination}
                onPageChange={handlePageChange}
                limit={limit}
            />
        </div>
    );
};

export default Coupons;
