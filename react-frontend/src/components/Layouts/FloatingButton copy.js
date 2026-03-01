import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { classNames } from 'primereact/utils';
import './FloatingButton.css';
import CustomerSupportIcon from '../../../src/assets/icons/Support.svg';
import client from '../../services/restClient';
import { connect } from 'react-redux';

function FloatingButton(props) {
    const [visible, setVisible] = useState(false);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSupportClick = () => {
        setVisible(true);
    };

    const handleSubmit = async () => {
        if (!message) {
            setError('Message is required.');
            return;
        }

        setLoading(true);
        setError('');

        const _mail = {
            name: 'support_request',
            type: 'support',
            from: props.user.email,
            recipients: ['support@cloudbasha.com'],
            status: true,
            subject: `${subject} - ${props.user.email}`,
            content: message
        };

        try {
            await client.service('mailQues').create(_mail);
            setSubject('');
            setMessage('');
            setVisible(false);
        } catch (err) {
            setError('Failed to send email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderHeader = () => (
        <div className="flex align-items-center justify-content-between" style={{ cursor: 'move' }}>
            <span className="font-bold">New Message</span>
            <Button icon="pi pi-times" className="p-button-text p-button-plain p-button-sm" onClick={() => setVisible(false)} tooltip="Close" tooltipOptions={{ position: 'bottom' }} />
        </div>
    );

    const renderFooter = () => (
        <div className="flex align-items-center" style={{ padding: '0.5rem' }}>
            <Button label="Send" icon="pi pi-send" onClick={handleSubmit} className="mr-2" disabled={loading} />
            <span className="flex-grow-1"></span>
            <Button
                type="button"
                icon="pi pi-trash"
                className="p-button-text p-button-plain p-button-danger"
                tooltip="Discard draft"
                tooltipOptions={{ position: 'top' }}
                onClick={() => {
                    setSubject('');
                    setMessage('');
                    setVisible(false);
                }}
            />
        </div>
    );

    if (!visible) {
        return (
            <Button className="custom-red-button" aria-label="Contact Support" onClick={handleSupportClick}>
                <img src={CustomerSupportIcon} alt="Customer Support" className="custom-support-icon" />
            </Button>
        );
    }

    return (
        <Dialog header={renderHeader()} visible={visible} className="custom-compose-dialog" style={{ width: '50vw' }} footer={renderFooter()} onHide={() => setVisible(false)} draggable={true} closable={false}>
            <div className="p-fluid">
                {error && <Message severity="error" text={error} className="mb-3" />}
                <div className="p-field">
                    <InputText id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" />
                </div>
                <div className="p-field">
                    <InputTextarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} rows={10} placeholder="Compose email" style={{ width: '100%', height: '100%' }} required autoResize />
                </div>
            </div>
        </Dialog>
    );
}

const mapState = (state) => {
    const { isLoggedIn, user } = state.auth;
    return { isLoggedIn, user };
};

export default connect(mapState)(FloatingButton);
