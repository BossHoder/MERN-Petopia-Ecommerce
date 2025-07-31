import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useI18n } from '../../../hooks/useI18n';
import {
    getAdminUsers,
    updateUserRole,
    updateUserStatus,
    deleteUser,
    bulkUpdateUsers,
} from '../../../store/actions/adminActions';
import AdminTable from '../../../components/Admin/AdminTable/AdminTable';
import AdminPagination from '../../../components/Admin/AdminPagination/AdminPagination';
import BreadcrumbNavigation from '../../../components/BreadcrumbNavigation/BreadcrumbNavigation';
import UserDetailsModal from './UserDetailsModal';
import './styles.css';

const Users = () => {
    const { t } = useI18n();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    // Local state
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [roleFilter, setRoleFilter] = useState(searchParams.get('role') || 'all');
    const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
    const [showUserModal, setShowUserModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [showBulkActions, setShowBulkActions] = useState(false);

    // Redux state
    const {
        users,
        usersPagination,
        usersLoading,
        userUpdateLoading,
        userDeleteLoading,
        usersBulkUpdateLoading,
    } = useSelector((state) => state.admin);

    // Get current page from URL
    const currentPage = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;

    // Breadcrumb items
    const breadcrumbItems = [
        { name: t('admin.dashboard.title', 'Dashboard'), path: '/admin/dashboard' },
        { name: t('admin.users.title', 'Users Management'), path: '/admin/users' },
    ];

    // Load users on component mount and when filters change
    useEffect(() => {
        const filters = {
            page: currentPage,
            limit,
            search: searchTerm,
            role: roleFilter !== 'all' ? roleFilter : '',
            status: statusFilter !== 'all' ? statusFilter : '',
        };

        dispatch(
            getAdminUsers(
                filters.page,
                filters.limit,
                filters.search,
                filters.role,
                filters.status,
            ),
        );
    }, [dispatch, currentPage, limit, searchTerm, roleFilter, statusFilter]);

    // Debug users data structure
    useEffect(() => {
        if (users && users.length > 0) {
            console.log('Users data structure:', users[0]);
            console.log('First user keys:', Object.keys(users[0]));
            console.log('First user _id:', users[0]._id);
            console.log('First user id:', users[0].id);
        }
    }, [users]);

    // Handle search
    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams(location.search);
        if (searchTerm) {
            params.set('search', searchTerm);
        } else {
            params.delete('search');
        }
        params.set('page', '1'); // Reset to first page
        navigate(`${location.pathname}?${params.toString()}`);
    };

    // Handle filter changes
    const handleFilterChange = (filterType, value) => {
        const params = new URLSearchParams(location.search);
        if (value !== 'all') {
            params.set(filterType, value);
        } else {
            params.delete(filterType);
        }
        params.set('page', '1'); // Reset to first page
        navigate(`${location.pathname}?${params.toString()}`);

        if (filterType === 'role') {
            setRoleFilter(value);
        } else if (filterType === 'status') {
            setStatusFilter(value);
        }
    };

    // Handle page change
    const handlePageChange = (page) => {
        const params = new URLSearchParams(location.search);
        params.set('page', page);
        navigate(`${location.pathname}?${params.toString()}`);
    };

    // Handle user selection
    const handleSelectUser = (selectedIds) => {
        setSelectedUsers(selectedIds);
        setShowBulkActions(selectedIds.length > 0);
    };

    // Handle select all users
    const handleSelectAllUsers = (selectedIds) => {
        setSelectedUsers(selectedIds);
        setShowBulkActions(selectedIds.length > 0);
    };

    // Handle view user details
    const handleViewUser = (userId) => {
        setSelectedUserId(userId);
        setShowUserModal(true);
    };

    // Handle role update
    const handleRoleUpdate = (userId, newRole) => {
        dispatch(updateUserRole(userId, newRole))
            .then(() => {
                toast.success(t('admin.users.roleUpdated', 'User role updated successfully'));
                // Refresh user list
                dispatch(
                    getAdminUsers(
                        currentPage,
                        limit,
                        searchTerm,
                        roleFilter !== 'all' ? roleFilter : '',
                        statusFilter !== 'all' ? statusFilter : '',
                    ),
                );
            })
            .catch((error) => {
                toast.error(
                    (error && error.message) ||
                        t('admin.users.roleUpdateFailed', 'Failed to update user role'),
                );
            });
    };

    // Handle status update with confirmation
    const handleStatusUpdate = (userId, newStatus, user) => {
        const action = newStatus ? 'kích hoạt' : 'huỷ kích hoạt';
        const roleText = user.role || 'USER';
        const confirmMessage = t(
            'admin.users.confirmStatusChange',
            `Bạn có muốn ${action} người dùng ${roleText} không?`,
        );

        if (window.confirm(confirmMessage)) {
            dispatch(updateUserStatus(userId, newStatus))
                .then(() => {
                    toast.success(
                        t('admin.users.statusUpdated', 'User status updated successfully'),
                    );
                    // Refresh user list
                    dispatch(
                        getAdminUsers(
                            currentPage,
                            limit,
                            searchTerm,
                            roleFilter !== 'all' ? roleFilter : '',
                            statusFilter !== 'all' ? statusFilter : '',
                        ),
                    );
                })
                .catch((error) => {
                    toast.error(
                        (error && error.message) ||
                            t('admin.users.statusUpdateFailed', 'Failed to update user status'),
                    );
                });
        }
    };

    // Handle user deletion with admin protection
    const handleDeleteUser = (userId, user) => {
        // Protect admin users from deletion
        if (user && user.role === 'ADMIN') {
            toast.error(
                t(
                    'admin.users.adminDeleteError',
                    'Admin users cannot be deleted through the interface.',
                ),
            );
            return;
        }

        if (
            window.confirm(
                t('admin.users.confirmDelete', 'Are you sure you want to deactivate this user?'),
            )
        ) {
            try {
                dispatch(deleteUser(userId));
                toast.success(t('admin.users.userDeleted', 'User deactivated successfully'));
            } catch (error) {
                toast.error(
                    error.message || t('admin.users.deleteFailed', 'Failed to deactivate user'),
                );
            }
        }
    };

    // Handle bulk actions
    const handleBulkAction = (action, value = null) => {
        if (selectedUsers.length === 0) {
            toast.warning(t('admin.users.selectUsers', 'Please select users first'));
            return;
        }

        // Check if any selected users are admins and filter them out for role changes
        const selectedUserObjects = users.filter((user) =>
            selectedUsers.includes(user._id || user.id),
        );
        const adminUsers = selectedUserObjects.filter((user) => user.role === 'ADMIN');

        if (action === 'role' && adminUsers.length > 0) {
            toast.error(
                t(
                    'admin.users.adminRoleChangeError',
                    'Admin users cannot have their roles changed through the interface.',
                ),
            );
            return;
        }

        const updates = {};
        let confirmMessage = '';

        switch (action) {
            case 'activate':
                updates.isActive = true;
                confirmMessage = t('admin.users.confirmBulkActivate', 'Activate selected users?');
                break;
            case 'deactivate':
                updates.isActive = false;
                confirmMessage = t(
                    'admin.users.confirmBulkDeactivate',
                    'Deactivate selected users?',
                );
                break;
            case 'role':
                updates.role = value;
                confirmMessage = t(
                    'admin.users.confirmBulkRole',
                    `Change role to ${value} for selected users?`,
                );
                break;
            default:
                return;
        }

        if (window.confirm(confirmMessage)) {
            try {
                dispatch(bulkUpdateUsers(selectedUsers, updates));
                toast.success(t('admin.users.bulkUpdateSuccess', 'Users updated successfully'));
                setSelectedUsers([]);
                setShowBulkActions(false);
            } catch (error) {
                toast.error(
                    error.message || t('admin.users.bulkUpdateFailed', 'Failed to update users'),
                );
            }
        }
    };

    // Table columns configuration
    const columns = [
        {
            key: 'avatar',
            title: t('admin.users.avatar', 'Avatar'),
            width: '80px',
            align: 'center',
            render: (value, user) => (
                <div className="user-avatar-cell">
                    <img
                        src={user.avatar || '/user-icon.png'}
                        alt={user.name}
                        className="user-avatar-small"
                        onError={(e) => {
                            e.target.src = '/user-icon.png';
                        }}
                    />
                </div>
            ),
        },
        {
            key: 'name',
            title: t('admin.users.name', 'Name'),
            render: (value, user) => (
                <div className="user-name-cell">
                    <div className="user-name">{user.name}</div>
                    <div className="user-username">@{user.username}</div>
                </div>
            ),
        },
        {
            key: 'email',
            title: t('admin.users.email', 'Email'),
        },
        {
            key: 'role',
            title: t('admin.users.role', 'Role'),
            render: (value, user) => {
                const userId = user._id || user.id;
                // Don't allow role changes for admin users
                if (user.role === 'ADMIN') {
                    return (
                        <span className={`role-badge role-${user.role.toLowerCase()}`}>
                            {user.role}
                        </span>
                    );
                }
                return (
                    <select
                        value={user.role}
                        onChange={(e) => handleRoleUpdate(userId, e.target.value)}
                        className={`role-select role-${user.role.toLowerCase()}`}
                        disabled={userUpdateLoading}
                    >
                        <option value="USER">User</option>
                        <option value="STAFF">Staff</option>
                    </select>
                );
            },
        },
        {
            key: 'isActive',
            title: t('admin.users.status', 'Status'),
            render: (value, user) => {
                const userId = user._id || user.id;
                const isUserActive = Boolean(user.isActive);

                // Debug logging
                console.log('User status debug:', {
                    userId,
                    username: user.username,
                    isActive: user.isActive,
                    isActiveType: typeof user.isActive,
                    isUserActive,
                    fullUser: user,
                });

                return (
                    <button
                        onClick={() => handleStatusUpdate(userId, !isUserActive, user)}
                        className={`status-toggle ${isUserActive ? 'active' : 'inactive'}`}
                        disabled={userUpdateLoading}
                    >
                        {isUserActive
                            ? t('admin.users.active', 'Active')
                            : t('admin.users.inactive', 'Inactive')}
                    </button>
                );
            },
        },
        {
            key: 'createdAt',
            title: t('admin.users.joinedDate', 'Joined'),
            render: (value) => new Date(value).toLocaleDateString(),
        },
        {
            key: 'actions',
            title: t('admin.users.actions', 'Actions'),
            width: '120px',
            align: 'center',
            render: (value, user) => {
                const userId = user._id || user.id;
                return (
                    <div className="user-actions">
                        <button
                            onClick={() => handleViewUser(userId)}
                            className="btn-view"
                            title={t('admin.users.viewDetails', 'View Details')}
                        >
                            👁️
                        </button>
                        <button
                            onClick={() => handleDeleteUser(userId, user)}
                            className={`btn-delete ${user.role === 'ADMIN' ? 'disabled' : ''}`}
                            title={
                                user.role === 'ADMIN'
                                    ? t(
                                          'admin.users.adminProtected',
                                          'Admin users cannot be deleted',
                                      )
                                    : t('admin.users.deactivate', 'Deactivate')
                            }
                            disabled={userDeleteLoading || user.role === 'ADMIN'}
                        >
                            🗑️
                        </button>
                    </div>
                );
            },
        },
    ];

    // Users Table
    const getRowKey = (user, idx) => {
        // Ưu tiên _id, nếu không có thì dùng id, nếu vẫn trùng thì thêm index
        return (user._id || user.id) + '_' + idx;
    };

    return (
        <div className="admin-users-page">
            {/* Breadcrumb Navigation */}
            <BreadcrumbNavigation
                items={breadcrumbItems}
                ariaLabel={t('breadcrumb.adminNavigation', 'Admin navigation')}
            />

            {/* Page Header */}
            <div className="page-header">
                <h1>{t('admin.users.title', 'Users Management')}</h1>
                <div className="page-stats">
                    <span className="stat-item">
                        {t('admin.users.totalUsers', 'Total Users')}: {usersPagination.totalUsers}
                    </span>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="admin-filters">
                <form onSubmit={handleSearch} className="search-form">
                    <input
                        type="text"
                        placeholder={t(
                            'admin.users.searchPlaceholder',
                            'Search by name, email, or username...',
                        )}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <button type="submit" className="search-btn">
                        {t('common.search', 'Search')}
                    </button>
                </form>

                <div className="filter-controls">
                    <select
                        value={roleFilter}
                        onChange={(e) => handleFilterChange('role', e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">{t('admin.users.allRoles', 'All Roles')}</option>
                        <option value="USER">{t('admin.users.userRole', 'User')}</option>
                        <option value="ADMIN">{t('admin.users.adminRole', 'Admin')}</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">{t('admin.users.allStatuses', 'All Statuses')}</option>
                        <option value="true">{t('admin.users.active', 'Active')}</option>
                        <option value="false">{t('admin.users.inactive', 'Inactive')}</option>
                    </select>
                </div>
            </div>

            {/* Bulk Actions */}
            {showBulkActions && (
                <div className="bulk-actions">
                    <span className="selected-count">
                        {selectedUsers.length} {t('admin.users.usersSelected', 'users selected')}
                    </span>
                    <div className="bulk-action-buttons">
                        <button
                            onClick={() => handleBulkAction('activate')}
                            className="bulk-btn activate"
                            disabled={usersBulkUpdateLoading}
                        >
                            {t('admin.users.bulkActivate', 'Activate')}
                        </button>
                        <button
                            onClick={() => handleBulkAction('deactivate')}
                            className="bulk-btn deactivate"
                            disabled={usersBulkUpdateLoading}
                        >
                            {t('admin.users.bulkDeactivate', 'Deactivate')}
                        </button>
                        <select
                            onChange={(e) =>
                                e.target.value && handleBulkAction('role', e.target.value)
                            }
                            className="bulk-role-select"
                            disabled={usersBulkUpdateLoading}
                        >
                            <option value="">{t('admin.users.changeRole', 'Change Role')}</option>
                            <option value="USER">User</option>
                            <option value="STAFF">Staff</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Users Table */}
            <AdminTable
                columns={columns}
                data={users}
                selectedItems={selectedUsers}
                onSelectItem={handleSelectUser}
                onSelectAll={handleSelectAllUsers}
                loading={usersLoading}
                emptyMessage={t('admin.users.noUsers', 'No users found')}
                className="users-table"
                getRowKey={getRowKey}
            />

            {/* Pagination */}
            <AdminPagination
                pagination={usersPagination}
                onPageChange={handlePageChange}
                limit={limit}
            />

            {/* User Details Modal */}
            {showUserModal && (
                <UserDetailsModal
                    userId={selectedUserId}
                    onClose={() => {
                        setShowUserModal(false);
                        setSelectedUserId(null);
                    }}
                />
            )}
        </div>
    );
};

export default Users;
