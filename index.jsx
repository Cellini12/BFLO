import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Jobs from "./Jobs";

import Home from "./Home";

import Profile from "./Profile";

import AIQuote from "./AIQuote";

import Quotes from "./Quotes";

import Subscription from "./Subscription";

import Invoices from "./Invoices";

import TechnicianTracking from "./TechnicianTracking";

import TroubleShooting from "./TroubleShooting";

import ReferralProgram from "./ReferralProgram";

import MaintenanceReminders from "./MaintenanceReminders";

import JobChat from "./JobChat";

import LocalPartnerships from "./LocalPartnerships";

import EmergencyService from "./EmergencyService";

import SupportTickets from "./SupportTickets";

import GuestServiceTracker from "./GuestServiceTracker";

import PropertyInsights from "./PropertyInsights";

import TenantOnboarding from "./TenantOnboarding";

import TenantApplications from "./TenantApplications";

import LeaseTemplates from "./LeaseTemplates";

import LeaseGeneration from "./LeaseGeneration";

import TenantPortal from "./TenantPortal";

import TenantPortalManagement from "./TenantPortalManagement";

import PropertyOnboarding from "./PropertyOnboarding";

import ServiceHistory from "./ServiceHistory";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Jobs: Jobs,
    
    Home: Home,
    
    Profile: Profile,
    
    AIQuote: AIQuote,
    
    Quotes: Quotes,
    
    Subscription: Subscription,
    
    Invoices: Invoices,
    
    TechnicianTracking: TechnicianTracking,
    
    TroubleShooting: TroubleShooting,
    
    ReferralProgram: ReferralProgram,
    
    MaintenanceReminders: MaintenanceReminders,
    
    JobChat: JobChat,
    
    LocalPartnerships: LocalPartnerships,
    
    EmergencyService: EmergencyService,
    
    SupportTickets: SupportTickets,
    
    GuestServiceTracker: GuestServiceTracker,
    
    PropertyInsights: PropertyInsights,
    
    TenantOnboarding: TenantOnboarding,
    
    TenantApplications: TenantApplications,
    
    LeaseTemplates: LeaseTemplates,
    
    LeaseGeneration: LeaseGeneration,
    
    TenantPortal: TenantPortal,
    
    TenantPortalManagement: TenantPortalManagement,
    
    PropertyOnboarding: PropertyOnboarding,
    
    ServiceHistory: ServiceHistory,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Jobs" element={<Jobs />} />
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/AIQuote" element={<AIQuote />} />
                
                <Route path="/Quotes" element={<Quotes />} />
                
                <Route path="/Subscription" element={<Subscription />} />
                
                <Route path="/Invoices" element={<Invoices />} />
                
                <Route path="/TechnicianTracking" element={<TechnicianTracking />} />
                
                <Route path="/TroubleShooting" element={<TroubleShooting />} />
                
                <Route path="/ReferralProgram" element={<ReferralProgram />} />
                
                <Route path="/MaintenanceReminders" element={<MaintenanceReminders />} />
                
                <Route path="/JobChat" element={<JobChat />} />
                
                <Route path="/LocalPartnerships" element={<LocalPartnerships />} />
                
                <Route path="/EmergencyService" element={<EmergencyService />} />
                
                <Route path="/SupportTickets" element={<SupportTickets />} />
                
                <Route path="/GuestServiceTracker" element={<GuestServiceTracker />} />
                
                <Route path="/PropertyInsights" element={<PropertyInsights />} />
                
                <Route path="/TenantOnboarding" element={<TenantOnboarding />} />
                
                <Route path="/TenantApplications" element={<TenantApplications />} />
                
                <Route path="/LeaseTemplates" element={<LeaseTemplates />} />
                
                <Route path="/LeaseGeneration" element={<LeaseGeneration />} />
                
                <Route path="/TenantPortal" element={<TenantPortal />} />
                
                <Route path="/TenantPortalManagement" element={<TenantPortalManagement />} />
                
                <Route path="/PropertyOnboarding" element={<PropertyOnboarding />} />
                
                <Route path="/ServiceHistory" element={<ServiceHistory />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}