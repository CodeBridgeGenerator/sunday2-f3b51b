import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { connect } from 'react-redux';
import client from '../../services/restClient';
import Notification from '../../assets/icons/Notification.js';
import { Avatar } from 'primereact/avatar';
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import './Notification.css';
import { updateMany } from '../../utils/index.js';
import { Skeleton } from 'primereact/skeleton';
import { OverlayPanel } from 'primereact/overlaypanel';

const NotificationMenu = (props) => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
    const [hoveredNotification, setHoveredNotification] = useState(null);
    const [recordDetails, setRecordDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const notificationRef = useRef(null);
    const navigate = useNavigate();
    const hoverTimeoutRef = useRef(null);
    const notificationIconRef = useRef(null);
    const [panelPosition, setPanelPosition] = useState({ top: 0, left: 0 });

    const op = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target) && op.current && op.current.getElement() && !op.current.getElement().contains(event.target)) {
                setShowNotifications(false);
                setHoveredNotification(null);
                setRecordDetails(null);
            }
        };

        if (showNotifications) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showNotifications]);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await client.service('notifications').find({
                    query: { toUser: props.user._id }
                });

                const sortedNotifications = response.data.sort((a, b) => new Date(b.sent) - new Date(a.sent));

                // Extract unique user IDs from notifications
                const userIds = [...new Set(sortedNotifications.map((n) => n.toUser))];

                // Fetch user details
                const usersResponse = await client.service('users').find({
                    query: { _id: { $in: userIds } }
                });

                // Create a mapping of userId to userName
                const userMap = {};
                usersResponse.data.forEach((user) => {
                    userMap[user._id] = user.name;
                });

                // Update notifications with user names
                const updatedNotifications = sortedNotifications.map((notification) => ({
                    ...notification,
                    toUser: userMap[notification.toUser] || 'Unknown User'
                }));

                setNotifications(updatedNotifications);

                // Check for unread notifications
                const unreadExists = updatedNotifications.some((n) => !n.read);
                setHasUnreadNotifications(unreadExists);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchNotifications();

        client.service('notifications').on('created', (notification) => {
            if (notification.toUser === props.user.name) {
                setNotifications((prevNotifications) => {
                    const updatedNotifications = [notification, ...prevNotifications];
                    return updatedNotifications.sort((a, b) => new Date(b.sent) - new Date(a.sent));
                });

                if (!notification.read) {
                    setHasUnreadNotifications(true);
                }
            }
        });
    }, [props.user._id, hasUnreadNotifications]);

    useEffect(() => {
        if (showNotifications && notificationIconRef.current) {
            const iconRect = notificationIconRef.current.getBoundingClientRect();
            setPanelPosition({
                top: iconRect.bottom + window.scrollY,
                left: iconRect.left + window.scrollX - (400 - iconRect.width)
            });
        }
    }, [showNotifications, notifications]);

    const handleMouseEnter = () => {
        setShowNotifications(true);
    };

    const handleMouseLeave = () => {
        setShowNotifications(false);
        setHoveredNotification(null);
        setRecordDetails(null);
    };

    const toggleNotifications = () => {
        setShowNotifications((prev) => !prev);
    };

    const markAllAsRead = async () => {
        try {
            const unreadNotifications = notifications.filter((notification) => !notification.read);

            if (unreadNotifications.length > 0) {
                const query = {
                    _id: { $in: unreadNotifications.map((n) => n._id) },
                    toUser: props.user._id
                };
                const update = { read: true };
                const result = await updateMany({
                    collection: 'notifications',
                    query,
                    update,
                    user: props.user
                });

                const updatedNotifications = notifications.map((notification) => (notification.read ? notification : { ...notification, read: true }));

                setNotifications(updatedNotifications);
                setHasUnreadNotifications(false);
            }
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        }
    };

    const handleNotificationClick = (notification) => {
        // Hide the OverlayPanel before navigating
        if (op.current) {
            op.current.hide();
        }

        // Mark the notification as read
        client.service('notifications').patch(notification._id, { read: true });
        setNotifications((prevNotifications) => prevNotifications.map((n) => (n._id === notification._id ? { ...n, read: true } : n)));

        // Navigate to the path specified in the notification
        if (notification.path) {
            navigate(notification.path);
        } else {
            console.debug('No path provided for this notification.');
        }

        // Close the notifications panel and reset hover state
        setShowNotifications(false);
        setHoveredNotification(null);
        setRecordDetails(null);
    };
    const getRefData = async (path, data, schema) => {
        let newData = { ...data };

        for (const key in schema) {
            if (Object.prototype.hasOwnProperty.call(schema, key)) {
                const field = schema[key];

                if (field.type === 'ObjectId' && field.ref && data[key]) {
                    try {
                        const referencedData = await client.service(field.ref).get(data[key]);
                        newData[key] = referencedData.name || Object.values(referencedData)[0] || null;
                    } catch (error) {
                        console.error(`Error fetching referenced data for ${key}:`, error);
                        newData[key] = '';
                    }
                } else if (Array.isArray(field.type) && field.type[0] === 'ObjectId' && field.ref && data[key]) {
                    try {
                        const referencedDataArray = await Promise.all(data[key].map((id) => client.service(field.ref).get(id)));

                        newData[key] = referencedDataArray.map((referencedData) => referencedData.name || Object.values(referencedData)[1] || null);
                    } catch (error) {
                        console.error(`Error fetching referenced data for ${key}:`, error);
                        newData[key] = 'Error loading data';
                    }
                }
            }
        }
        return newData;
    };

    const handleNotificationHover = async (notification, event) => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);

        setHoveredNotification(null);
        setRecordDetails(null);
        setLoadingDetails(false);

        hoverTimeoutRef.current = setTimeout(async () => {
            setHoveredNotification(notification);
            setLoadingDetails(true);

            if (notification.path && notification.recordId) {
                try {
                    const response = await client.service(notification.path).get(notification.recordId);
                    const schemaResponse = await client.service(notification.path + 'Schema').find();
                    const schema = {};
                    schemaResponse.forEach((item) => {
                        schema[item.field] = { type: item.type, ref: item.ref };
                    });

                    const populatedDetails = await getRefData(notification.path, response, schema);
                    setRecordDetails(populatedDetails);
                } catch (error) {
                    console.error('Error fetching record details:', error);
                } finally {
                    setLoadingDetails(false);
                }
            } else {
                setLoadingDetails(false);
            }

            // Show the OverlayPanel only if op.current is not null
            if (op.current) {
                op.current.toggle(event);
            }
        }, 1000);
    };

    const handleNotificationItemLeave = () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        if (op.current) {
            op.current.hide();
        }
        setHoveredNotification(null);
        setRecordDetails(null);
    };

    function timeSince(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + 'y';
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + 'mo';
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + 'd';
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + 'h';
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + 'm';
        return Math.floor(seconds) + 's';
    }

    const renderRecordDetails = () => {
        if (loadingDetails) {
            return (
                <div className="p-4">
                    <Skeleton width="100%" height="20px" className="mb-2" />
                    <Skeleton width="80%" height="16px" className="mb-2" />
                    <Skeleton width="60%" height="12px" />
                    <Skeleton width="90%" height="18px" className="mb-2" />
                    <Skeleton width="70%" height="14px" />
                </div>
            );
        }

        if (!recordDetails) return null;

        const fields = Object.entries(recordDetails)
            .filter(([key]) => !['_id', 'createdAt', 'updatedAt', '__v'].includes(key))
            .map(([key, value]) => {
                if (typeof value === 'object' && value !== null) {
                    if (Array.isArray(value)) {
                        return (
                            <div key={key} className="mb-2">
                                <span className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')}: </span>
                                {value.length > 0 ? (
                                    <ul>
                                        {value.map((item, index) => (
                                            <li key={index}>{JSON.stringify(item)}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    'N/A'
                                )}
                            </div>
                        );
                    } else {
                        return (
                            <div key={key} className="mb-2">
                                <span className="font-semibold capitalize block">{key.replace(/([A-Z])/g, ' $1')}:</span>
                                {Object.entries(value).map(([subKey, subValue]) => (
                                    <div key={subKey} className="ml-4">
                                        <span className="font-medium capitalize">{subKey.replace(/([A-Z])/g, ' $1')}: </span>
                                        {JSON.stringify(subValue)}
                                    </div>
                                ))}
                            </div>
                        );
                    }
                }
                return (
                    <div key={key} className="mb-2">
                        <span className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')}: </span>
                        {value && value.toString ? value.toString() : 'N/A'}
                    </div>
                );
            });

        return (
            <div className="p-4 border-b border-gray-200" style={{ minWidth: '300px' }}>
                <h4 className="text-lg font-semibold mb-4">Record Details</h4>
                {fields}
            </div>
        );
    };

    return (
        <>
            <div className="notification-icon ml-4">
                <div onMouseEnter={handleMouseEnter} ref={notificationIconRef} onClick={toggleNotifications}>
                    {hasUnreadNotifications ? <Notification style={{ color: 'var(--primary-color)' }} /> : <Notification style={{ color: 'var(--primary-color)' }} />}
                    {notifications.filter((n) => !n.read).length > 0 && (
                        <Badge
                            value={notifications.filter((n) => !n.read).length}
                            className="absolute bg-red-500 text-white flex items-center justify-center"
                            style={{
                                top: '-0.5rem',
                                right: '-0.6rem',
                                minWidth: '1rem',
                                height: '1rem',
                                paddingTop: '0.05rem',
                                lineHeight: '1rem',
                                fontSize: '0.6rem'
                            }}
                        />
                    )}
                </div>

                {showNotifications && (
                    <div className="notification-panel absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-100" ref={notificationRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                        <div className="flex">
                            <div className="flex flex-col max-h-[80vh] overflow-hidden w-full">
                                <div className="flex justify-between items-center p-2 border-b border-gray-100">
                                    <h3 className="mt-3 ml-3 text-xl font-semibold text-gray-900">Notifications</h3>
                                    <Button label="Mark all as read" className="p-button-text p-button-sm hover:bg-gray-100" style={{ color: '#9400d3' }} onClick={markAllAsRead} />
                                </div>

                                <div className="overflow-y-auto">
                                    {notifications
                                        .filter((n) => n.path !== 'notifications')
                                        .map((notification) => (
                                            <div
                                                key={notification._id}
                                                className={`flex items-start p-3 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-50' : ''}`}
                                                onClick={() => handleNotificationClick(notification)}
                                                onMouseEnter={(e) => handleNotificationHover(notification, e)}
                                                onMouseLeave={handleNotificationItemLeave}
                                            >
                                                <Avatar
                                                    label={(() => {
                                                        if (notification.toUser) {
                                                            const tokens = notification.toUser.split(' ').filter((token) => token !== '-' && token.trim() !== '');
                                                            if (tokens.length >= 2) {
                                                                return tokens
                                                                    .slice(0, 2)
                                                                    .map((token) => token.charAt(0).toUpperCase())
                                                                    .join('');
                                                            }
                                                            return notification.toUser.substring(0, 2).toUpperCase();
                                                        } else {
                                                            return ' ';
                                                        }
                                                    })()}
                                                    shape="circle"
                                                    size="large"
                                                    className="flex-shrink-0"
                                                    style={{
                                                        backgroundColor: '#D30000',
                                                        color: '#ffffff',
                                                        marginRight: '10px',
                                                        marginTop: '5px',
                                                        borderRadius: '50%'
                                                    }}
                                                />

                                                <div className="ml-3 flex-1 min-w-0">
                                                    <div className="text-base text-gray-900">
                                                        <span className="font-semibold">{notification.senderName}</span> {notification.content} by {notification.toUser}
                                                        {!notification.read && (
                                                            <span
                                                                className="ml-2 inline-block  bg-blue-500 rounded-full"
                                                                style={{
                                                                    minWidth: '0.5rem',
                                                                    minHeight: '0.5rem'
                                                                }}
                                                            ></span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1 flex items-center">
                                                        <i className="pi pi-clock mr-1"></i>
                                                        {timeSince(new Date(notification.sent))} ago
                                                    </div>
                                                    {notification.previewContent && <div className="text-sm text-gray-600 mt-2 p-2 bg-gray-100 rounded">{notification.previewContent}</div>}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <OverlayPanel
                ref={op}
                id="overlay_panel"
                style={{
                    width: '350px',
                    transform: 'translateX(-400px) translateY(-110px)',
                    display: showNotifications ? 'block' : 'none'
                }}
            >
                {hoveredNotification && <div className="w-full">{renderRecordDetails()}</div>}
            </OverlayPanel>
        </>
    );
};

const mapState = (state) => {
    const { isLoggedIn, user } = state.auth;
    return { isLoggedIn, user };
};
const mapDispatch = (dispatch) => ({
    logout: () => dispatch.auth.logout()
});

export default connect(mapState, mapDispatch)(NotificationMenu);
