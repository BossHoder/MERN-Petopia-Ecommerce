import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useI18n } from '../../../hooks/useI18n';
import {
    getAdminProducts,
    deleteProduct,
    bulkDeleteProducts,
    clearAdminErrors
} from '../../../store/actions/adminActions';
import AdminTable from '../../../components/Admin/AdminTable/AdminTable';
import AdminPagination from '../../../components/Admin/AdminPagination/AdminPagination';
import ProductForm from './ProductForm';
import './styles.css';

const Products = () => {
    const { t } = useI18n();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    // Local state
    const [selectedItems, setSelectedItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
    const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Redux state
    const {
        products,
        productsPagination,
        productsLoading,
        productDeleteLoading,
        error,
        success
    } = useSelector(state => state.admin);

    // URL parameters
    const currentPage = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const tab = searchParams.get('tab');
    const editId = searchParams.get('id');

    // Load data on component mount and when parameters change
    useEffect(() => {
        dispatch(getAdminProducts(currentPage, limit, searchTerm, sortBy, sortOrder));
    }, [dispatch, currentPage, limit, searchTerm, sortBy, sortOrder]);

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

    // Table columns configuration
    const columns = [
        {
            key: 'name',
            title: t('admin.products.name', 'Name'),
            width: '25%',
            render: (value, item) => (
                <div className="product-name">
                    <div className="product-image">
                        <img src={item.images?.[0] || '/placeholder-product.jpg'} alt={value} />
                    </div>
                    <div className="product-info">
                        <span className="name">{value}</span>
                        <span className="sku">SKU: {item.sku || 'N/A'}</span>
                    </div>
                </div>
            )
        },
        {
            key: 'category',
            title: t('admin.products.category', 'Category'),
            width: '15%',
            render: (value) => value?.name || '-'
        },
        {
            key: 'price',
            title: t('admin.products.price', 'Price'),
            width: '10%',
            align: 'right',
            render: (value) => `$${value?.toFixed(2) || '0.00'}`
        },
        {
            key: 'stock',
            title: t('admin.products.stock', 'Stock'),
            width: '10%',
            align: 'center',
            render: (value) => (
                <span className={`stock-badge ${value > 10 ? 'in-stock' : value > 0 ? 'low-stock' : 'out-of-stock'}`}>
                    {value || 0}
                </span>
            )
        },
        {
            key: 'isPublished',
            title: t('admin.products.status', 'Status'),
            width: '10%',
            align: 'center',
            render: (value) => (
                <span className={`status-badge ${value ? 'published' : 'unpublished'}`}>
                    {value ? t('common.published', 'Published') : t('common.unpublished', 'Unpublished')}
                </span>
            )
        },
        {
            key: 'isFeatured',
            title: t('admin.products.featured', 'Featured'),
            width: '10%',
            align: 'center',
            render: (value) => (
                <span className={`featured-badge ${value ? 'featured' : 'not-featured'}`}>
                    {value ? '⭐' : '-'}
                </span>
            )
        },
        {
            key: 'createdAt',
            title: t('admin.products.dateAdded', 'Date Added'),
            width: '15%',
            render: (value) => new Date(value).toLocaleDateString()
        },
        {
            key: 'actions',
            title: t('admin.products.actions', 'Actions'),
            width: '5%',
            align: 'center',
            render: (_, item) => (
                <div className="table-actions">
                    <button
                        className="table-action-btn edit"
                        onClick={() => handleEdit(item._id)}
                        title={t('common.edit', 'Edit')}
                    >
                        ✏️
                    </button>
                    <button
                        className="table-action-btn delete"
                        onClick={() => handleDelete([item._id])}
                        title={t('common.delete', 'Delete')}
                    >
                        🗑️
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
        params.set('search', searchTerm);
        params.set('page', '1');
        navigate(`${location.pathname}?${params.toString()}`);
    };

    const handleSort = (newSortBy) => {
        const newSortOrder = sortBy === newSortBy && sortOrder === 'desc' ? 'asc' : 'desc';
        const params = new URLSearchParams(searchParams);
        params.set('sortBy', newSortBy);
        params.set('sortOrder', newSortOrder);
        params.set('page', '1');
        navigate(`${location.pathname}?${params.toString()}`);
        setSortBy(newSortBy);
        setSortOrder(newSortOrder);
    };

    const handleAddNew = () => {
        const params = new URLSearchParams(searchParams);
        params.set('tab', 'addnew');
        navigate(`${location.pathname}?${params.toString()}`);
    };

    const handleEdit = (id) => {
        const params = new URLSearchParams(searchParams);
        params.set('tab', 'edit');
        params.set('id', id);
        navigate(`${location.pathname}?${params.toString()}`);
    };

    const handleDelete = (ids) => {
        setSelectedItems(ids);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        try {
            if (selectedItems.length === 1) {
                await dispatch(deleteProduct(selectedItems[0]));
            } else {
                await dispatch(bulkDeleteProducts(selectedItems));
            }
            setSelectedItems([]);
            setShowDeleteConfirm(false);
            // Reload data
            dispatch(getAdminProducts(currentPage, limit, searchTerm, sortBy, sortOrder));
        } catch (error) {
            console.error('Delete failed:', error);
        }
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
        dispatch(getAdminProducts(currentPage, limit, searchTerm, sortBy, sortOrder));
    };

    // Show form if tab parameter is present
    if (tab === 'addnew' || tab === 'edit') {
        return (
            <ProductForm
                mode={tab}
                productId={editId}
                onClose={handleFormClose}
                onSuccess={handleFormSuccess}
            />
        );
    }

    const canEdit = selectedItems.length === 1;
    const canDelete = selectedItems.length > 0;
    const canAdd = selectedItems.length === 0;

    return (
        <div className="admin-products">
            {/* Header */}
            <div className="admin-page-header">
                <div className="admin-page-title">
                    <h1>{t('admin.products.title', 'Products Management')}</h1>
                    <p className="admin-page-subtitle">
                        {t('admin.products.subtitle', 'Manage your product catalog')}
                    </p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="admin-toolbar">
                <div className="admin-toolbar-left">
                    <form onSubmit={handleSearch} className="admin-search-form">
                        <input
                            type="text"
                            placeholder={t('admin.products.searchPlaceholder', 'Search products...')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="admin-search-input"
                        />
                        <button type="submit" className="admin-search-btn">
                            🔍
                        </button>
                    </form>
                    
                    <div className="admin-sort-controls">
                        <select
                            value={`${sortBy}-${sortOrder}`}
                            onChange={(e) => {
                                const [newSortBy, newSortOrder] = e.target.value.split('-');
                                handleSort(newSortBy);
                            }}
                            className="admin-sort-select"
                        >
                            <option value="name-asc">{t('admin.sort.nameAZ', 'Name: A-Z')}</option>
                            <option value="name-desc">{t('admin.sort.nameZA', 'Name: Z-A')}</option>
                            <option value="price-asc">{t('admin.sort.priceLowHigh', 'Price: Low to High')}</option>
                            <option value="price-desc">{t('admin.sort.priceHighLow', 'Price: High to Low')}</option>
                            <option value="createdAt-desc">{t('admin.sort.newestFirst', 'Newest First')}</option>
                            <option value="createdAt-asc">{t('admin.sort.oldestFirst', 'Oldest First')}</option>
                        </select>
                    </div>
                </div>

                <div className="admin-toolbar-right">
                    <button
                        className="admin-btn admin-btn-primary"
                        onClick={handleAddNew}
                        disabled={!canAdd}
                    >
                        ➕ {t('admin.products.addNew', 'Add New Product')}
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
                            disabled={productDeleteLoading}
                        >
                            🗑️ {t('common.delete', 'Delete')} ({selectedItems.length})
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <AdminTable
                columns={columns}
                data={products}
                selectedItems={selectedItems}
                onSelectItem={setSelectedItems}
                onSelectAll={setSelectedItems}
                loading={productsLoading}
                emptyMessage={t('admin.products.noData', 'No products found. Create your first product to get started.')}
            />

            {/* Pagination */}
            <AdminPagination
                pagination={productsPagination}
                onPageChange={handlePageChange}
                limit={limit}
            />

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal">
                        <div className="admin-modal-header">
                            <h3>{t('admin.products.deleteConfirm', 'Confirm Delete')}</h3>
                        </div>
                        <div className="admin-modal-body">
                            <p>
                                {selectedItems.length === 1
                                    ? t('admin.products.deleteConfirmSingle', 'Are you sure you want to delete this product?')
                                    : t('admin.products.deleteConfirmMultiple', `Are you sure you want to delete ${selectedItems.length} products?`)
                                }
                            </p>
                            <p className="admin-modal-warning">
                                {t('admin.products.deleteWarning', 'This action cannot be undone.')}
                            </p>
                        </div>
                        <div className="admin-modal-footer">
                            <button
                                className="admin-btn admin-btn-secondary"
                                onClick={() => setShowDeleteConfirm(false)}
                            >
                                {t('common.cancel', 'Cancel')}
                            </button>
                            <button
                                className="admin-btn admin-btn-danger"
                                onClick={confirmDelete}
                                disabled={productDeleteLoading}
                            >
                                {productDeleteLoading ? t('common.deleting', 'Deleting...') : t('common.delete', 'Delete')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
