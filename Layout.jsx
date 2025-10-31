

import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useUser } from "@/components/hooks/useUser";
import {
  Home,
  Briefcase,
  FileText,
  CreditCard,
  User,
  Menu,
  X,
  Building,
  FileText as InvoiceIcon,
  Bot,
  Gift,
  AlertTriangle,
  Bell,
  Lock,
  Users,
  History, // Added History icon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const BFLO_LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6895e54df06b3b36be075b1d/de101b8e1_1761892653544-sample.jpeg";

const navigationItems = [
  { title: "Dashboard", url: createPageUrl("Dashboard"), icon: Home, tier_required: 1 },
  { title: "Jobs", url: createPageUrl("Jobs"), icon: Briefcase, tier_required: 1 },
  { title: "Quotes", url: createPageUrl("Quotes"), icon: FileText, tier_required: 2 },
  { title: "Invoices", url: createPageUrl("Invoices"), icon: InvoiceIcon, tier_required: 2 },
  { title: "Service History", url: createPageUrl("ServiceHistory"), icon: History, tier_required: 1 },
  { title: "Maintenance", url: createPageUrl("MaintenanceReminders"), icon: Bell, tier_required: 2 },
  { title: "Property Profile", url: createPageUrl("PropertyOnboarding"), icon: Building, tier_required: 1 },
  { title: "Property Insights", url: createPageUrl("PropertyInsights"), icon: Building, tier_required: 3 },
  { title: "Refer Friends", url: createPageUrl("ReferralProgram"), icon: Gift, tier_required: 2 },
  { title: "AI Quote", url: createPageUrl("AIQuote"), icon: Bot, tier_required: 3 },
  { title: "AI Help", url: createPageUrl("TroubleShooting"), icon: Bot, tier_required: 3 },
  { title: "Partners", url: createPageUrl("LocalPartnerships"), icon: Gift, tier_required: 3 },
  { title: "Emergency", url: createPageUrl("EmergencyService"), icon: AlertTriangle, urgent: true, tier_required: 1 },
  { title: "Subscription", url: createPageUrl("Subscription"), icon: CreditCard, tier_required: 1 },
  { title: "Profile", url: createPageUrl("Profile"), icon: User, tier_required: 1 },
];

const landlordOnlyItems = [
  { title: "Tenant Applications", url: createPageUrl("TenantApplications"), icon: Users, tier_required: 2 },
  { title: "Lease Templates", url: createPageUrl("LeaseTemplates"), icon: FileText, tier_required: 2 },
  { title: "Lease Agreements", url: createPageUrl("LeaseGeneration"), icon: FileText, tier_required: 2 },
  { title: "Tenant Portals", url: createPageUrl("TenantPortalManagement"), icon: Users, tier_required: 2 }
];

const tenantNavItems = [
  { title: "My Portal", url: createPageUrl("TenantPortal"), icon: Home, tier_required: 1 },
  { title: "Profile", url: createPageUrl("Profile"), icon: User, tier_required: 1 }
];

function NavLink({ item, isActive, isMobile = false, onClick, disabled }) {
  const Icon = item.icon;
  const content = (
    <Link
      to={disabled ? "#" : item.url}
      onClick={(e) => {
        if (disabled) {
          e.preventDefault();
        } else if (onClick) {
          onClick();
        }
      }}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${item.urgent 
          ? 'bg-red-600 text-white hover:bg-red-700'
          : isActive
            ? 'bg-blue-600 text-white'
            : 'text-gray-700 hover:bg-gray-100'
        }
        ${isMobile ? 'w-full' : ''}
      `}
    >
      <Icon className={`w-5 h-5 ${item.urgent ? 'animate-pulse' : ''}`} />
      <span className="font-medium">{item.title}</span>
      {disabled && (
        <Lock className="w-4 h-4 ml-auto" />
      )}
    </Link>
  );

  if (disabled) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>{content}</div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Upgrade subscription to access</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const { user } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userTier = user?.subscription_tier || 1;
  const isLandlord = user?.customer_type === 'landlord';
  const isTenant = user?.role === 'tenant';

  // Determine navigation items based on user type
  const allNavItems = isTenant ? tenantNavItems : 
                      isLandlord ? [...navigationItems, ...landlordOnlyItems] : 
                      navigationItems;

  return (
    <div className="min-h-screen bg-gray-50">
      <style>
        {`
          :root {
            --primary: #2563eb;
            --primary-dark: #1d4ed8;
            --secondary: #f59e0b;
          }
        `}
      </style>

      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to={createPageUrl(isTenant ? "TenantPortal" : "Dashboard")} className="flex items-center gap-3">
              <img src={BFLO_LOGO_URL} alt="BFLO Contracting" className="h-10 w-10 rounded-lg object-cover" />
              <div>
                <div className="font-bold text-xl text-gray-900">BFLO Contracting</div>
                <div className="text-xs text-gray-500">{isTenant ? 'Tenant Portal' : 'Property Care Platform'}</div>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              {user && (
                <div className="hidden lg:flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                    <Badge variant="secondary" className="text-xs">
                      {isTenant ? 'Tenant' : isLandlord ? 'Landlord' : 'Homeowner'} {!isTenant && `• Tier ${userTier}`}
                    </Badge>
                  </div>
                </div>
              )}
              
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {!isTenant && (
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm p-4 sticky top-24 space-y-2">
                {allNavItems.map((item) => {
                  const isActive = location.pathname === item.url;
                  const disabled = item.tier_required > userTier;
                  return (
                    <NavLink
                      key={item.url}
                      item={item}
                      isActive={isActive}
                      disabled={disabled}
                    />
                  );
                })}
              </div>
            </aside>
          )}

          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)}>
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl p-4 space-y-2 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {user && (
              <div className="mb-6 pb-4 border-b">
                <div className="font-semibold text-gray-900">{user.full_name}</div>
                <Badge variant="secondary" className="text-xs mt-2">
                  {isTenant ? 'Tenant' : isLandlord ? 'Landlord' : 'Homeowner'} {!isTenant && `• Tier ${userTier}`}
                </Badge>
              </div>
            )}
            
            {allNavItems.map((item) => {
              const isActive = location.pathname === item.url;
              const disabled = !isTenant && item.tier_required > userTier;
              return (
                <NavLink
                  key={item.url}
                  item={item}
                  isActive={isActive}
                  isMobile={true}
                  disabled={disabled}
                  onClick={() => setMobileMenuOpen(false)}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

