// ProjectSideBarLayout.jsx
import React, { useEffect, useState } from 'react';
import AppSideBar from './appSideBar/AppSideBar.js';
import { connect } from 'react-redux';
import client from '../../services/restClient.js';
import { classNames } from 'primereact/utils';
import { v4 as uuidv4 } from 'uuid';

const ProjectSideBarLayout = (props) => {
    const { children, activeKey, activeDropdown } = props;

    const [userRoleName, setUserRoleName] = useState('Unknown Role');
    const [companyType, setCompanyType] = useState(null);

    // NEW
    const [context, setContext] = useState({
        profileId: null,
        positionId: null,
        roleId: null,
        companyId: null,
        branchId: null,
        departmentId: null,
        sectionId: null,
        userId: props.user?._id || null
    });

    const [dbMenus, setDbMenus] = useState([]); // final selected menus (processed to AppMenu shape)
    const [isMenuLoading, setIsMenuLoading] = useState(false);

    const getOrSetTabId = () => {
        let tabId = sessionStorage.getItem('browserTabId');
        if (!tabId) {
            tabId = uuidv4();
            sessionStorage.setItem('browserTabId', tabId);
        }
        return tabId;
    };

    const slugKey = (name, fallback) =>
        (name || fallback || 'menu')
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-_]/g, '');

    // Convert profileMenu.menuItems -> AppSideBar menus format (icon stays as string here; AppSideBar will map to component)
    const mapMenuItemsToSidebarMenus = (menuItems = []) => {
        return (menuItems || [])
            .filter((m) => m && m.name)
            .map((m, idx) => ({
                label: m.name,
                icon: m.icon, // string path saved in DB
                menuKey: slugKey(m.name, `menu-${idx}`),
                to: m.routePage || '#',
                menus: mapSubmenus(m.submenus, `${idx}`)
            }));
    };

    const mapSubmenus = (submenus = [], parentKey = '') => {
        if (!Array.isArray(submenus) || submenus.length === 0) return undefined;

        return submenus
            .filter((s) => s && s.name)
            .map((s, idx) => ({
                label: s.name,
                icon: s.icon,
                menuKey: slugKey(s.name, `submenu-${parentKey}-${idx}`),
                to: s.routePage || '#',
                menus: mapSubSubmenus(s.subSubmenus, `${parentKey}-${idx}`)
            }));
    };

    const mapSubSubmenus = (subSubmenus = [], parentKey = '') => {
        if (!Array.isArray(subSubmenus) || subSubmenus.length === 0) return undefined;

        return subSubmenus
            .filter((ss) => ss && ss.name)
            .map((ss, idx) => ({
                label: ss.name,
                icon: ss.icon,
                menuKey: slugKey(ss.name, `subsubmenu-${parentKey}-${idx}`),
                to: ss.routePage || '#'
            }));
    };

    // Check if a config matches current user context
    const matchesConfig = (cfg, ctx) => {
        // base fields (arrays)
        const rolesOk = !cfg.roles || cfg.roles.length === 0 || (ctx.roleId && cfg.roles.includes(ctx.roleId));
        const positionsOk = !cfg.positions || cfg.positions.length === 0 || (ctx.positionId && cfg.positions.includes(ctx.positionId));
        const profilesOk = !cfg.profiles || cfg.profiles.length === 0 || (ctx.profileId && cfg.profiles.includes(ctx.profileId));

        // optional user filter
        const userOk = !cfg.user || (ctx.userId && String(cfg.user) === String(ctx.userId));

        // additional filters (single ids)
        const companyOk = !cfg.company || (ctx.companyId && String(cfg.company) === String(ctx.companyId));
        const branchOk = !cfg.branch || (ctx.branchId && String(cfg.branch) === String(ctx.branchId));
        const deptOk = !cfg.department || (ctx.departmentId && String(cfg.department) === String(ctx.departmentId));
        const sectionOk = !cfg.section || (ctx.sectionId && String(cfg.section) === String(ctx.sectionId));

        return rolesOk && positionsOk && profilesOk && userOk && companyOk && branchOk && deptOk && sectionOk;
    };

    // Score configs based on your priority rules
    const scoreConfig = (cfg, ctx) => {
        // Base priority: profiles > positions > roles
        let base = 0;
        if (cfg.profiles && cfg.profiles.length > 0 && ctx.profileId && cfg.profiles.includes(ctx.profileId)) base = 300;
        else if (cfg.positions && cfg.positions.length > 0 && ctx.positionId && cfg.positions.includes(ctx.positionId)) base = 200;
        else if (cfg.roles && cfg.roles.length > 0 && ctx.roleId && cfg.roles.includes(ctx.roleId)) base = 100;

        // Extra filters priority: company < branch < department < section
        let extra = 0;
        if (cfg.company) extra += 10;
        if (cfg.branch) extra += 20;
        if (cfg.department) extra += 30;
        if (cfg.section) extra += 40;

        // user-specific config should win if present
        let userBoost = cfg.user ? 1000 : 0;

        return userBoost + base + extra;
    };

    const pickBestMenuConfig = (configs, ctx) => {
        const matched = (configs || []).filter((cfg) => matchesConfig(cfg, ctx));

        if (matched.length === 0) return null;

        // sort by score desc, then createdAt desc
        matched.sort((a, b) => {
            const sa = scoreConfig(a, ctx);
            const sb = scoreConfig(b, ctx);
            if (sb !== sa) return sb - sa;

            const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return db - da;
        });

        return matched[0];
    };

    // 1) Fetch current profile (selectedUser) and set context (profile/position/role/company/branch/department/section)
    useEffect(() => {
        const fetchUserRoleAndContext = async () => {
            try {
                let tabId = getOrSetTabId();
                let selectedProfileId = localStorage.getItem('selectedUser_' + tabId);

                // validate profile belongs to current user
                let profileBelongsToUser = false;
                if (selectedProfileId && props.user?._id) {
                    try {
                        const pr = await client.service('profiles').get(selectedProfileId, {
                            query: { $select: ['userId'] }
                        });
                        profileBelongsToUser = String(pr.userId) === String(props.user._id);
                    } catch (e) {
                        profileBelongsToUser = false;
                    }
                }

                // if invalid/missing, pick first profile of current user
                if ((!selectedProfileId || !profileBelongsToUser) && props.user?._id) {
                    const userProfiles = await client.service('profiles').find({
                        query: { userId: props.user._id, $limit: 1, $select: ['_id'] }
                    });
                    if (userProfiles.data?.length > 0) {
                        selectedProfileId = userProfiles.data[0]._id;
                        localStorage.setItem('selectedUser_' + tabId, selectedProfileId);
                    }
                }

                if (!selectedProfileId) return;

                // get full profile context
                const profile = await client.service('profiles').get(selectedProfileId, {
                    query: { $select: ['position', 'role', 'company', 'branch', 'department', 'section'] }
                });

                // find roleId from position if role missing
                let roleId = profile.role || null;
                let positionName = 'Unknown Role';

                if (profile.position) {
                    const pos = await client.service('positions').get(profile.position, {
                        query: { $select: ['name', 'roleId'] }
                    });

                    if (!roleId && pos?.roleId) roleId = pos.roleId;
                    if (pos?.name) positionName = pos.name;
                }

                setUserRoleName(positionName);

                // companyType (optional)
                let cType = null;
                if (profile.company) {
                    try {
                        const comp = await client.service('companies').get(profile.company, {
                            query: { $select: ['companyType'] }
                        });
                        cType = comp?.companyType || null;
                        setCompanyType(cType);
                    } catch (e) {
                        // ignore
                    }
                }

                setContext({
                    profileId: selectedProfileId,
                    positionId: profile.position || null,
                    roleId,
                    companyId: profile.company || null,
                    branchId: profile.branch || null,
                    departmentId: profile.department || null,
                    sectionId: profile.section || null,
                    userId: props.user?._id || null
                });
            } catch (error) {
                console.error('Error fetching user role/context:', error);
            }
        };

        fetchUserRoleAndContext();
    }, [props.getCache, props.user?._id]);

    // 2) Fetch profileMenu configs, pick best match, set dbMenus
    useEffect(() => {
        const fetchMenus = async () => {
            if (!context.userId) return;

            setIsMenuLoading(true);
            try {
                const orList = [];

                // base matches
                if (context.profileId) orList.push({ profiles: context.profileId });
                if (context.positionId) orList.push({ positions: context.positionId });
                if (context.roleId) orList.push({ roles: context.roleId });

                // allow configs that are purely filter-based (company/branch/dept/section)
                if (context.companyId) orList.push({ company: context.companyId });
                if (context.branchId) orList.push({ branch: context.branchId });
                if (context.departmentId) orList.push({ department: context.departmentId });
                if (context.sectionId) orList.push({ section: context.sectionId });

                // also allow user-specific menus
                orList.push({ user: context.userId });

                const menuResults = await client.service('profileMenu').find({
                    query: {
                        $limit: 200,
                        $sort: { createdAt: -1 },
                        ...(orList.length > 0 ? { $or: orList } : {})
                    }
                });

                const best = pickBestMenuConfig(menuResults.data || [], context);

                if (best?.menuItems?.length > 0) {
                    setDbMenus(mapMenuItemsToSidebarMenus(best.menuItems));
                } else {
                    // fallback to default menus
                    setDbMenus([]);
                }
            } catch (error) {
                console.error('Error fetching profileMenu:', error);
                setDbMenus([]);
            } finally {
                setIsMenuLoading(false);
            }
        };

        fetchMenus();
    }, [context.userId, context.profileId, context.positionId, context.roleId, context.companyId, context.branchId, context.departmentId, context.sectionId]);

    return props.isLoggedIn ? (
        <div className="flex min-h-[calc(100vh-5rem)] mt-2 bg-white">
            <AppSideBar className={classNames('', { hidden: !children })} userRole={userRoleName} companyType={companyType} activeKey={activeKey} activeDropdown={activeDropdown} dbMenus={dbMenus} isMenuLoading={isMenuLoading} />
            <div className="flex-1 " style={{ overflowX: 'auto' }}>
                {children}
            </div>
        </div>
    ) : (
        children
    );
};

const mapState = (state) => {
    const { isLoggedIn, user } = state.auth;
    return { isLoggedIn, user };
};

const mapDispatch = (dispatch) => ({
    logout: () => dispatch.auth.logout(),
    getCache: () => dispatch.cache.get(),
    setCache: (data) => dispatch.cache.set(data)
});

export default connect(mapState, mapDispatch)(ProjectSideBarLayout);
