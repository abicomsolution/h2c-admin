"use client"
import DataTable from 'react-data-table-component';
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import callApi from '@/utils/api-caller';
import PreLoader from '@/components/preloader';
import moment from 'moment';
import NoRecord from '@/components/NoRecord';
import PrimaryBtn from "@/components/primaryBtn";
import { createPortal } from 'react-dom';
import toast, { Toaster } from 'react-hot-toast';
import { pad } from '@/utils/functions';
import ConfirmDelete from './confirm';
import { ShoppingCart, ClipboardCheck, Clock, EllipsisVertical } from 'lucide-react';

export default function Orders(props) {

    const session = useSession()
    const [initialized, setinitialized] = useState(false)

    const router = useRouter();
    const [orders, setorders] = useState([]);
    const [loadstate, setloadstate] = useState("")
    const [searchTerm, setsearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [showConfirm, setshowConfirm] = useState(false)
    const [selectedOrder, setselectedOrder] = useState(null)

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
        try {
            const ret = await callApi("/order")
            if (ret.status == 200) {
                setorders(ret.data)
                setloadstate("success")
            } else {
                setloadstate("")
            }
        } catch (err) {
            console.log(err)
            setloadstate("")
        }
    }

    const handleDelete = async () => {
        setshowConfirm(false)
        toast.success("Order deleted successfully!")
        init()
    }

    const stats = useMemo(() => {
        const total = orders.length
        const open = orders.filter(o => o.status == 0).length
        const posted = orders.filter(o => o.status == 1).length
        const totalAmount = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0)
        return { total, open, posted, totalAmount }
    }, [orders])

    const filteredOrders = useMemo(() => {
        const normalized = searchTerm.trim().toLowerCase()
        return orders.filter(o => {
            const matchesSearch =
                normalized === "" ||
                pad(o.order_num, 6)?.toLowerCase().includes(normalized) ||
                o.member_id?.username?.toLowerCase().includes(normalized) ||
                o.member_id?.fullname?.toLowerCase().includes(normalized)

            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "open" && o.status == 0) ||
                (statusFilter === "posted" && o.status == 1)

            return matchesSearch && matchesStatus
        })
    }, [orders, searchTerm, statusFilter])

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
            setselectedOrder(row);
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
                <button className="block w-full text-left text-sm font-medium text-slate-700 px-4 py-2.5 hover:bg-slate-50 transition" onClick={() => handleGo(`/orders/${row._id}`)}>{row.status == 0 ? "Edit" : "View"}</button>
                {row.status == 0 && (
                    <button className="block w-full text-left text-sm font-medium text-red-600 px-4 py-2.5 hover:bg-red-50 transition" onClick={() => handleDeleteClick(row)}>Delete</button>
                )}
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
            name: 'Order #',
            selector: row => pad(row.order_num, 6),
            sortable: true,
            width: "120px",
            cell: row => <span className="text-sm font-mono font-semibold text-slate-600">{pad(row.order_num, 6)}</span>
        },
        {
            name: "Date",
            selector: row => row.transdate,
            sortable: true,
            width: "140px",
            cell: row => <span className="text-sm text-slate-500">{moment(row.transdate).format("MMM DD, YYYY")}</span>
        },
        {
            name: 'Member',
            selector: row => row.member_id?.fullname,
            sortable: true,
            width: "260px",
            cell: row => (
                <div className="py-1">
                    <p className="text-sm font-semibold text-slate-700 leading-tight">{row.member_id?.fullname}</p>
                    <p className="text-xs text-slate-400">@{row.member_id?.username}</p>
                </div>
            )
        },
        {
            name: 'Sub Total',
            right: true,
            sortable: true,
            width: "140px",
            selector: row => row.subtotal,
            cell: row => <span className="text-sm text-slate-500">{Number(row.subtotal || 0).toLocaleString('en', { minimumFractionDigits: 2 })}</span>
        },
        {
            name: 'Total',
            right: true,
            sortable: true,
            width: "140px",
            selector: row => row.total_amount,
            cell: row => <span className="text-sm font-semibold text-slate-700">{Number(row.total_amount || 0).toLocaleString('en', { minimumFractionDigits: 2 })}</span>
        },
        {
            name: 'Status',
            center: true,
            sortable: true,
            width: "120px",
            selector: row => row.status,
            cell: row => (
                <span className={
                    row.status == 1
                        ? "inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                        : "inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700"
                }>
                    {row.status == 1 ? "Posted" : "Open"}
                </span>
            )
        },
    ];

    if (loadstate === "success") {
        content = <DataTable
            noHeader
            pagination
            columns={columns}
            data={filteredOrders}
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
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Order Management</p>
                            <h1 className="mt-2 text-2xl font-semibold text-slate-800">Manage your orders</h1>
                            <p className="mt-2 max-w-xl text-sm text-slate-500">
                                Track, review, and manage all customer orders. Monitor order status and totals at a glance.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <PrimaryBtn type="button" onClick={() => router.push("/orders/add")}>Add New Order</PrimaryBtn>
                        </div>
                    </div>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50">
                                    <ShoppingCart className="h-5 w-5 text-sky-600" />
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Total Orders</p>
                                    <p className="mt-1 text-2xl font-semibold text-slate-800">{stats.total}</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                                    <Clock className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Open</p>
                                    <p className="mt-1 text-2xl font-semibold text-slate-800">{stats.open}</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                                    <ClipboardCheck className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Posted</p>
                                    <p className="mt-1 text-2xl font-semibold text-slate-800">{stats.posted}</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50">
                                    <ShoppingCart className="h-5 w-5 text-violet-600" />
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Total Amount</p>
                                    <p className="mt-1 text-xl font-semibold text-slate-800">{stats.totalAmount.toLocaleString('en', { minimumFractionDigits: 2 })}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800">All Orders</h2>
                        <p className="text-sm text-slate-500">Browse and manage all customer orders.</p>
                    </div>
                    <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                        <div className="relative w-full sm:max-w-xs">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setsearchTerm(e.target.value)}
                                placeholder="Search order # or member"
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-100 sm:max-w-[180px]"
                        >
                            <option value="all">All statuses</option>
                            <option value="open">Open</option>
                            <option value="posted">Posted</option>
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
                onYes={handleDelete}
                selectedOrder={selectedOrder}
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