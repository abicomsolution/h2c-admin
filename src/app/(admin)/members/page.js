"use client"
import React, { useEffect, useState} from 'react';
import { Search, MoreVertical, Edit, Crown, CheckCircle, Mail, Phone, Calendar, Users } from 'lucide-react';
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

// Member Card Component
function MemberCard({ member, onEditProfile, onPromoteHub, onUpgradePaid, getAvatarColor, getInitials }) {
    const [open, setOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    const buttonRef = React.useRef(null);
    const menuRef = React.useRef(null);

    const handleToggle = () => {
        if (!open && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setMenuPosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
        }
        setOpen((prev) => !prev);
    };

    useEffect(() => {
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

    const menuItems = [
        { label: 'Edit Profile', icon: Edit, color: 'text-blue-600', action: () => { onEditProfile(member); setOpen(false); } },
        { label: 'Promote to Hub', icon: Crown, color: 'text-amber-600', action: () => { onPromoteHub(member); setOpen(false); } },
        ...(member.isCd && !member.cdPaid ? [{ label: 'Upgrade to Paid', icon: CheckCircle, color: 'text-green-600', action: () => { onUpgradePaid(member); setOpen(false); } }] : []),
    ];

    const dropdownMenu = (
        <div
            ref={menuRef}
            className="z-[9999] absolute mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden"
            style={{ top: menuPosition.top, left: menuPosition.left, position: 'absolute' }}
        >
            {menuItems.map((item, idx) => (
                <button 
                    key={idx}
                    className={`block w-full text-left ${item.color} font-medium px-4 py-3 hover:bg-gray-50 transition flex items-center gap-3 border-b border-gray-100 last:border-b-0`}
                    onClick={item.action}
                >
                    <item.icon size={18} />
                    {item.label}
                </button>
            ))}
        </div>
    );

    return (
        <div className="bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow duration-300">
            <div className="p-5 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                {/* Member Info */}
                <div className="flex gap-4 items-start flex-1">
                    {/* Avatar */}
                    <div className={`${getAvatarColor(member.username)} w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
                        {getInitials(member.fullname)}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                            <h3 className="font-bold text-lg text-gray-900">{member.fullname}</h3>
                            {member.isHub && (
                                <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-semibold">
                                    {HUBTYPE[member.hubtype] || 'Hub'}
                                </span>
                            )}
                            {member.isCd && (
                                <span className={`${member.cdPaid ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'} px-3 py-1 rounded-full text-xs font-semibold`}>
                                    {member.cdPaid ? 'CD (Paid)' : 'CD (Unpaid)'}
                                </span>
                            )}
                        </div>

                        <p className="text-sm text-gray-600 mt-1">@{member.username}</p>

                        {/* Contact Info */}
                        <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                            {member.emailadd && (
                                <div className="flex items-center gap-2">
                                    <Mail size={16} className="text-gray-400" />
                                    <span className="truncate">{member.emailadd}</span>
                                </div>
                            )}
                            {member.mobile1 && (
                                <div className="flex items-center gap-2">
                                    <Phone size={16} className="text-gray-400" />
                                    <span>{member.mobile1}</span>
                                </div>
                            )}
                        </div>

                        {/* Dates & Sponsor */}
                        <div className="flex flex-wrap gap-6 mt-3 text-xs text-gray-600">
                            <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-gray-400" />
                                <span>Joined: {moment(member.date_signup).format("MMM DD, YYYY")}</span>
                            </div>
                            {member.date_time_activated && (
                                <div className="flex items-center gap-2">
                                    <CheckCircle size={14} className="text-gray-400" />
                                    <span>Active: {moment(member.date_time_activated).format("MMM DD, YYYY")}</span>
                                </div>
                            )}
                            {member.sponsorid && (
                                <div className="flex items-center gap-2">
                                    <Users size={14} className="text-gray-400" />
                                    <span>Sponsor: {member.sponsorid.username}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="self-end md:self-center">
                    <div className="relative inline-block">
                        <button
                            ref={buttonRef}
                            className="hover:bg-gray-100 p-2 rounded-lg transition"
                            onClick={handleToggle}
                            type="button"
                        >
                            <MoreVertical size={20} className="text-gray-600" />
                        </button>
                        {open && typeof window !== 'undefined' && createPortal(dropdownMenu, document.body)}
                    </div>
                </div>
            </div>
        </div>
    );
}

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
        }else if (session.status=="authenticated"){                 
            setinitialized(true)                
        }
    
    }, [session])


    useEffect(() => {
        
        if (initialized){        
            init()   
        }
        
    }, [initialized])


    const init = async ()=>{
        setloadstate("loading")     
        try{                 
            const ret =  await callApi("/member") 
            if (ret.status==200){                
                setMembers(ret.data)
                setloadstate("success")
            }else{              
                setloadstate("")
            }

        }catch(err){
            console.log(err)
            setloadstate("")
        }
        
    }


    const searchNow = async (searchTerm)=>{
        setloadstate("loading")     
        try{                 
            const ret =  await callApi("/member/search", "POST", {search: searchTerm}) 
            if (ret.status==200){                
                setMembers(ret.data)
                setloadstate("success")
            }else{              
                setloadstate("")
            }

        }catch(err){
            console.log(err)
            setloadstate("")
        }
        
    }

    const handleChange = (e)=>{
        setsearch(e.target.value)
    }

    
    const handleConfirmHub = ()=>{
        setshowPromoteHub(false)
        toast.success('Member successfully promoted to Hub!')
        setTimeout(() => {
            window.location.reload();    
        }, 2000);
        
    }

    const handleConfirmUpgrade = ()=>{
        setShowConfirmUpgrade(false)
        toast.success('Member successfully upgraded to Paid!')
        searchNow(search)
    }

    useEffect(()=>{
        const delayDebounceFn = setTimeout(() => {
            // Send Axios request here
            if (search.length===0) {
                init()
            }else{
            searchNow(search)            
            }                
        }, 500)

        return () => clearTimeout(delayDebounceFn)

    }, [search])


    let content = <PreLoader />;

    const getInitials = (fullname) => {
        return fullname
            ?.split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'U';
    };

    const getAvatarColor = (username) => {
        const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-green-500', 'bg-orange-500', 'bg-red-500', 'bg-cyan-500'];
        const index = username.charCodeAt(0) % colors.length;
        return colors[index];
    };

    const handleEditProfile = (member) => {
        router.push("/profile?id=" + member._id);
    };

    if (loadstate === "success") {
        content = (
            <div className="space-y-4">
                {members.length === 0 ? (
                    <NoRecord />
                ) : (
                    members.map((member, idx) => (
                        <MemberCard
                            key={idx}
                            member={member}
                            onEditProfile={handleEditProfile}
                            onPromoteHub={(m) => {
                                setselectedMember(m);
                                setshowPromoteHub(true);
                            }}
                            onUpgradePaid={(m) => {
                                setselectedMember(m);
                                setShowConfirmUpgrade(true);
                            }}
                            getAvatarColor={getAvatarColor}
                            getInitials={getInitials}
                        />
                    ))
                )}
            </div>
        );
    }

    
    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-3 sm:px-6 py-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Members</h1>
                    <p className="text-gray-600">Manage and view all community members</p>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative max-w-xl">
                        <input
                            className="w-full border border-gray-300 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                            placeholder="Search by username, email, or name..."
                            id="search"
                            name="search"
                            value={search}
                            type="text"
                            onChange={handleChange}
                        />
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    </div>
                </div>

                {/* Results Info */}
                {loadstate === "success" && (
                    <div className="mb-4 text-sm text-gray-600">
                        Showing <span className="font-semibold text-gray-900">{members.length}</span> member{members.length !== 1 ? 's' : ''}
                    </div>
                )}

                {/* Content */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6">
                        {content}
                    </div>
                </div>
            </div>

            <ConfirmHub showConfirm={showPromoteHub} setshowConfirm={setshowPromoteHub} onYes={handleConfirmHub} selectedMember={selectedMember} />
            <ConfirmUpgrade showConfirm={showConfirmUpgrade} setshowConfirm={setShowConfirmUpgrade} onYes={handleConfirmUpgrade} selectedMember={selectedMember} />
            <Toaster position="top-center" reverseOrder={false} />
        </div>
    )
}