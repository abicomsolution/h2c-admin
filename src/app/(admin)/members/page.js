"use client"
import DataTable from 'react-data-table-component';
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import callApi from '@/utils/api-caller';
import PreLoader from '@/components/preloader';
import moment from 'moment';
import NoRecord from '@/components/NoRecord';
import { createPortal } from 'react-dom';
import ConfirmHub from '../members/confirmHub';
import toast, { Toaster } from 'react-hot-toast';
import { HUBTYPE } from '@/utils/constants';
import ConfirmUpgrade from './confirmUpgrade';
import { EllipsisVertical, Users, Crown, Package } from 'lucide-react';


export default function Members(props) {

    const session = useSession()
    const [initialized, setinitialized] = useState(false)

    const router = useRouter();
    const [members, setMembers] = useState([]);
    const [loadstate, setloadstate] = useState("")
    const [search, setsearch] = useState("")
    const [showPromoteHub, setshowPromoteHub] = useState(false)
    const [selectedMember, setselectedMember] = useState(null)
    const [showConfirmUpgrade, setShowConfirmUpgrade] = useState(false)

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
            const ret = await callApi("/member")
            if (ret.status == 200) {
                setMembers(ret.data)
                setloadstate("success")
            } else {
                setloadstate("")
            }
        } catch (err) {
            console.log(err)
            setloadstate("")
        }
    }

    const searchNow = async (searchTerm) => {
        setloadstate("loading")
        try {
            const ret = await callApi("/member/search", "POST", { search: searchTerm })
            if (ret.status == 200) {
                setMembers(ret.data)
                setloadstate("success")
            } else {
                setloadstate("")
            }
        } catch (err) {
            console.log(err)
            setloadstate("")
        }
    }

    const handleChange = (e) => {
        setsearch(e.target.value)
    }

    const handleConfirmHub = () => {
        setshowPromoteHub(false)
        toast.success('Member successfully promoted to Hub!')
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    }

    const handleConfirmUpgrade = () => {
        setShowConfirmUpgrade(false)
        toast.success('Member successfully upgraded to Paid!')
        searchNow(search)
    }

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (search.length === 0) {
                init()
            } else {
                searchNow(search)
            }
        }, 500)
        return () => clearTimeout(delayDebounceFn)
    }, [search])

    const handleEditProfile = (member) => {
        router.push("/profile?id=" + member._id);
    };

    const stats = useMemo(() => {
        const total = members.length
        const hubs = members.filter(m => m.isHub).length
        const cd = members.filter(m => m.isCd).length
        return { total, hubs, cd }
    }, [members])

    const renderActions = (row) => {
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

        React.useEffect(() => {
            if (!open) return;
            function handleClick(event) {
                if (
                    buttonRef.current && !buttonRef.current.contains(event.target) &&
                    menuRef.current && !menuRef.current.contains(event.target)
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
                className="z-[9999] absolute mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden"
                style={{ top: menuPosition.top, left: menuPosition.left, position: 'absolute' }}
            >
                <button className="block w-full text-left text-sm font-medium text-slate-700 px-4 py-2.5 hover:bg-slate-50 transition" onClick={() => { handleEditProfile(row); setOpen(false); }}>Edit Profile</button>
                <button className="block w-full text-left text-sm font-medium text-amber-600 px-4 py-2.5 hover:bg-amber-50 transition" onClick={() => { setselectedMember(row); setshowPromoteHub(true); setOpen(false); }}>Promote to Hub</button>
                {row.isCd && !row.cdPaid && (
                    <button className="block w-full text-left text-sm font-medium text-emerald-600 px-4 py-2.5 hover:bg-emerald-50 transition" onClick={() => { setselectedMember(row); setShowConfirmUpgrade(true); setOpen(false); }}>Upgrade to Paid</button>
                )}
            </div>
        );

        return (
            <div className="relative inline-block text-left">
                <button ref={buttonRef} className="flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition" onClick={handleToggle} type="button">
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
            cell: row => renderActions(row),
            width: "60px",
        },
        {
            name: "Member",
            sortable: true,
            selector: row => row.fullname,
            width: "250px",
            cell: row => (
                <div className="py-1">
                    <p className="text-sm font-semibold text-slate-700 leading-tight">{row.fullname}</p>
                    <p className="text-xs text-slate-400">@{row.username}</p>
                </div>
            )
        },
        {
            name: "Contact",
            width: "220px",
            cell: row => (
                <div className="py-1">
                    <p className="text-xs text-slate-600 truncate">{row.emailadd || "-"}</p>
                    <p className="text-xs text-slate-400">{row.mobile1 || "-"}</p>
                </div>
            )
        },
        {
            name: "Sponsor",
            sortable: true,
            width: "160px",
            selector: row => row.sponsorid?.username,
            cell: row => <span className="text-sm text-slate-500">{row.sponsorid?.username || "-"}</span>
        },
        {
            name: "Joined",
            sortable: true,
            width: "140px",
            selector: row => row.date_signup,
            cell: row => <span className="text-xs text-slate-500">{moment(row.date_signup).format("MMM DD, YYYY")}</span>
        },
        {
            name: "Activated",
            sortable: true,
            width: "140px",
            selector: row => row.date_time_activated,
            cell: row => <span className="text-xs text-slate-500">{row.date_time_activated ? moment(row.date_time_activated).format("MMM DD, YYYY") : "-"}</span>
        },
        {
            name: "Status",
            width: "180px",
            cell: row => (
                <div className="flex flex-wrap gap-1">
                    {row.isHub && (
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                            {HUBTYPE[row.hubtype] || 'Hub'}
                        </span>
                    )}
                    {row.isCd && (
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${row.cdPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                            {row.cdPaid ? 'CD Paid' : 'CD Unpaid'}
                        </span>
                    )}
                    {!row.isHub && !row.isCd && (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-400">Member</span>
                    )}
                </div>
            )
        },
    ];

    if (loadstate === "success") {
        content = <DataTable
            noHeader
            pagination
            columns={columns}
            data={members}
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
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Member Directory</p>
                            <h1 className="mt-2 text-2xl font-semibold text-slate-800">Manage Members</h1>
                            <p className="mt-2 max-w-xl text-sm text-slate-500">
                                View, search, and manage all community members. Promote to hub or upgrade accounts.
                            </p>
                        </div>
                    </div>
                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                        <div className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50">
                                    <Users className="h-5 w-5 text-sky-600" />
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Total Members</p>
                                    <p className="mt-1 text-2xl font-semibold text-slate-800">{stats.total}</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                                    <Crown className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Hubs</p>
                                    <p className="mt-1 text-2xl font-semibold text-slate-800">{stats.hubs}</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                                    <Package className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Commission Deduction</p>
                                    <p className="mt-1 text-2xl font-semibold text-slate-800">{stats.cd}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800">All Members</h2>
                        <p className="text-sm text-slate-500">Search and manage member accounts.</p>
                    </div>
                    <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                        <div className="relative w-full sm:max-w-xs">
                            <input
                                type="text"
                                value={search}
                                onChange={handleChange}
                                placeholder="Search username, email, or name"
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                            />
                        </div>
                    </div>
                </div>
                <div className="mt-4 overflow-x-auto">
                    {content}
                </div>
            </section>

            <ConfirmHub showConfirm={showPromoteHub} setshowConfirm={setshowPromoteHub} onYes={handleConfirmHub} selectedMember={selectedMember} />
            <ConfirmUpgrade showConfirm={showConfirmUpgrade} setshowConfirm={setShowConfirmUpgrade} onYes={handleConfirmUpgrade} selectedMember={selectedMember} />
            <Toaster position="top-center" reverseOrder={false} />
        </div>
    )
}


const customStyles = {
    rows: {
        style: {
            fontSize: "14px",
            color: "#334155",
            paddingTop: '12px',
            paddingBottom: '12px',
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
            paddingTop: '14px',
            paddingBottom: '14px',
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
        },
    },
    noData: {
        style: {
            backgroundColor: "#fff",
            color: "#475569"
        }
    }
};