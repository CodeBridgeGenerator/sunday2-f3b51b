import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { Tag } from 'primereact/tag';
import client from '../../../services/restClient';
import ProfilesEditDialogComponent from '../ProfilesPage/FilteredProfilesEditDialogComponent';

function ProfileCard(props) {
    const [profiles, setProfiles] = useState([]);
    const [roleNames, setRoleNames] = useState({});
    const [editProfile, setEditProfile] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [imageUrls, setImageUrls] = useState({}); // Cache for image URLs
    const { user } = props;

    // Fetch profiles data
    useEffect(() => {
        client
            .service('profiles')
            .find({
                query: {
                    $limit: 10000,
                    userId: props.user._id,
                    $populate: [
                        { path: 'userId', service: 'users', select: ['name'] },
                        { path: 'company', service: 'companies', select: ['name'] },
                        {
                            path: 'position',
                            service: 'positions',
                            select: ['name', 'roleId']
                        },
                        { path: 'role', service: 'positions', select: ['name'] },
                        { path: 'branch', service: 'branches', select: ['name'] },
                        { path: 'section', service: 'sections', select: ['name'] },
                        { path: 'department', service: 'departments', select: ['name'] },
                        {
                            path: 'address',
                            service: 'user_addresses',
                            select: ['Street1', 'Street2', 'City', 'State', 'Country']
                        },
                        {
                            path: 'phone',
                            service: 'user_phones',
                            select: ['countryCode', 'operatorCode', 'number']
                        }
                        // { path: "position.roleId", service: "roles", select: ["name"] },
                    ]
                }
            })
            .then((res) => {
                console.log(res.data);
                setProfiles(res.data);
            })
            .catch((error) => {
                props.alert({
                    title: 'User Profiles',
                    type: 'error',
                    message: error.message || 'Failed to get profiles'
                });
            });
    }, [props.user._id, props.alert]);

    // Cache image URLs for better performance
    useEffect(() => {
        profiles.forEach((profile) => {
            const imageId = profile.image?.[0];
            if (imageId && !imageUrls[imageId]) {
                client
                    .service('documentStorages')
                    .get(imageId)
                    .then((record) => {
                        setImageUrls((prev) => ({ ...prev, [imageId]: record.url }));
                    })
                    .catch((error) => console.error('Error fetching image URL:', error));
            }
        });
    }, [profiles, imageUrls]);

    // Fetch role names and cache them
    useEffect(() => {
        profiles.forEach((profile) => {
            if (profile.position?.roleId && !roleNames[profile.position.roleId]) {
                client
                    .service('roles')
                    .get(profile.position.roleId)
                    .then((role) => {
                        setRoleNames((prev) => ({
                            ...prev,
                            [profile.position.roleId]: role.name
                        }));
                    })
                    .catch((error) => console.error('Error fetching role name:', error));
            }
        });
    }, [profiles, roleNames]);

    function ProfileSection({ items, className }) {
        return (
            <div className={`flex ${className} max-md:max-w-full`}>
                {items.map((item, index) => (
                    <div key={index} className="flex flex-col flex-1 shrink basis-0 min-w-[250px] max-md:max-w-full">
                        <div className="leading-none text-gray-600  mb-2 max-md:max-w-full" style={{ fontSize: '13px' }}>
                            {item.title}
                        </div>
                        <div className="leading-5  max-md:max-w-full">{item.content}</div>
                    </div>
                ))}
            </div>
        );
    }

    function ProfileFullSection({ items, className }) {
        return items.map((item, index) => (
            <div key={index} className={`flex ${className} max-md:max-w-full mt-3`}>
                <div className="flex flex-col flex-1 shrink basis-0 min-w-[250px] max-md:max-w-full">
                    <div className="leading-none text-gray-600  mb-2 max-md:max-w-full" style={{ fontSize: '13px' }}>
                        {item.title}
                    </div>
                    <div className="leading-5  max-md:max-w-full">{item.content}</div>
                </div>
            </div>
        ));
    }

    const handleEditProfile = (profile) => {
        setSelectedProfile(profile);
        setEditProfile(true);
    };

    return (
        <section className="profile-cards-container ">
            {profiles.map((profile, index) => {
                const roleName = roleNames[profile.position?.roleId] || 'Role';
                const imageId = profile.image?.[0];
                const imageUrl = imageUrls[imageId] || null;
                const bioAndSkills = [
                    { title: 'Bio', content: profile.bio || 'N/A' },
                    { title: 'Skills', content: profile.skills?.join(', ') || 'N/A' }
                ];

                const personalInfo = [
                    { title: 'Position', content: profile.position?.name || 'N/A' },
                    { title: 'Role', content: profile.role?.name || 'N/A' },
                    { title: 'Superior', content: profile.manager?.name || 'N/A' }
                ];

                const companyInfo = [
                    {
                        title: 'Department',
                        content: `${profile.hod ? 'Is Head of' : ''} ${profile.department?.name || 'N/A'} `
                    },
                    {
                        title: 'Section',
                        content: `${profile.hos ? 'Is Head of' : ''} ${profile.section?.name || 'N/A'}`
                    },
                    { title: 'Branch', content: profile.branch?.name || 'N/A' },
                    { title: 'Company', content: profile.company?.name || 'N/A' }
                ];

                const address = [
                    {
                        title: 'User Address',
                        content: `${profile.address?.Street1 || ''} ${profile.address?.Street2 || ''} ${profile.address?.City || ''} ${profile.address?.State || ''} ${profile.address?.Country || ''}`
                    },
                    {
                        title: 'User Contact no.',
                        content: `${profile.phone?.number || ''}`
                    }
                ];

                return (
                    <div
                        key={index}
                        className="surface-card mb-5 p-4 rounded-lg"
                        style={{
                            marginBottom: '20px',
                            boxShadow: '0 0 5px rgba(0, 0, 0, 0.2)'
                        }}
                    >
                        <div className="flex flex-wrap justify-content-between align-items-center">
                            <div className="flex align-items-center">
                                {imageUrl ? (
                                    <Avatar
                                        image={imageUrl}
                                        size="xlarge"
                                        shape="circle"
                                        style={{
                                            borderRadius: '50%',
                                            width: '80px',
                                            height: '80px'
                                        }}
                                    />
                                ) : (
                                    <Avatar
                                        label={(() => {
                                            const tokens = profile.name.split(' ').filter((token) => token !== '-' && token.trim() !== '');
                                            if (tokens.length >= 2) {
                                                return tokens
                                                    .slice(0, 2)
                                                    .map((n) => n.charAt(0).toUpperCase())
                                                    .join('');
                                            }
                                            return profile.name.substring(0, 2).toUpperCase();
                                        })()}
                                        className="mr-2"
                                        shape="circle"
                                        size="xlarge"
                                        style={{
                                            borderRadius: '50%',
                                            backgroundColor: '#D30000',
                                            color: '#ffffff',
                                            width: '80px',
                                            height: '80px'
                                        }}
                                    />
                                )}
                                <div className="ml-3">
                                    <h5 className="font-bold mb-2">{profile.name || 'Unknown'}</h5>
                                    <span className=" text-#2A4454-500">{profile.position?.name || 'Unknown Position'}</span>
                                    <div>
                                        <Tag className="mt-2" value={roleName} severity="success" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-5 items-center">
                                {/* <span className="self-stretch px-3.5 py-1.5 my-auto text-sm tracking-wide leading-none whitespace-nowrap bg-gray-200 rounded-md text-slate-700">
                  Default
                </span> */}
                                <Button
                                    label="Edit profile"
                                    onClick={() => handleEditProfile(profile)}
                                    className="p-button-rounded p-button-secondary"
                                    style={{
                                        backgroundColor: 'white',
                                        color: '#D30000',
                                        border: '2px solid #D30000',
                                        height: '30px'
                                    }}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col mt-5 w-full  tracking-wide max-md:max-w-full">
                            <ProfileFullSection items={bioAndSkills} className="flex-wrap gap-5 items-start w-full" />

                            <ProfileSection items={personalInfo} className="flex-wrap mt-5 gap-5 items-start w-full" />
                            <ProfileSection items={companyInfo} className="flex-wrap mt-5 gap-5 items-start w-full" />
                            <ProfileSection items={address} className="flex-wrap mt-5  gap-5 items-start w-full" />
                        </div>
                        <ProfilesEditDialogComponent show={editProfile} entity={selectedProfile} onHide={() => setEditProfile(false)} userId={props.user._id} />
                    </div>
                );
            })}
        </section>
    );
}

const mapState = (state) => ({ user: state.auth.user });
const mapDispatch = (dispatch) => ({
    alert: (data) => dispatch.toast.alert(data),
    hasServicePermission: (service) => dispatch.perms.hasServicePermission(service),
    hasServiceFieldsPermission: (service) => dispatch.perms.hasServiceFieldsPermission(service)
});

export default connect(mapState, mapDispatch)(ProfileCard);
