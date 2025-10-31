import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useUser } from "@/components/hooks/useUser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Send,
  Download,
  Eye,
  CheckCircle,
  Loader2,
  AlertTriangle,
  FileSignature
} from "lucide-react";
import { format, addMonths } from "date-fns";

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  sent_for_signature: "bg-blue-100 text-blue-800",
  signed_by_tenant: "bg-yellow-100 text-yellow-800",
  signed_by_landlord: "bg-purple-100 text-purple-800",
  fully_executed: "bg-green-100 text-green-800",
  voided: "bg-red-100 text-red-800"
};

export default function LeaseGeneration() {
  const { user, isLoading: isUserLoading } = useUser();
  const [leases, setLeases] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedLease, setSelectedLease] = useState(null);
  const [showGenerator, setShowGenerator] = useState(false);
  const [formData, setFormData] = useState({
    template_id: "",
    tenant_application_id: "",
    monthly_rent: "",
    security_deposit: "",
    lease_start_date: "",
    lease_term_months: 12
  });

  useEffect(() => {
    if (user && user.customer_type === 'landlord') {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [userLeases, userTemplates, userApplications] = await Promise.all([
        base44.entities.LeaseDocument.filter({ landlord_id: user.id }, "-created_date", 100),
        base44.entities.LeaseTemplate.filter({ landlord_id: user.id }, "-created_date", 50),
        base44.entities.TenantApplication.filter({ landlord_id: user.id, status: "approved" }, "-created_date", 50)
      ]);
      
      setLeases(userLeases);
      setTemplates(userTemplates);
      setApplications(userApplications);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplicationSelect = (appId) => {
    const app = applications.find(a => a.id === appId);
    if (app) {
      setFormData(prev => ({
        ...prev,
        tenant_application_id: appId,
        monthly_rent: app.monthly_rent || "",
        security_deposit: app.monthly_rent ? app.monthly_rent * 1.5 : "",
        lease_start_date: app.lease_start_date || "",
        lease_term_months: app.lease_term_months || 12
      }));
    }
  };

  const fillPlaceholders = (content, data) => {
    let filled = content;
    const replacements = {
      '{{tenant_name}}': data.tenant_name,
      '{{tenant_email}}': data.tenant_email,
      '{{tenant_phone}}': data.tenant_phone,
      '{{property_address}}': data.property_address,
      '{{monthly_rent}}': data.monthly_rent,
      '{{security_deposit}}': data.security_deposit,
      '{{lease_start_date}}': format(new Date(data.lease_start_date), 'MMMM d, yyyy'),
      '{{lease_end_date}}': format(addMonths(new Date(data.lease_start_date), data.lease_term_months), 'MMMM d, yyyy'),
      '{{lease_term_months}}': data.lease_term_months,
      '{{landlord_name}}': user.full_name,
      '{{landlord_email}}': user.email,
      '{{landlord_phone}}': user.phone || 'N/A',
      '{{landlord_address}}': user.address || 'N/A',
      '{{payment_method}}': data.payment_method || 'bank transfer',
      '{{pet_policy}}': data.pets ? `Pets allowed: ${data.pet_details}` : 'No pets allowed',
      '{{additional_occupants}}': 'as listed in application',
      '{{notice_period}}': '30',
      '{{state}}': 'New York'
    };

    Object.entries(replacements).forEach(([placeholder, value]) => {
      filled = filled.replace(new RegExp(placeholder, 'g'), value);
    });

    return filled;
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const template = templates.find(t => t.id === formData.template_id);
      const application = applications.find(a => a.id === formData.tenant_application_id);

      if (!template || !application) {
        alert("Please select both a template and an application");
        return;
      }

      const leaseData = {
        landlord_id: user.id,
        tenant_application_id: application.id,
        template_id: template.id,
        tenant_name: application.tenant_full_name,
        tenant_email: application.tenant_email,
        property_address: application.property_address,
        monthly_rent: parseFloat(formData.monthly_rent),
        security_deposit: parseFloat(formData.security_deposit),
        lease_start_date: formData.lease_start_date,
        lease_end_date: format(addMonths(new Date(formData.lease_start_date), formData.lease_term_months), 'yyyy-MM-dd'),
        lease_term_months: formData.lease_term_months,
        status: "draft"
      };

      const filledContent = fillPlaceholders(template.content, {
        ...leaseData,
        tenant_phone: application.tenant_phone,
        payment_method: application.payment_method,
        pets: application.pets,
        pet_details: application.pet_details
      });

      leaseData.generated_content = filledContent;

      const newLease = await base44.entities.LeaseDocument.create(leaseData);
      
      await loadData();
      setShowGenerator(false);
      setSelectedLease(newLease);
      
      setFormData({
        template_id: "",
        tenant_application_id: "",
        monthly_rent: "",
        security_deposit: "",
        lease_start_date: "",
        lease_term_months: 12
      });
    } catch (error) {
      console.error("Error generating lease:", error);
      alert("Error generating lease. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendForSignature = async (leaseId) => {
    try {
      await base44.entities.LeaseDocument.update(leaseId, {
        status: "sent_for_signature",
        sent_date: new Date().toISOString()
      });
      
      const lease = leases.find(l => l.id === leaseId);
      await base44.integrations.Core.SendEmail({
        to: lease.tenant_email,
        subject: `Lease Agreement Ready for Signature - ${lease.property_address}`,
        body: `Dear ${lease.tenant_name},\n\nYour lease agreement for ${lease.property_address} is ready for your signature.\n\nPlease review and sign the document at your earliest convenience.\n\nBest regards,\n${user.full_name}\nBFLO Contracting`
      });
      
      await loadData();
      alert("Lease sent to tenant for signature!");
    } catch (error) {
      console.error("Error sending lease:", error);
    }
  };

  if (isUserLoading || isLoading) {
    return (
      <div className="p-8 bg-gray-100 min-h-screen">
        <div className="animate-pulse space-y-4 max-w-7xl mx-auto">
          <div className="h-10 w-1/3 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!user || user.customer_type !== 'landlord') {
    return (
      <div className="p-8 bg-gray-100 min-h-screen">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This page is only accessible to landlords.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (showGenerator) {
    return (
      <div className="p-4 lg:p-8 bg-gray-100 min-h-screen">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Generate Lease Agreement</h1>
              <p className="text-gray-600">Select a template and tenant to generate a lease</p>
            </div>
            <Button variant="outline" onClick={() => setShowGenerator(false)}>
              Cancel
            </Button>
          </div>

          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-6 space-y-6">
              <div>
                <Label htmlFor="template_id">Lease Template *</Label>
                <Select value={formData.template_id} onValueChange={(value) => setFormData({...formData, template_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map(t => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.template_name} {t.is_default && '(Default)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tenant_application_id">Approved Tenant Application *</Label>
                <Select 
                  value={formData.tenant_application_id} 
                  onValueChange={handleApplicationSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an approved application" />
                  </SelectTrigger>
                  <SelectContent>
                    {applications.map(app => (
                      <SelectItem key={app.id} value={app.id}>
                        {app.tenant_full_name} - {app.property_address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.tenant_application_id && (
                <>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="monthly_rent">Monthly Rent *</Label>
                      <Input
                        id="monthly_rent"
                        type="number"
                        value={formData.monthly_rent}
                        onChange={(e) => setFormData({...formData, monthly_rent: e.target.value})}
                        placeholder="2000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="security_deposit">Security Deposit *</Label>
                      <Input
                        id="security_deposit"
                        type="number"
                        value={formData.security_deposit}
                        onChange={(e) => setFormData({...formData, security_deposit: e.target.value})}
                        placeholder="3000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lease_start_date">Lease Start Date *</Label>
                      <Input
                        id="lease_start_date"
                        type="date"
                        value={formData.lease_start_date}
                        onChange={(e) => setFormData({...formData, lease_start_date: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lease_term_months">Lease Term (Months) *</Label>
                      <Input
                        id="lease_term_months"
                        type="number"
                        value={formData.lease_term_months}
                        onChange={(e) => setFormData({...formData, lease_term_months: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>

                  <Alert className="bg-blue-50 border-blue-200">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      Lease end date will be automatically calculated as: {formData.lease_start_date && format(addMonths(new Date(formData.lease_start_date), formData.lease_term_months), 'MMMM d, yyyy')}
                    </AlertDescription>
                  </Alert>
                </>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowGenerator(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleGenerate} 
                  disabled={isGenerating || !formData.template_id || !formData.tenant_application_id}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Lease
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (selectedLease) {
    return (
      <div className="p-4 lg:p-8 bg-gray-100 min-h-screen">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Lease Agreement</h1>
              <p className="text-gray-600">{selectedLease.property_address}</p>
            </div>
            <Button variant="outline" onClick={() => setSelectedLease(null)}>
              Back to List
            </Button>
          </div>

          <Card className="bg-white border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{selectedLease.tenant_name}</CardTitle>
                  <p className="text-gray-600 mt-1">{selectedLease.property_address}</p>
                </div>
                <Badge className={statusColors[selectedLease.status]}>
                  {selectedLease.status.replace(/_/g, ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Monthly Rent:</span>
                  <p className="text-gray-900 text-lg font-semibold">${selectedLease.monthly_rent}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Security Deposit:</span>
                  <p className="text-gray-900 text-lg font-semibold">${selectedLease.security_deposit}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Lease Term:</span>
                  <p className="text-gray-900">{selectedLease.lease_term_months} months</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Start Date:</span>
                  <p className="text-gray-900">{format(new Date(selectedLease.lease_start_date), 'MMM d, yyyy')}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">End Date:</span>
                  <p className="text-gray-900">{format(new Date(selectedLease.lease_end_date), 'MMM d, yyyy')}</p>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Lease Document</h3>
                <div className="bg-gray-50 p-6 rounded-lg max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
                    {selectedLease.generated_content}
                  </pre>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                {selectedLease.status === 'draft' && (
                  <Button 
                    onClick={() => handleSendForSignature(selectedLease.id)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send for Signature
                  </Button>
                )}
                {selectedLease.status === 'fully_executed' && (
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lease Agreements</h1>
            <p className="text-gray-600">Generate and manage lease documents for your tenants</p>
          </div>
          <Button onClick={() => setShowGenerator(true)} className="bg-blue-600 hover:bg-blue-700">
            <FileText className="w-5 h-5 mr-2" />
            Generate New Lease
          </Button>
        </div>

        {leases.length === 0 ? (
          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <FileSignature className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Leases Yet</h3>
              <p className="text-gray-600 mb-6">Generate your first lease agreement to get started.</p>
              <Button onClick={() => setShowGenerator(true)} className="bg-blue-600 hover:bg-blue-700">
                <FileText className="w-5 h-5 mr-2" />
                Generate Your First Lease
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leases.map((lease) => (
              <Card 
                key={lease.id} 
                className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => setSelectedLease(lease)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{lease.tenant_name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{lease.property_address}</p>
                    </div>
                    <Badge className={statusColors[lease.status]}>
                      {lease.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Monthly Rent:</span>
                      <span className="font-semibold text-gray-900">${lease.monthly_rent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Term:</span>
                      <span className="font-semibold text-gray-900">{lease.lease_term_months} months</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Start Date:</span>
                      <span className="font-semibold text-gray-900">
                        {format(new Date(lease.lease_start_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}