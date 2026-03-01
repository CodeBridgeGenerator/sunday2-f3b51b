import React, { useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { classNames } from 'primereact/utils';
import { useAppSideBar } from './AppSideBarProvider';
import { usePopper } from 'react-popper';
import { AnimatePresence, motion } from 'framer-motion';

const AppMenu = (props) => {
    const { menus, menuKey, icon, label, to, overlayMenu } = props;
    const { activeKey, setActiveKey, open, activeDropdown } = useAppSideBar();
    const [menuExpand, setMenuExpand] = useState(activeDropdown === menuKey);
    const [referenceElement, setReferenceElement] = useState(null);
    const [popperElement, setPopperElement] = useState(null);
    const [popperOpen, setPopperOpen] = useState(false);
    const [expandedMenus, setExpandedMenus] = useState({}); // Maintain expanded state

    const { styles, attributes } = usePopper(referenceElement, popperElement, {
        placement: 'right-start',
        modifiers: [{ name: 'offset', options: { offset: [0, 30] } }],
        strategy: 'fixed'
    });

    const active = activeKey === menuKey;
    const haveChildren = menus && menus.length > 0;

    const handleMouseEnter = () => {
        setPopperOpen(true);
    };

    const handleMouseLeave = () => {
        setPopperOpen(false);
    };

    const toggleSubMenu = (menuKey) => {
        setExpandedMenus((prevExpandedMenus) => ({
            ...prevExpandedMenus,
            [menuKey]: !prevExpandedMenus[menuKey]
        }));
    };

    const renderSubMenu = useMemo(() => {
        // eslint-disable-next-line react/display-name
        return (subMenuMenus, parentActive) => {
            return (
                <div className={classNames('overflow-hidden transition-all duration-300')}>
                    <div className="flex flex-col gap-1 pl-3">
                        {subMenuMenus &&
                            subMenuMenus.map((subMenu, index) => (
                                <React.Fragment key={index}>
                                    <Link
                                        to={subMenu.to}
                                        className={classNames('flex items-center justify-between py-[10px] px-3 rounded-md duration-300 group', activeKey === subMenu.menuKey ? 'bg-[#F8ECEC]' : 'bg-transparent')}
                                        onClick={(e) => {
                                            if (subMenu.menus && subMenu.menus.length > 0) {
                                                e.preventDefault();
                                                toggleSubMenu(subMenu.menuKey);
                                            } else {
                                                setActiveKey(subMenu.menuKey);
                                            }
                                        }}
                                    >
                                        <div className="flex gap-3">
                                            <span className={classNames('duration-300 group-hover:text-primary', activeKey === subMenu.menuKey ? 'text-primary' : 'text-secondary')}>{subMenu.icon}</span>
                                            <p className={classNames('font-semibold duration-300 text-nowrap group-hover:text-primary', activeKey === subMenu.menuKey ? 'text-primary' : 'text-secondary', 'opacity-100')}>{subMenu.label}</p>
                                        </div>
                                        {subMenu.menus && subMenu.menus.length > 0 && <i className={classNames('text-xs duration-300 pi pi-chevron-down', activeKey === subMenu.menuKey ? 'text-primary' : 'text-secondary', expandedMenus[subMenu.menuKey] ? 'rotate-180' : '')}></i>}
                                    </Link>
                                    {expandedMenus[subMenu.menuKey] && subMenu.menus && subMenu.menus.length > 0 && renderSubMenu(subMenu.menus, activeKey === subMenu.menuKey)}
                                </React.Fragment>
                            ))}
                    </div>
                </div>
            );
        };
    }, [expandedMenus, activeKey]);

    return (
        <>
            <Link
                to={to}
                className={classNames('flex items-center justify-between py-[10px] px-3 rounded-md duration-300 group', active ? 'bg-[#F8ECEC]' : 'bg-transparent')}
                onClick={() => {
                    if (haveChildren) {
                        open && setMenuExpand(!menuExpand);
                        return;
                    }
                    setActiveKey(menuKey);
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <div className="flex gap-3">
                    <span ref={setReferenceElement} className={classNames('duration-300 group-hover:text-primary', active ? 'text-primary' : 'text-secondary')}>
                        {icon}
                    </span>
                    <p className={classNames('font-semibold duration-300 text-nowrap group-hover:text-primary', active ? 'text-primary' : 'text-secondary', open || overlayMenu ? 'opacity-100' : 'opacity-0')}>{label}</p>
                </div>
                {(open || overlayMenu) && haveChildren && <i className={classNames('text-xs duration-300 pi pi-chevron-down', active ? 'text-primary' : 'text-secondary', menuExpand ? 'rotate-180' : '')}></i>}
            </Link>
            <div
                className={classNames('overflow-hidden transition-all duration-300')}
                style={{
                    maxHeight:
                        (open || overlayMenu) && haveChildren && menuExpand
                            ? '1000px' // Set a very large max-height
                            : '0'
                }}
            >
                <div className="flex flex-col gap-1 pl-5">{menus && menus.map((menu, index) => <AppMenu key={index} icon={menu.icon} label={menu.label} menuKey={menu.menuKey} to={menu.to} menus={menu.menus} setActiveKey={setActiveKey} />)}</div>
            </div>
            {!open && haveChildren && (
                <AnimatePresence>
                    {popperOpen && (
                        <motion.div
                            ref={setPopperElement}
                            style={styles.popper}
                            {...attributes.popper}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            className="px-3 py-1 bg-white rounded-md shadow-md overflow-y-auto max-h-[calc(100vh-80px)]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.1, delay: 0.1 }}
                        >
                            <Link
                                to={to}
                                className={classNames('flex items-center justify-between py-[10px] px-3 rounded-md duration-300 group', active ? 'bg-[#F8ECEC]' : 'bg-transparent')}
                                onClick={() => {
                                    setActiveKey(menuKey);
                                }}
                            >
                                <div className="flex gap-3">
                                    <span className={classNames('duration-300 group-hover:text-primary', active ? 'text-primary' : 'text-secondary')}>{icon}</span>
                                    <p className={classNames('font-semibold duration-300 text-nowrap group-hover:text-primary', active ? 'text-primary' : 'text-secondary', !open ? 'opacity-100' : 'opacity-0')}>{label}</p>
                                </div>
                            </Link>
                            {renderSubMenu(menus, active)}
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </>
    );
};

export default AppMenu;
