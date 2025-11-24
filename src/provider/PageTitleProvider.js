"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const PageTitleContext = createContext();

export const PageTitleProvider = ({ children }) => {
    const pathname = usePathname();
    const [pageTitle, setPageTitle] = useState('Dashboard');
    const [isManuallySet, setIsManuallySet] = useState(false);

    // Define the mapping of routes to page titles
    const routeTitles = {
        '/main': 'Dashboard',
        '/main/members': 'Members',
        '/main/genealogy': 'Genealogy',
        '/main/codes': 'Admin Codes - Available',
        '/main/codes/generate': 'Generate Codes',
        '/main/codes/history': 'Admin Codes - History',
        '/main/codes/used': 'Admin Codes - Used',
        '/main/withdrawal': 'Withdrawal',
        '/main/products': 'Products',
        '/main/products/add': 'Add Product',
        '/main/orders': 'Orders',
        '/main/transactions': 'Transactions',
        '/main/settings': 'Settings',
        '/main/settings/payoutmethod': 'Payout Methods',
        '/main/settings/product-category': 'Product Categories',
        '/main/profile': 'Profile',
        '/main/aeproduct': 'Add/Edit Product'
    };

    useEffect(() => {
        // Only auto-set title if it hasn't been manually set
        if (isManuallySet) return;
        
        // Get the title from the mapping, or create a default title
        let title = routeTitles[pathname];
        
        if (!title) {
            // If no direct match, try to create a title from the route
            const segments = pathname.split('/').filter(Boolean);
            const lastSegment = segments[segments.length - 1] || 'dashboard';
            
            // Convert kebab-case or camelCase to Title Case
            title = lastSegment
                .replace(/[-_]/g, ' ')
                .replace(/([a-z])([A-Z])/g, '$1 $2')
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
        }
        
        console.log("Auto-setting title to:", title);
        setPageTitle(title);
    }, [pathname, isManuallySet]);

    // Function to manually update page title
    const updatePageTitle = (newTitle) => {
        console.log("Manually setting title to:", newTitle);
        setPageTitle(newTitle);
        setIsManuallySet(true);
    };

    // Reset manual flag when pathname changes
    useEffect(() => {
        setIsManuallySet(false);
    }, [pathname]);

    const value = {
        pageTitle,
        updatePageTitle
    };

    return (
        <PageTitleContext.Provider value={value}>
            {children}
        </PageTitleContext.Provider>
    );
};

export const usePageTitle = () => {
    const context = useContext(PageTitleContext);
    if (!context) {
        throw new Error('usePageTitle must be used within a PageTitleProvider');
    }
    return context;
};