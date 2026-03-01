import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { v4 as uuidv4 } from 'uuid';

const Settings = (props) => {
    const { user, cache } = props;
    const navigate = useNavigate();
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(false);
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
        const fetchSettings = async () => {
            try {
                const tabId = getOrSetTabId();
                const response = await props.get();
                const currentCache = response?.results;
                const selectedUser = localStorage.getItem(`selectedUser_${tabId}`);
                setSelectedUser(selectedUser || currentCache.selectedUser);
                const selectedUserProfile = currentCache?.profiles?.find((profile) => profile.profileId === selectedUser);
                if (selectedUserProfile?.preferences?.settings) {
                    setSettings(selectedUserProfile.preferences.settings);
                } else {
                    console.warn('Selected user profile or preferences not found in cache.');
                }
            } catch (error) {
                console.error('Failed to fetch settings', error);
                props.alert({
                    title: 'Error',
                    type: 'error',
                    message: 'Failed to fetch settings'
                });
            }
        };

        fetchSettings();
    }, [props]);

    const paginatorOptions = [
        { label: '5', value: 5 },
        { label: '10', value: 10 },
        { label: '20', value: 20 },
        { label: '120', value: 120 }
    ];

    const handleSettingChange = (service, settingName, value) => {
        setSettings((prevSettings) => ({
            ...prevSettings,
            [service]: {
                ...prevSettings[service],
                [settingName]: value
            }
        }));
    };

    const saveSettings = async () => {
        try {
            setLoading(true);
            const tabId = getOrSetTabId();
            const response = await props.get();
            const currentCache = response?.results;
            const selectedUser = localStorage.getItem(`selectedUser_${tabId}`);
            setSelectedUser(selectedUser || currentCache.selectedUser);
            if (currentCache) {
                const selectedUserProfileIndex = currentCache.profiles.findIndex((profile) => profile.profileId === selectedUser);

                if (selectedUserProfileIndex !== -1) {
                    currentCache.profiles[selectedUserProfileIndex].preferences.settings = settings;

                    props.set(currentCache);
                    props.alert({
                        title: 'Success',
                        type: 'success',
                        message: 'Settings saved successfully'
                    });
                } else {
                    console.warn('Selected user profile not found in cache.');
                    props.alert({
                        title: 'Error',
                        type: 'error',
                        message: 'Failed to save settings'
                    });
                }
            } else {
                console.warn('Cache is not available.');
                props.alert({
                    title: 'Error',
                    type: 'error',
                    message: 'Failed to save settings'
                });
            }
        } catch (error) {
            console.error('Failed to save settings', error);
            props.alert({
                title: 'Error',
                type: 'error',
                message: 'Failed to save settings'
            });
        } finally {
            setLoading(false);
        }
    };

    const formatSettingName = (name) => {
        return name
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase())
            .trim();
    };

    const formatServiceName = (name) => {
        return name
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase())
            .trim();
    };

    return (
        <div className="flex flex-column bg-white h-screen">
            <div className="p-3 mt-20">
                <Button
                    onClick={() => navigate('/project')}
                    icon="pi pi-angle-left"
                    label="Back to dashboard"
                    className="gap-1.5 font-semibold tracking-wide text-[#D30000] bg-transparent border-0"
                    style={{
                        color: '#D30000',
                        backgroundColor: 'transparent',
                        border: 'none',
                        fontSize: '13px'
                    }}
                />
            </div>
            <Card title="Settings" className="flex-1 p-5 overflow-y-auto w-full">
                <Accordion multiple activeIndex={[0]}>
                    {Object.entries(settings).map(([service, serviceSettings]) => (
                        <AccordionTab key={service} header={formatServiceName(service)}>
                            <div className="grid">
                                {Object.entries(serviceSettings).map(([settingName, settingValue]) => (
                                    <div key={settingName} className="col-12 md:col-6 lg:col-4 p-field mb-2">
                                        <label htmlFor={settingName}>{formatSettingName(settingName)}: </label>
                                        {settingName === 'paginatorRecordsNo' ? (
                                            <Dropdown id={settingName} value={settingValue} options={paginatorOptions} onChange={(e) => handleSettingChange(service, settingName, e.value)} placeholder="Select" />
                                        ) : (
                                            <InputText id={settingName} value={settingValue} onChange={(e) => handleSettingChange(service, settingName, e.target.value)} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </AccordionTab>
                    ))}
                </Accordion>

                <Button label="Save" onClick={saveSettings} loading={loading} />
            </Card>
        </div>
    );
};

const mapState = (state) => {
    const { user, isLoggedIn } = state.auth;
    const { cache } = state.cache;
    return { user, isLoggedIn, cache };
};
const mapDispatch = (dispatch) => ({
    alert: (data) => dispatch.toast.alert(data),
    get: () => dispatch.cache.get(),
    set: (data) => dispatch.cache.set(data)
});

export default connect(mapState, mapDispatch)(Settings);
