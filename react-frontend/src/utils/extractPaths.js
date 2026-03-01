import React from 'react';

const extractPaths = (getRoutes, parentPath = '') => {
    let paths = [];

    const traverse = (element, currentPath) => {
        if (!element || !element.props) return;

        let newPath = currentPath;

        // Handle Route elements
        if (element.type === 'Route' && element.props.path) {
            newPath = `${currentPath}/${element.props.path}`.replace(/\/{2,}/g, '/');
            paths.push(newPath.split('/:')[0]);
        }
        // Handle Routes elements
        else if (element.type === 'Routes') {
            const children = React.Children.toArray(element.props.children);
            children.forEach((child) => traverse(child, newPath));
            return;
        }
        // Handle ProtectedRoute elements
        else if (element.type && element.type.name === 'ProtectedRoute') {
            const children = element.props.children;
            if (children) {
                const childrenArray = Array.isArray(children) ? children : [children];
                childrenArray.forEach((child) => {
                    if (React.isValidElement(child)) {
                        traverse(child, newPath);
                    }
                });
            }
            return;
        }

        // Generic handling of children for other components
        if (element.props && element.props.children) {
            const childrenArray = Array.isArray(element.props.children) ? element.props.children : [element.props.children];
            childrenArray.forEach((child) => {
                if (React.isValidElement(child)) {
                    traverse(child, newPath);
                }
            });
        }
    };

    const routesElement = getRoutes(); // Call getRoutes to get the rendered element

    if (React.isValidElement(routesElement)) {
        traverse(routesElement, parentPath);
    } else {
        console.error('Invalid routes element returned by getRoutes:', routesElement);
    }

    return [...new Set(paths)];
};

export default extractPaths;
