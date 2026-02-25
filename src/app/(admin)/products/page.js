"use client"
import DataTable from 'react-data-table-component';
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import callApi from '@/utils/api-caller';
import PreLoader from '@/components/preloader';
import NoRecord from '@/components/NoRecord';
import PrimaryBtn from "@/components/primaryBtn";
import { createPortal } from 'react-dom';
import toast, { Toaster } from 'react-hot-toast';
import ConfirmDelete from './confirm';
import { Package, Layers, EllipsisVertical } from 'lucide-react';
import { CODETYPE } from '@/utils/constants';


export default function Product(props) {

    const session = useSession()
    const [initialized, setinitialized] = useState(false)

    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [loadstate, setloadstate] = useState("")
    const [searchTerm, setsearchTerm] = useState("")
    const [categoryFilter, setCategoryFilter] = useState("all")
    const [showConfirm, setshowConfirm] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        if (session.status === "unauthenticated") {
            router.replace("/login");
        } else if (session.status == "authenticated") {
            setinitialized(true)
        }
    }, [session])

    useEffect(() => {
        if (initialized) {
            init()
        }
    }, [initialized])

    const init = async () => {
        setloadstate("loading")
        try {
            const ret = await callApi("/product")
            if (ret.status == 200) {
                setProducts(ret.data)
                setloadstate("success")
            } else {
                setloadstate("")
            }
        } catch (err) {
            console.log(err)
            setloadstate("")
        }
    }

    const handleDeleteSuccess = () => {
        setshowConfirm(false);
        toast.success("Product deleted successfully");
        init()
    }

    const categories = useMemo(() => {
        const catMap = new Map()
        products.forEach((p) => {
            if (p.category_id?._id && p.category_id?.name) {
                catMap.set(p.category_id._id, p.category_id.name)
            }
        })
        return Array.from(catMap, ([id, name]) => ({ id, name }))
    }, [products])

    const stats = useMemo(() => {
        const totalProducts = products.length
        const totalCategories = categories.length
        const packageCount = products.filter((p) => p.isProdPackage).length
        return { totalProducts, totalCategories, packageCount }
    }, [products, categories])

    const filteredProducts = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase()
        return products.filter((p) => {
            const matchesSearch =
                normalizedSearch === "" ||
                p.productname?.toLowerCase().includes(normalizedSearch) ||
                p.code?.toLowerCase().includes(normalizedSearch) ||
                p.category_id?.name?.toLowerCase().includes(normalizedSearch)

            const matchesCategory =
                categoryFilter === "all" ||
                p.category_id?._id === categoryFilter

            return matchesSearch && matchesCategory
        })
    }, [products, searchTerm, categoryFilter])

    const renderCol = (row) => {
        const [open, setOpen] = React.useState(false);
        const [menuPosition, setMenuPosition] = React.useState({ top: 0, left: 0 });
        const buttonRef = React.useRef(null);
        const menuRef = React.useRef(null);

        const handleToggle = () => {
            if (!open && buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect();
                setMenuPosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX - 100 });
            }
            setOpen((prev) => !prev);
        };

        const handleGo = (url) => {
            router.push(url);
        }

        const handleDeleteClick = (row) => {
            setshowConfirm(true);
            setSelectedProduct(row);
            setOpen(false);
        }

        React.useEffect(() => {
            if (!open) return;
            function handleClick(event) {
                if (
                    buttonRef.current &&
                    !buttonRef.current.contains(event.target) &&
                    menuRef.current &&
                    !menuRef.current.contains(event.target)
                ) {
                    setOpen(false);
                }
            }
            document.addEventListener('mousedown', handleClick);
            return () => document.removeEventListener('mousedown', handleClick);
        }, [open]);

        const dropdownMenu = (
            <div
                ref={menuRef}
                className="z-[9999] absolute mt-1 w-40 origin-top-right bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden"
                style={{ top: menuPosition.top, left: menuPosition.left, position: 'absolute' }}
            >
                <button className="block w-full text-left text-sm font-medium text-slate-700 px-4 py-2.5 hover:bg-slate-50 transition" onClick={() => handleGo(`/products/${row._id}`)}>Edit</button>
                <button className="block w-full text-left text-sm font-medium text-red-600 px-4 py-2.5 hover:bg-red-50 transition" onClick={() => handleDeleteClick(row)}>Delete</button>
            </div>
        );

        return (
            <div className="relative inline-block text-left">
                <button
                    ref={buttonRef}
                    className="flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                    onClick={handleToggle}
                    type="button"
                >
                    <EllipsisVertical className="h-4 w-4" />
                </button>
                {open && typeof window !== 'undefined' && createPortal(dropdownMenu, document.body)}
            </div>
        );
    }

    let content = <PreLoader />

    const columns = [
        {
            name: "",
            cell: row => renderCol(row),
            width: "60px",
        },
        {
            name: 'Code',
            selector: row => row.code,
            width: "120px",
            sortable: true,
            cell: row => <span className="text-sm font-mono text-slate-500">{row.code}</span>
        },
        {
            name: 'Product Name',
            selector: row => row.productname,
            sortable: true,
            width: "280px",
            cell: row => <span className="text-sm font-semibold text-slate-700">{row.productname}</span>
        },
        {
            name: 'Category',
            selector: row => row.category_id?.name,
            width: "180px",
            sortable: true,
            cell: row => (
                <span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700">
                    {row.category_id?.name || "-"}
                </span>
            )
        },
        {
            name: 'UOM',
            selector: row => row.uom,
            sortable: true,
            width: "100px",
            cell: row => <span className="text-sm text-slate-500">{row.uom}</span>
        },
        {
            name: 'SRP',
            right: true,
            sortable: true,
            width: "130px",
            selector: row => row.price,
            cell: row => <span className="text-sm font-semibold text-slate-700">{Number(row.price || 0).toLocaleString('en', { minimumFractionDigits: 2 })}</span>
        },
        {
            name: "Member",
            right: true,
            sortable: true,
            width: "130px",
            selector: row => row.member_price,
            cell: row => <span className="text-sm text-emerald-600 font-semibold">{Number(row.member_price || 0).toLocaleString('en', { minimumFractionDigits: 2 })}</span>
        },
        {
            name: "Hub",
            right: true,
            sortable: true,
            width: "130px",
            selector: row => row.hub_price,
            cell: row => <span className="text-sm text-amber-600 font-semibold">{Number(row.hub_price || 0).toLocaleString('en', { minimumFractionDigits: 2 })}</span>
        },
         {
            name: "PV",
            right: true,
            sortable: true,
            width: "130px",
            selector: row => row.pv,
            cell: row => <span className="text-sm text-amber-600 font-semibold">{Number(row.pv || 0).toLocaleString('en', { minimumFractionDigits: 0 })}</span>
        },
        {
            name: "Package",
            center: true,
            sortable: true,     
            width: "130px",      
            selector: row => row.isProdPackage,
            cell: row => (
                <span className={
                    row.isProdPackage
                        ? "inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                        : "inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-400"
                }>
                    {row.isProdPackage ? CODETYPE[row.packageType].label : "No"}
                </span>
            )
        },
         {
            name: "Active",
            center: true,
            sortable: true,     
            width: "130px",      
            selector: row => row.isActive,
            cell: row => (
                <span className={
                    row.isActive
                        ? "inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                        : "inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-400"
                }>
                    {row.isActive ? "Yes" : "No"}
                </span>
            )
        },
        
    ];

    if (loadstate === "success") {
        content = <DataTable
            noHeader
            pagination
            columns={columns}
            data={filteredProducts}
            noDataComponent={<NoRecord />}
            customStyles={customStyles}
            highlightOnHover
            pointerOnHover
        />
    }

    return (
        <div className="mt-4 px-2">
            <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-sky-50 p-6 shadow-sm">
                <div className="absolute -right-24 -top-16 h-48 w-48 rounded-full bg-sky-100/70 blur-3xl" />
                <div className="absolute -left-24 bottom-0 h-48 w-48 rounded-full bg-amber-100/70 blur-3xl" />
                <div className="relative z-10">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Product Catalog</p>
                            <h1 className="mt-2 text-2xl font-semibold text-slate-800">Manage your products</h1>
                            <p className="mt-2 max-w-xl text-sm text-slate-500">
                                Add, edit, and organize your product catalog. Track pricing and availability across all categories.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <PrimaryBtn type="button" onClick={() => router.push("/products/add")}>Add New Product</PrimaryBtn>
                        </div>
                    </div>
                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                        <div className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50">
                                    <Package className="h-5 w-5 text-sky-600" />
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Total Products</p>
                                    <p className="mt-1 text-2xl font-semibold text-slate-800">{stats.totalProducts}</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                                    <Layers className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Categories</p>
                                    <p className="mt-1 text-2xl font-semibold text-slate-800">{stats.totalCategories}</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                                    <Package className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Packages</p>
                                    <p className="mt-1 text-2xl font-semibold text-slate-800">{stats.packageCount}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800">All Products</h2>
                        <p className="text-sm text-slate-500">Browse and manage your entire product inventory.</p>
                    </div>
                    <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                        <div className="relative w-full sm:max-w-xs">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setsearchTerm(e.target.value)}
                                placeholder="Search product or code"
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                            />
                        </div>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-100 sm:max-w-[220px]"
                        >
                            <option value="all">All categories</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="mt-4 overflow-x-auto">
                    {content}
                </div>
            </section>

            <Toaster position="top-center" reverseOrder={false} />
            <ConfirmDelete
                showConfirm={showConfirm}
                setshowConfirm={setshowConfirm}
                onYes={handleDeleteSuccess}
                selectedProduct={selectedProduct}
            />
        </div>
    )
}


const customStyles = {
    rows: {
        style: {
            fontSize: "14px",
            color: "#334155",
            paddingTop: '16px',
            paddingBottom: '16px',
            opacity: 0.92,
            '&:not(:last-of-type)': {
                borderBottomStyle: 'solid',
                borderBottomWidth: '1px',
                borderBottomColor: "#e2e8f0"
            },
            '&:hover': {
                backgroundColor: "#f8fafc"
            },
            overflow: "visible !important"
        }
    },
    headRow: {
        style: {
            borderBottomColor: "#e2e8f0"
        }
    },
    headCells: {
        style: {
            fontSize: "13px",
            fontWeight: "700",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            paddingTop: '16px',
            paddingBottom: '16px',
            backgroundColor: "#f8fafc",
            color: "#64748b"
        }
    },
    cells: {
        style: {
            padding: '0px 16px',
            backgroundColor: "#fff"
        },
    },
    pagination: {
        style: {
            backgroundColor: "#fff",
        }
    },
    noData: {
        style: {
            backgroundColor: "#fff",
            color: "#475569"
        }
    }
};