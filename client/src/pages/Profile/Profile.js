import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import moment from 'moment';

import { getProfile, editUser } from '../../store/actions/userActions';
import { listMyOrders } from '../../store/actions/orderActions';
import {
    getAddresses,
    addAddress,
    deleteAddress,
    setDefaultAddress,
} from '../../store/actions/addressActions';
import Loader from '../../components/Loader/Loader';
import { getAvatarUrl } from '../../utils/helpers';
import { loadMe } from '../../store/actions/authActions';

import './Profile.css'; // Sử dụng CSS mới
import { useTranslation } from 'react-i18next';

const Profile = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { username: paramUsername } = useParams();
    const { t } = useTranslation('common');

    // Lấy state từ Redux
    const { me: userInfo, isLoading } = useSelector((state) => state.auth);
    const { profile, loading: profileLoading } = useSelector((state) => state.user);
    // Các state khác cho order và address sẽ do component con tự quản lý

    useEffect(() => {
        // ProtectedRoute đã xử lý authentication, chỉ cần load profile data
        if (userInfo) {
            // Nếu có username trên URL, đó là xem profile của người khác
            if (paramUsername) {
                // Chỉ admin mới có quyền xem profile người khác
                if (userInfo.username === paramUsername || userInfo.role === 'ADMIN') {
                    dispatch(getProfile(paramUsername, navigate));
                } else {
                    // Nếu không phải admin và không phải profile của mình, về trang chủ
                    navigate('/');
                }
            } else {
                // Nếu không có username trên URL, đây là trang /profile của người dùng hiện tại
                dispatch(getProfile(null, navigate)); // Truyền null hoặc undefined
            }
        }
    }, [dispatch, navigate, userInfo, paramUsername]);

    // Handle checkout redirection and auto-focus Address Book tab
    useEffect(() => {
        if (location.state?.fromCheckout && location.state?.focusTab) {
            setActiveTab(location.state.focusTab);
            // Removed the blue info toast - user will see the checkout context banner instead
        }
    }, [location.state, dispatch, t]);

    if (userInfo === null && isLoading) {
        return <Loader />;
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'orders':
                return <OrderHistory />;
            case 'addresses':
                return <AddressBook checkoutContext={location.state} />;
            case 'profile':
            default:
                return <ProfileSettings profile={profile} loading={profileLoading} />;
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-sidebar">
                <ul className="profile-tabs">
                    <li
                        className={activeTab === 'profile' ? 'active' : ''}
                        onClick={() => setActiveTab('profile')}
                    >
                        {t('profile.tabs.settings', 'Profile Settings')}
                    </li>
                    <li
                        className={activeTab === 'orders' ? 'active' : ''}
                        onClick={() => setActiveTab('orders')}
                    >
                        {t('profile.tabs.orders', 'Order History')}
                    </li>
                    <li
                        className={activeTab === 'addresses' ? 'active' : ''}
                        onClick={() => setActiveTab('addresses')}
                    >
                        {t('profile.tabs.addresses', 'Address Book')}
                    </li>
                </ul>
            </div>
            <div className="profile-content">{renderContent()}</div>
        </div>
    );
};

// --- Sub-components for each tab ---

const ProfileSettings = ({ profile, loading }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t } = useTranslation('common');
    const [isEdit, setIsEdit] = useState(false);
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name,
                username: profile.username,
                password: '',
            });
            setAvatarPreview(getAvatarUrl(profile.avatar));
        }
    }, [profile]);

    // Khi update thành công, tự động tắt edit mode và dừng submitting
    useEffect(() => {
        if (isSubmitting && !loading && !isEdit) {
            setIsSubmitting(false);
        }
        // Nếu vừa update xong, reload lại profile và đồng bộ avatar Navbar
        if (isSubmitting && !loading) {
            dispatch(getProfile(null, navigate));
            dispatch(loadMe()); // Đồng bộ avatar Navbar
            setIsEdit(false);
            setIsSubmitting(false);
        }
    }, [loading, isSubmitting, isEdit, dispatch, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('name', formData.name);
        data.append('username', formData.username);
        if (formData.password) {
            data.append('password', formData.password);
        }
        if (avatar) {
            data.append('avatar', avatar);
        }
        setIsSubmitting(true);
        dispatch(editUser(profile.id, data, navigate));
    };

    if (loading || !profile || !profile.name) {
        return <Loader />;
    }

    return (
        <div>
            <h2>{t('profile.tabs.settings', 'Profile Settings')}</h2>
            <div className="profile-settings-info">
                <img
                    src={avatarPreview}
                    alt="avatar"
                    style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                    }}
                />
                {!isEdit ? (
                    <div>
                        <p>
                            <strong>{t('profile.fields.name', 'Name')}:</strong> {profile?.name}
                        </p>
                        <p>
                            <strong>{t('profile.fields.username', 'Username')}:</strong>{' '}
                            {profile?.username}
                        </p>
                        <p>
                            <strong>{t('profile.fields.email', 'Email')}:</strong> {profile?.email}
                        </p>
                        <p>
                            <strong>{t('profile.fields.joined', 'Joined')}:</strong>{' '}
                            {moment(profile?.createdAt).format('LL')}
                        </p>
                        <button className="btn btn-primary" onClick={() => setIsEdit(true)}>
                            {t('profile.editProfile', 'Edit Profile')}
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="profile-edit-form">
                        <div className="form-group">
                            <label>{t('profile.fields.avatar', 'Avatar')}</label>
                            <input type="file" onChange={handleAvatarChange} />
                        </div>
                        <div className="form-group">
                            <label>{t('profile.fields.name', 'Name')}</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>{t('profile.fields.username', 'Username')}</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                            />
                        </div>
                        {profile?.provider === 'email' && (
                            <div className="form-group">
                                <label>{t('profile.fields.newPassword', 'New Password')}</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder={t(
                                        'profile.passwordPlaceholder',
                                        'Leave blank to keep the same',
                                    )}
                                />
                            </div>
                        )}
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary">
                                {t('profile.saveChanges', 'Save Changes')}
                            </button>
                            <button type="button" className="btn" onClick={() => setIsEdit(false)}>
                                {t('common.cancel', 'Cancel')}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

const OrderHistory = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t } = useTranslation('common');

    const orderListMy = useSelector((state) => state.orderListMy);
    const { loading, error, orders } = orderListMy;

    useEffect(() => {
        dispatch(listMyOrders());
    }, [dispatch]);

    return (
        <div>
            <h2>{t('profile.tabs.orders', 'My Orders')}</h2>
            {loading ? (
                <Loader />
            ) : error ? (
                <p className="error-message">{error}</p>
            ) : (
                <table className="orders-table">
                    <thead>
                        <tr>
                            <th>{t('profile.orders.id', 'ID')}</th>
                            <th>{t('profile.orders.date', 'DATE')}</th>
                            <th>{t('profile.orders.total', 'TOTAL')}</th>
                            <th>{t('profile.orders.paid', 'PAID')}</th>
                            <th>{t('profile.orders.delivered', 'DELIVERED')}</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders && orders.length > 0 ? (
                            orders.map((order) => (
                                <tr key={order._id}>
                                    <td>{order._id}</td>
                                    <td>{moment(order.createdAt).format('YYYY-MM-DD')}</td>
                                    <td>${order.totalPrice.toFixed(2)}</td>
                                    <td>
                                        {order.isPaid ? (
                                            moment(order.paidAt).format('YYYY-MM-DD')
                                        ) : (
                                            <i
                                                className="fas fa-times"
                                                style={{ color: 'red' }}
                                            ></i>
                                        )}
                                    </td>
                                    <td>
                                        {order.isDelivered ? (
                                            moment(order.deliveredAt).format('YYYY-MM-DD')
                                        ) : (
                                            <i
                                                className="fas fa-times"
                                                style={{ color: 'red' }}
                                            ></i>
                                        )}
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-sm"
                                            onClick={() => navigate(`/order/${order._id}`)}
                                        >
                                            {t('profile.orders.details', 'Details')}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6">
                                    {t('profile.orders.noOrders', 'You have no orders.')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
};

const AddressBook = ({ checkoutContext }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t } = useTranslation('common');
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [formData, setFormData] = useState({
        phoneNumber: '',
        address: '',
    });

    const { addresses, loading, error } = useSelector((state) => state.address);

    useEffect(() => {
        dispatch(getAddresses());
    }, [dispatch]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Chỉ validate phoneNumber và address là bắt buộc
        if (!formData.phoneNumber || !formData.address) {
            dispatch({
                type: 'SHOW_TOAST',
                payload: {
                    message: t(
                        'profile.addresses.validation.required',
                        'Please enter both phone number and address.',
                    ),
                    type: 'error',
                },
            });
            return;
        }
        console.log('addressData gửi lên:', formData); // Log dữ liệu gửi lên
        dispatch(addAddress(formData));
        setIsFormVisible(false);
        setFormData({
            phoneNumber: '',
            address: '',
        });

        // Removed success toast - user will see the return to checkout button appear instead
    };

    const handleDelete = (addressId) => {
        if (
            window.confirm(
                t(
                    'profile.addresses.deleteConfirm',
                    'Are you sure you want to delete this address?',
                ),
            )
        ) {
            dispatch(deleteAddress(addressId));
        }
    };

    const handleSetDefault = (addressId) => {
        dispatch(setDefaultAddress(addressId));
    };

    const handleReturnToCheckout = () => {
        navigate('/checkout', {
            state: {
                fromProfile: true,
                addressAdded: true,
                checkoutData: checkoutContext?.checkoutData,
            },
        });
    };

    return (
        <div className="address-book">
            <div className="address-book-header">
                <h2>{t('profile.tabs.addresses', 'Address Book')}</h2>
                {checkoutContext?.fromCheckout && (
                    <div className="checkout-context-banner">
                        <div className="checkout-context-message">
                            <span className="checkout-context-icon">🛒</span>
                            <span>
                                {t(
                                    'profile.addresses.checkoutContext',
                                    'Add a shipping address to complete your order',
                                )}
                            </span>
                        </div>
                        {addresses && addresses.length > 0 && (
                            <button
                                className="btn btn-primary return-to-checkout-btn"
                                onClick={handleReturnToCheckout}
                            >
                                {t('profile.addresses.returnToCheckout', 'Return to Checkout')}
                            </button>
                        )}
                    </div>
                )}
            </div>
            {loading && <Loader />}
            {error && <p className="error-message">{error}</p>}

            <button className="btn btn-primary" onClick={() => setIsFormVisible(!isFormVisible)}>
                {isFormVisible
                    ? t('common.cancel', 'Cancel')
                    : t('profile.addresses.addNew', 'Add New Address')}
            </button>

            {isFormVisible && (
                <form onSubmit={handleSubmit} className="address-form">
                    <div className="form-group">
                        <label>{t('profile.addresses.phoneNumber', 'Phone Number')} *</label>
                        <input
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>{t('profile.addresses.address', 'Address')} *</label>
                        <input
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="btn">
                        {t('profile.addresses.save', 'Save Address')}
                    </button>
                </form>
            )}

            <div className="address-list">
                {addresses &&
                    addresses.map((addr) => (
                        <div
                            key={addr._id}
                            className={`address-card ${addr.isDefault ? 'default' : ''}`}
                        >
                            <p>Địa chỉ: {addr.address}</p>
                            <p>Số điện thoại: {addr.phoneNumber}</p>
                            {addr.isDefault && (
                                <span className="default-badge">
                                    {t('profile.addresses.default', 'Default')}
                                </span>
                            )}
                            <div className="address-actions">
                                {!addr.isDefault && (
                                    <button
                                        className="btn btn-sm"
                                        onClick={() => handleSetDefault(addr._id)}
                                    >
                                        {t('profile.addresses.setAsDefault', 'Set as Default')}
                                    </button>
                                )}
                                <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleDelete(addr._id)}
                                >
                                    {t('common.delete', 'Delete')}
                                </button>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default Profile;
