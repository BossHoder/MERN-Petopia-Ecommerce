import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import Message from '../Message/Message';
import Loader from '../Loader/Loader';

import { getMessages } from '../../store/actions/messageActions';
import { useI18n } from '../../hooks/useI18n';
import './styles.css';

const MessageList = ({ getMessages, message: { messages, isLoading, error } }) => {
    const { t } = useI18n();

    useEffect(() => {
        getMessages();
    }, []);

    return (
        <div className="message-list">
            <h2>{t('messages.title')}:</h2>
            {error && <div className="error-center">{error}</div>}
            <div className="list">
                {isLoading ? (
                    <Loader />
                ) : (
                    <>
                        {messages.map((message, index) => {
                            return <Message key={index} message={message} />;
                        })}
                    </>
                )}
            </div>
        </div>
    );
};

const mapStateToProps = (state) => ({
    message: state.message,
});

export default connect(mapStateToProps, { getMessages })(MessageList);
