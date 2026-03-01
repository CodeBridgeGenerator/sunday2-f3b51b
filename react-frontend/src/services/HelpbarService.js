import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const RecentService = ({ companyId, get, set, newRecentItem }) => {
    const [selectedUser, setSelectedUser] = useState();

    const getOrSetTabId = () => {
        let tabId = sessionStorage.getItem('browserTabId');
        if (!tabId) {
            tabId = uuidv4();
            sessionStorage.setItem('browserTabId', tabId);
        }
        return tabId;
    };

    useEffect(() => {
        const tabId = getOrSetTabId();
        if (selectedUser) {
            localStorage.setItem(`selectedUser_${tabId}`, selectedUser);
        }
    }, [selectedUser]);

    useEffect(() => {
        const updateRecentInCache = async () => {
            try {
                const tabId = getOrSetTabId();
                const response = await get();
                const currentCache = response?.results;
                const selectedUser = localStorage.getItem(`selectedUser_${tabId}`);
                setSelectedUser(selectedUser || currentCache.selectedUser);
                if (!currentCache || typeof currentCache !== 'object') {
                    console.error('Invalid cache structure. Initializing new structure.');
                    return;
                }

                // const selectedUser = currentCache.selectedUser;
                const userProfile = currentCache.profiles.find((profile) => profile.profileId === selectedUser);

                if (userProfile) {
                    const updatedRecent = [...userProfile.preferences.recent, newRecentItem];
                    userProfile.preferences.recent = updatedRecent;

                    const updatedCache = {
                        ...currentCache,
                        profiles: currentCache.profiles.map((profile) => (profile.profileId === selectedUser ? userProfile : profile))
                    };

                    await set(updatedCache);
                    console.log('Cache updated successfully:', updatedCache);
                } else {
                    console.log('Selected user profile not found.');
                }
            } catch (error) {
                console.error('Error updating cache:', error);
            }
        };

        updateRecentInCache();
    }, [companyId]);

    return null;
};

export default RecentService;
