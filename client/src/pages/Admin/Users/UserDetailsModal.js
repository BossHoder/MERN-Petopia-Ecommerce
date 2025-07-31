import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useI18n } from '../../../hooks/useI18n';
import {
    getUserDetails,
    updateUserRole,
    updateUserStatus,
} from '../../../store/actions/adminActions';

const UserDetailsModal = ({ userId, onClose }) => {
    const { t } = useI18n();
    const dispatch = useDispatch();

    // Local state
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        role: '',
        isActive: true,
    });

    // Redux state
    const { userDetails, userDetailsLoading, userUpdateLoading, error } = useSelector(
        (state) => state.admin,
    );

    // Load user details when modal opens
    useEffect(() => {
        if (userId) {
            dispatch(getUserDetails(userId));
        }
    }, [dispatch, userId]);

    // Update form when user details are loaded
    useEffect(() => {
        if (userDetails) {
            setEditForm({
                role: userDetails.role || 'USER',
                isActive: userDetails.isActive !== false,
            });
        }
    }, [userDetails]);

    // Handle form input changes
    const handleInputChange = (field, value) => {
        setEditForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // Handle save changes
    const handleSave = async () => {
        try {
            // Update role if changed
            if (editForm.role !== userDetails.role) {
                await dispatch(updateUserRole(userId, editForm.role));
            }

            // Update status if changed
            if (editForm.isActive !== userDetails.isActive) {
                await dispatch(updateUserStatus(userId, editForm.isActive));
            }

            toast.success(t('admin.users.updateSuccess', 'User updated successfully'));
            setIsEditing(false);

            // Refresh user details
            dispatch(getUserDetails(userId));
        } catch (error) {
            toast.error(error.message || t('admin.users.updateFailed', 'Failed to update user'));
        }
    };

    // Handle cancel edit
    const handleCancel = () => {
        if (userDetails) {
            setEditForm({
                role: userDetails.role || 'USER',
                isActive: userDetails.isActive !== false,
            });
        }
        setIsEditing(false);
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return t('common.notAvailable', 'N/A');
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount || 0);
    };

    if (userDetailsLoading) {
        return (
            <div className="modal-overlay">
                <div className="modal-content user-details-modal">
                    <div className="modal-header">
                        <h2>{t('admin.users.userDetails', 'User Details')}</h2>
                        <button onClick={onClose} className="modal-close-btn">
                            ×
                        </button>
                    </div>
                    <div className="modal-body">
                        <div className="loading-spinner">{t('common.loading', 'Loading...')}</div>
                    </div>
                </div>
            </div>
        );
    }

    if (!userDetails) {
        return (
            <div className="modal-overlay">
                <div className="modal-content user-details-modal">
                    <div className="modal-header">
                        <h2>{t('admin.users.userDetails', 'User Details')}</h2>
                        <button onClick={onClose} className="modal-close-btn">
                            ×
                        </button>
                    </div>
                    <div className="modal-body">
                        <div className="error-message">
                            {error || t('admin.users.userNotFound', 'User not found')}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content user-details-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{t('admin.users.userDetails', 'User Details')}</h2>
                    <div className="modal-header-actions">
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="btn-edit"
                                disabled={userUpdateLoading}
                            >
                                {t('common.edit', 'Edit')}
                            </button>
                        ) : (
                            <div className="edit-actions">
                                <button
                                    onClick={handleSave}
                                    className="btn-save"
                                    disabled={userUpdateLoading}
                                >
                                    {userUpdateLoading
                                        ? t('common.saving', 'Saving...')
                                        : t('common.save', 'Save')}
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="btn-cancel"
                                    disabled={userUpdateLoading}
                                >
                                    {t('common.cancel', 'Cancel')}
                                </button>
                            </div>
                        )}
                        <button onClick={onClose} className="modal-close-btn">
                            ×
                        </button>
                    </div>
                </div>

                <div className="modal-body">
                    <div className="user-details-content">
                        {/* User Profile Section */}
                        <div className="details-section">
                            <h3>{t('admin.users.profileInfo', 'Profile Information')}</h3>
                            <div className="user-profile">
                                <div className="user-avatar-large">
                                    <img
                                        src={userDetails.avatar || '/images/avatar0.jpg'}
                                        alt={userDetails.name}
                                        onError={(e) => {
                                            e.target.src = '/images/avatar0.jpg';
                                        }}
                                    />
                                </div>
                                <div className="user-basic-info">
                                    <div className="info-row">
                                        <label>{t('admin.users.name', 'Name')}:</label>
                                        <span>{userDetails.name}</span>
                                    </div>
                                    <div className="info-row">
                                        <label>{t('admin.users.username', 'Username')}:</label>
                                        <span>@{userDetails.username}</span>
                                    </div>
                                    <div className="info-row">
                                        <label>{t('admin.users.email', 'Email')}:</label>
                                        <span>{userDetails.email}</span>
                                    </div>
                                    <div className="info-row">
                                        <label>{t('admin.users.provider', 'Provider')}:</label>
                                        <span className="provider-badge">
                                            {userDetails.provider}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Account Settings Section */}
                        <div className="details-section">
                            <h3>{t('admin.users.accountSettings', 'Account Settings')}</h3>
                            <div className="account-settings">
                                <div className="info-row">
                                    <label>{t('admin.users.role', 'Role')}:</label>
                                    {isEditing ? (
                                        <select
                                            value={editForm.role}
                                            onChange={(e) =>
                                                handleInputChange('role', e.target.value)
                                            }
                                            className={`role-select role-${editForm.role.toLowerCase()}`}
                                        >
                                            <option value="USER">User</option>
                                            <option value="ADMIN">Admin</option>
                                        </select>
                                    ) : (
                                        <span
                                            className={`role-badge role-${userDetails.role.toLowerCase()}`}
                                        >
                                            {userDetails.role}
                                        </span>
                                    )}
                                </div>
                                <div className="info-row">
                                    <label>{t('admin.users.status', 'Status')}:</label>
                                    {isEditing ? (
                                        <select
                                            value={editForm.isActive.toString()}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    'isActive',
                                                    e.target.value === 'true',
                                                )
                                            }
                                            className={`status-select ${
                                                editForm.isActive ? 'active' : 'inactive'
                                            }`}
                                        >
                                            <option value="true">
                                                {t('admin.users.active', 'Active')}
                                            </option>
                                            <option value="false">
                                                {t('admin.users.inactive', 'Inactive')}
                                            </option>
                                        </select>
                                    ) : (
                                        <span
                                            className={`status-badge ${
                                                userDetails.isActive ? 'active' : 'inactive'
                                            }`}
                                        >
                                            {userDetails.isActive
                                                ? t('admin.users.active', 'Active')
                                                : t('admin.users.inactive', 'Inactive')}
                                        </span>
                                    )}
                                </div>
                                <div className="info-row">
                                    <label>
                                        {t('admin.users.emailVerified', 'Email Verified')}:
                                    </label>
                                    <span
                                        className={`verification-badge ${
                                            userDetails.emailVerified ? 'verified' : 'unverified'
                                        }`}
                                    >
                                        {userDetails.emailVerified
                                            ? t('common.yes', 'Yes')
                                            : t('common.no', 'No')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Account Activity Section */}
                        <div className="details-section">
                            <h3>{t('admin.users.accountActivity', 'Account Activity')}</h3>
                            <div className="account-activity">
                                <div className="info-row">
                                    <label>{t('admin.users.joinedDate', 'Joined Date')}:</label>
                                    <span>{formatDate(userDetails.createdAt)}</span>
                                </div>
                                <div className="info-row">
                                    <label>{t('admin.users.lastLogin', 'Last Login')}:</label>
                                    <span>{formatDate(userDetails.lastLogin)}</span>
                                </div>
                                <div className="info-row">
                                    <label>{t('admin.users.lastUpdated', 'Last Updated')}:</label>
                                    <span>{formatDate(userDetails.updatedAt)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Order Statistics Section */}
                        {userDetails.orderStats && (
                            <div className="details-section">
                                <h3>{t('admin.users.orderStatistics', 'Order Statistics')}</h3>
                                <div className="order-stats">
                                    <div className="stat-card">
                                        <div className="stat-value">
                                            {userDetails.orderStats.totalOrders}
                                        </div>
                                        <div className="stat-label">
                                            {t('admin.users.totalOrders', 'Total Orders')}
                                        </div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-value">
                                            {formatCurrency(userDetails.orderStats.totalSpent)}
                                        </div>
                                        <div className="stat-label">
                                            {t('admin.users.totalSpent', 'Total Spent')}
                                        </div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-value">
                                            {formatCurrency(userDetails.orderStats.avgOrderValue)}
                                        </div>
                                        <div className="stat-label">
                                            {t('admin.users.avgOrderValue', 'Avg Order Value')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Additional Info Section */}
                        {userDetails.bio && (
                            <div className="details-section">
                                <h3>{t('admin.users.bio', 'Bio')}</h3>
                                <div className="user-bio">
                                    <p>{userDetails.bio}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetailsModal;
