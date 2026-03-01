import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

const FavouriteService = (props) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const favouriteItem = props.favouriteItem;
    const serviceName = props.serviceName;
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
        get();
    }, []);

    const get = async () => {
        try {
            const tabId = getOrSetTabId();
            const response = await props.get();
            const currentCache = response?.results;
            const selectedUser = localStorage.getItem(`selectedUser_${tabId}`);
            setSelectedUser(selectedUser || currentCache.selectedUser);
            // Find the profile that matches the selectedUser profileId
            const selectedProfile = currentCache?.profiles.find((profile) => profile.profileId === selectedUser);

            if (selectedProfile?.preferences?.favourites?.some((item) => item.label === serviceName)) {
                setIsFavorite(true);
            } else {
                setIsFavorite(false);
            }
        } catch (error) {
            console.error('Error fetching cache:', error);
        }
    };

    const handleFavoriteClick = async () => {
        try {
            // Toggle the favorite status
            setIsFavorite((prev) => !prev);

            // Get the current cache
            const response = await props.get();
            const currentCache = response?.results;

            if (!currentCache) {
                console.error('Cache not found.');
                return;
            }

            // Find the selected profile
            const selectedProfile = currentCache.profiles.find((profile) => profile.profileId === selectedUser);

            if (!selectedProfile) {
                console.error('Selected profile not found.');
                return;
            }

            const isNowFavorite = !isFavorite;

            if (isNowFavorite) {
                if (!selectedProfile.preferences.favourites.some((item) => item.label === serviceName)) {
                    selectedProfile.preferences.favourites.push(favouriteItem);
                }
            } else {
                selectedProfile.preferences.favourites = selectedProfile.preferences.favourites.filter((item) => item.label !== serviceName);
            }

            await props.set(currentCache);
            console.log('Favorites updated successfully:', currentCache);
        } catch (error) {
            console.error('Error updating favorites:', error);
        }
    };

    return (
        <i
            className={`pi ${isFavorite ? 'pi-star-fill' : 'pi-star'} favorite-icon mt-2`}
            onClick={handleFavoriteClick}
            title="Add to Favorites"
            style={{
                marginRight: '14px',
                fontSize: '1.5em',
                cursor: 'pointer',
                color: isFavorite ? 'orange' : 'grey'
            }}
        />
    );
};

const mapState = (state) => {
    const { cache } = state.cache;
    return { cache };
};
const mapDispatch = (dispatch) => ({
    get: () => dispatch.cache.get(),
    set: (data) => dispatch.cache.set(data)
});

export default connect(mapState, mapDispatch)(FavouriteService);
