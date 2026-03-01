import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import RecentComp from './RecentFavDashComp/RecentComp';
import PinnedItems from './RecentFavDashComp/FavComponent';
import TotalComponent from './RecentFavDashComp/TotalComponent';
import LineChart from './Charts/LineChart/PeopleLineChart';
import CompanyBarChart from './Charts/BarChart/PeopleBarChart';
import PeopleServices from './TabView/seviceTables/PeopleServices';
import ChartPopup from './PopUpComp/ChartPopup';
import ProjectLayout from '../Layouts/ProjectLayout';
import client from '../../services/restClient';
import { classNames } from 'primereact/utils';
import Report from '../../assets/icons/Report';
import PopupCard from './PopUpComp/PopupCard';
import moment from 'moment';
import './Dashboards.css';

const DashboardHRControls = (props) => {
    const [isEdit, setIsEdit] = useState(false);
    const [showCard, setShowCard] = useState(false);
    const [showDash, setShowDash] = useState(false);
    const [showDates, setStartEndDates] = useState({});
    const [total, setTotal] = useState(0);
    const [recentItems, setRecentItems] = useState([]);
    const [pinnedItems, setPinnedItems] = useState([]);

    const fetchCache = async () => {
        try {
            const response = await props.get();
            const { profiles = [], selectedUser } = response.results || {};

            const selectedProfile = profiles.find((profile) => profile.profileId === selectedUser);

            if (selectedProfile?.preferences) {
                const { recent = [], favourites = [] } = selectedProfile.preferences;

                const uniqueRecentItems = recent
                    .reverse()
                    .filter((item, index, self) => self.findIndex((i) => i.url === item.url) === index && item.mainMenu === 'people')
                    .slice(0, 3)
                    .map((item) => ({
                        text: item.label,
                        subtext: item.name,
                        src: item.icon,
                        url: item.url
                    }));

                setRecentItems(uniqueRecentItems);

                const filteredPinnedItems = favourites
                    .filter((item) => item.mainMenu === 'people')
                    .slice(-3)
                    .map((item) => ({
                        text: item.label,
                        subtext: item.mainMenu,
                        src: item.icon,
                        url: item.url
                    }));

                setPinnedItems(filteredPinnedItems);
            }
        } catch (error) {
            console.error('Failed to fetch cache:', error);
        }
    };

    const fetchTotal = async () => {
        try {
            const { total } = await client.service('profiles').find({
                query: {
                    $limit: 0
                }
            });

            setTotal(total);
        } catch (error) {
            console.error('Failed to fetch companies:', error);
            props.alert({
                title: 'Companies',
                type: 'error',
                message: error.message || 'Failed to get Companies'
            });
        }
    };

    const fetchRecentItems = async () => {
        try {
            const toDateAgo = new Date();
            const fromDateAgo = new Date();
            fromDateAgo.setDate(toDateAgo.getDate() - 20);
            setStartEndDates({ from: fromDateAgo, to: toDateAgo });
            console.log(toDateAgo, fromDateAgo);

            const count = await client.service('loginHistory').find({
                query: {
                    createdAt: {
                        $lte: toDateAgo,
                        $gte: fromDateAgo
                    },
                    $populate: [
                        {
                            path: 'userId',
                            service: 'users',
                            select: ['name', 'email']
                        }
                    ]
                }
            });

            const sorted = count.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            // Step 2: Filter unique users by userId._id
            const uniqueUsersMap = new Map();
            for (const item of sorted) {
                if (!uniqueUsersMap.has(item.userId._id)) {
                    const { data } = await client.service('profiles').find({
                        query: {
                            userId: item.userId._id,
                            $populate: [
                                {
                                    path: 'role',
                                    service: 'roles',
                                    select: ['name']
                                },
                                {
                                    path: 'branch',
                                    service: 'branches',
                                    select: ['name']
                                },
                                {
                                    path: 'company',
                                    service: 'companies',
                                    select: ['name']
                                },
                                {
                                    path: 'position',
                                    service: 'positions',
                                    select: ['name']
                                }
                            ]
                        }
                    });
                    if (data[0]?.role?.name === 'Staff') {
                        uniqueUsersMap.set(item.userId._id, {
                            name: item.userId.name,
                            ...data[0]
                        });
                    }
                }
            }

            const bottom5Users = Array.from(uniqueUsersMap.values()).slice(-5);
            const mapItems = bottom5Users.map((e) => {
                return { subtext: e.name };
            });
            // console.log("length", len);
            // console.log(bottom5Users, mapItems);
            setRecentItems(mapItems);
        } catch (error) {
            console.error('Failed to fetch recent items:', error);
            props.alert({
                title: 'Roles',
                type: 'error',
                message: error.message || 'Failed to get Companies'
            });
        }
    };

    const fetchFrequentItems = async () => {
        try {
            const toDateAgo = new Date();
            const fromDateAgo = new Date();
            fromDateAgo.setDate(toDateAgo.getDate() - 20);
            console.log(toDateAgo, fromDateAgo);

            const count = await client.service('loginHistory').find({
                query: {
                    createdAt: {
                        $lte: toDateAgo,
                        $gte: fromDateAgo
                    },
                    $populate: [
                        {
                            path: 'userId',
                            service: 'users',
                            select: ['name', 'email']
                        }
                    ]
                }
            });

            const sorted = count.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            // Step 2: Filter unique users by userId._id
            const uniqueUsersMap = new Map();
            for (const item of sorted) {
                if (!uniqueUsersMap.has(item.userId._id)) {
                    const { data } = await client.service('profiles').find({
                        query: {
                            userId: item.userId._id,
                            $populate: [
                                {
                                    path: 'role',
                                    service: 'roles',
                                    select: ['name']
                                },
                                {
                                    path: 'branch',
                                    service: 'branches',
                                    select: ['name']
                                },
                                {
                                    path: 'company',
                                    service: 'companies',
                                    select: ['name']
                                },
                                {
                                    path: 'position',
                                    service: 'positions',
                                    select: ['name']
                                }
                            ]
                        }
                    });
                    if (data[0]?.role?.name === 'Staff') {
                        uniqueUsersMap.set(item.userId._id, {
                            name: item.userId.name,
                            ...data[0]
                        });
                    }
                }
            }

            // Step 3: Get top 5 most recent unique users
            const top5Users = Array.from(uniqueUsersMap.values()).slice(0, 5);
            const mapItems = top5Users.map((e) => {
                return { subtext: e.name };
            });
            // console.log(mapItems);
            setPinnedItems(mapItems);
        } catch (error) {
            console.error('Failed to fav items:', error);
            props.alert({
                title: 'Login History',
                type: 'error',
                message: error.message || 'Failed to get fav'
            });
        }
    };

    useEffect(() => {
        fetchRecentItems();
        fetchFrequentItems();
        fetchTotal();
    }, []);

    return (
        <ProjectLayout>
            <div className="p-2 md:p-4">
                {/* Title and Edit section */}
                <div className="mb-2 flex justify-content-between align-items-center">
                    <div className="mb-4 flex justify-content-between align-items-center">
                        <span className="text-900 font-medium text-3xl m-0.5">People Management {showDash ? ' Dashboard' : ''}</span>
                    </div>
                    {/* <EditDashComp isEdit={isEdit} setIsEdit={setIsEdit} /> */}
                    <div className="mb-4 flex justify-content-between align-items-center">
                        <span className="text-900 font-medium text-3xl m-0.5">
                            {!showDash ? (
                                <Report onClick={() => setShowDash(!showDash)}></Report>
                            ) : (
                                <i className="pi pi-angle-up" onClick={() => setShowDash(!showDash)}>
                                    {' '}
                                </i>
                            )}
                        </span>
                    </div>
                </div>

                <div
                    className={classNames('surface-border border-round surface-card', {
                        hidden: !showDash
                    })}
                >
                    <div className="grid">
                        {showDates?.from && (
                            <>
                                <div className="col-12 flex justify-content-between align-items-center ">
                                    <span className="text-sm text-600">Since {moment(showDates?.from).fromNow()}</span>

                                    <span className=" text-sm text-600">All Time </span>
                                </div>
                            </>
                        )}
                        {/* Recent Component */}
                        <div className="col-12 md:col-4 mb-3">
                            <RecentComp title={'Least Logins'} isEdit={isEdit} recentItems={recentItems} />
                        </div>

                        {/* Pinned Items Component */}
                        <div className="col-12 md:col-4 mb-3">
                            <PinnedItems Pinned={'Favourites'} isEdit={isEdit} pinnedItems={pinnedItems} />
                        </div>

                        {/* Total Component */}
                        <div className="col-12 md:col-4">
                            <TotalComponent TotalComp={'Total Profiles'} isEdit={isEdit} total={total} />
                        </div>
                    </div>
                </div>

                {/* Charts Section with integrated ChartPopup */}
                <div className={classNames('', { hidden: !showDash })}>
                    <div className="mb-3">
                        <ChartPopup isEdit={isEdit} setIsEdit={setIsEdit} />
                    </div>
                    {showCard && <PopupCard />}
                    <div className="grid">
                        {/* Line Chart */}

                        <div className="col-12 md:col-8 mb-3 relative">
                            <LineChart name={'Total Employees'} isEdit={isEdit} />
                        </div>

                        {/* Bar Chart */}
                        <div className="col-12 md:col-4 mb-3">
                            <CompanyBarChart total={'Total Postions'} isEdit={isEdit} />
                        </div>
                        {/* <div className="col-12 md:col-8 mb-3 relative">
              <MultipleChart />
            </div> */}
                    </div>
                </div>

                {/* Team Members Section */}
                <div>
                    <PeopleServices />
                </div>
            </div>
        </ProjectLayout>
    );
};

const mapState = (state) => {
    const { user, isLoggedIn } = state.auth;
    const { cache } = state.cache;
    return { user, isLoggedIn, cache };
};
const mapDispatch = (dispatch) => ({
    alert: (data) => dispatch.toast.alert(data),
    get: () => dispatch.cache.get()
});

export default connect(mapState, mapDispatch)(DashboardHRControls);
