import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux';
import { useFormik } from 'formik';
import moment from 'moment';
import { useNavigate, useParams } from 'react-router-dom';

import { getProfile, editUser, deleteUser } from '../../store/actions/userActions';
import { loadMe } from '../../store/actions/authActions';
import Layout from '../../layout/Layout';
import Loader from '../../components/Loader/Loader';
import requireAuth from '../../hoc/requireAuth';
import { profileSchema } from './validation';
import { getAvatarUrl } from '../../utils/helpers';
import { useI18n } from '../../hooks/useI18n';

import './styles.css';

//// nema password za oauth usere ni na klijentu ni serveru
// validacija na serveru i error handilng na clientu
// css i html
//// delete user i logika da ne brise seedovane
//// admin ruta i hoc
// error handling login register posto je zajednicki loading i error
//// mongo atlas i heroku deploy package json i promenljive env i config
//// avatar staza u bazu samo fajl
//// gitignore za placeholder avatar
//// delete profile ruta

// hendlovanje staza za slike, default avatar za izbrisane sa heroku
// readme
//// posle edit user treba redirect na novi username url

// fore
// za facebook more https apsolutni callback url
// FACEBOOK_CALLBACK_URL=https://mern-boilerplate-demo.herokuapp.com/auth/facebook/callback
// da bi prihvatio fb domen mora dole da se poklapa sa siteurl

const Profile = ({
    getProfile,
    user: { profile, isLoading, error },
    auth: { me },
    editUser,
    deleteUser,
    loadMe,
}) => {
    const { t } = useI18n();
    const navigate = useNavigate();
    const { username: matchUsername } = useParams();
    const [isEdit, setIsEdit] = useState(false);
    const [image, setImage] = useState(null);
    const [avatar, setAvatar] = useState(null);
    const [isMounted, setIsMounted] = useState(true);
    const retryCount = useRef(0);

    useEffect(() => {
        getProfile(matchUsername, navigate);

        // Cleanup function to prevent memory leaks
        return () => {
            setIsMounted(false);
        };
    }, [matchUsername, getProfile, navigate]);

    // if changed his own username reload me, done in userActions

    const onChange = (event) => {
        const file = event.currentTarget.files[0];

        if (!file) return;

        // Check file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        // Check file type
        if (!['image/png', 'image/jpg', 'image/jpeg'].includes(file.type)) {
            alert('Only PNG, JPG and JPEG files are allowed');
            return;
        }

        formik.setFieldValue('image', file);
        setImage(URL.createObjectURL(file));
        setAvatar(file);
    };

    const handleClickEdit = () => {
        if (!profile || !profile.id) return;

        retryCount.current = 0;
        setIsEdit((oldIsEdit) => !oldIsEdit);
        setImage(null);
        setAvatar(null);
        formik.setFieldValue('id', profile.id);
        formik.setFieldValue('name', profile.name);
        formik.setFieldValue('username', profile.username);
    };

    const handleDeleteUser = (id) => {
        deleteUser(id, navigate);
    };

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            id: '',
            name: '',
            username: '',
            password: '',
        },
        validationSchema: profileSchema,
        onSubmit: async (values) => {
            if (!profile || !profile.id) {
                console.error('No profile data available');
                return;
            }

            try {
                const formData = new FormData();

                // Only append avatar if a new one was selected
                if (avatar) {
                    formData.append('avatar', avatar);
                }

                formData.append('name', values.name || '');
                formData.append('username', values.username || '');

                // Only append password for email providers and if password is provided
                if (
                    profile.provider === 'email' &&
                    values.password &&
                    values.password.trim() !== ''
                ) {
                    formData.append('password', values.password);
                }

                console.log('Submitting form with data:', {
                    id: values.id,
                    name: values.name,
                    username: values.username,
                    hasAvatar: !!avatar,
                    provider: profile.provider,
                });

                await editUser(values.id, formData, navigate);

                // Reset form state and reload profile after successful update
                if (isMounted) {
                    setIsEdit(false);
                    setImage(null);
                    setAvatar(null);
                    // Reload profile to get updated avatar
                    await getProfile(profile.id);
                }
            } catch (error) {
                console.error('Form submission error:', error);
            }
        },
    });

    return (
        <Layout>
            <div className="profile">
                <h1>{t('profile.title')}</h1>
                <p>{t('profile.description')}</p>
                {isLoading || !profile || !profile.id ? (
                    <Loader />
                ) : (
                    <div className="profile-info">
                        <img
                            src={image ? image : getAvatarUrl(profile.avatar)}
                            className="avatar"
                            alt="User avatar"
                            onError={(e) => {
                                console.error('Avatar failed to load:', e.target.src);
                                console.log('Profile avatar path:', profile.avatar);
                                console.log('Generated URL:', getAvatarUrl(profile.avatar));
                            }}
                        />
                        <div className="info-container">
                            <div>
                                <span className="label">{t('profile.provider')}: </span>
                                <span className="info">{profile.provider}</span>
                            </div>
                            <div>
                                <span className="label">{t('profile.role')}: </span>
                                <span className="info">{profile.role}</span>
                            </div>
                            <div>
                                <span className="label">{t('profile.name')}: </span>
                                <span className="info">{profile.name}</span>
                            </div>
                            <div>
                                <span className="label">{t('profile.username')}: </span>
                                <span className="info">{profile.username}</span>
                            </div>
                            <div>
                                <span className="label">Email: </span>
                                <span className="info">{profile.email}</span>
                            </div>
                            <div>
                                <span className="label">Joined: </span>
                                <span className="info">
                                    {moment(profile.createdAt).format(
                                        'dddd, MMMM Do YYYY, H:mm:ss',
                                    )}
                                </span>
                            </div>
                            <div>
                                <button
                                    className="btn"
                                    type="button"
                                    onClick={handleClickEdit}
                                    disabled={
                                        !(me?.username === profile.username || me?.role === 'ADMIN')
                                    }
                                >
                                    {isEdit ? 'Cancel' : 'Edit'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {error && <p className="error">{error}</p>}

                {isEdit && (
                    <div className="form">
                        <form onSubmit={formik.handleSubmit}>
                            <div>
                                <label>Avatar:</label>
                                <input name="image" type="file" onChange={onChange} />
                                {image && (
                                    <button
                                        className="btn"
                                        onClick={() => {
                                            setImage(null);
                                            setAvatar(null);
                                        }}
                                        type="button"
                                    >
                                        Remove Image
                                    </button>
                                )}
                            </div>
                            <input name="id" type="hidden" value={formik.values.id} />
                            <div className="input-div">
                                <label>{t('profile.name')}:</label>
                                <input
                                    placeholder={t('profile.name')}
                                    name="name"
                                    className=""
                                    type="text"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.name}
                                />
                                {formik.touched.name && formik.errors.name ? (
                                    <p className="error">{formik.errors.name}</p>
                                ) : null}
                            </div>
                            <div className="input-div">
                                <label>{t('profile.username')}:</label>
                                <input
                                    placeholder={t('profile.username')}
                                    name="username"
                                    className=""
                                    type="text"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.username}
                                />
                                {formik.touched.username && formik.errors.username ? (
                                    <p className="error">{formik.errors.username}</p>
                                ) : null}
                            </div>
                            {profile.provider === 'email' && (
                                <div className="input-div">
                                    <label>{t('profile.password')}:</label>
                                    <input
                                        placeholder={t('profile.password')}
                                        name="password"
                                        className=""
                                        type="password"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.password}
                                    />
                                    {formik.touched.password && formik.errors.password ? (
                                        <p className="error">{formik.errors.password}</p>
                                    ) : null}
                                </div>
                            )}
                            <button type="submit" className="btn">
                                {t('common.save')}
                            </button>
                            <button
                                onClick={() => handleDeleteUser(profile.id)}
                                type="button"
                                className="btn"
                            >
                                {t('profile.deleteProfile')}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </Layout>
    );
};

const mapStateToProps = (state) => ({
    user: state.user,
    auth: state.auth,
});

export default requireAuth(
    connect(mapStateToProps, { getProfile, editUser, deleteUser, loadMe })(Profile),
);
