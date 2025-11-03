import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const usePageTitle = () => {
    const pathname = usePathname();
    const [pageTitle, setPageTitle] = useState('Dashboard');

    // Define the mapping of routes to page titles
    const routeTitles = {
        '/main': 'Dashboard',
        '/main/members': 'Members',
        '/main/genealogy': 'Genealogy',
        '/main/codes': 'Codes',
        '/main/codes/generate': 'Generate Codes',
        '/main/codes/history': 'Code History',
        '/main/codes/used': 'Used Codes',
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
        
        setPageTitle(title);
    }, [pathname]);

    // Function to manually update page title if needed
    const updatePageTitle = (newTitle) => {
        setPageTitle(newTitle);
    };

    return { pageTitle, updatePageTitle };
};

export default usePageTitle;