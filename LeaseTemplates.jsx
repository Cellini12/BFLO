import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useUser } from "@/components/hooks/useUser";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  Plus,
  Edit,
  Trash2,
  Copy,
  CheckCircle,
  Loader2,
  Star,
  Info
} from "lucide-react";

const getDefaultTemplate = () => {
  return `RESIDENTIAL LEASE AGREEMENT

This Lease Agreement ("Agreement") is entered into on LEASE_START_DATE between:

LANDLORD: LANDLORD_NAME
Address: LANDLORD_ADDRESS
Phone: LANDLORD_PHONE
Email: LANDLORD_EMAIL

TENANT: TENANT_NAME
Email: TENANT_EMAIL
Phone: TENANT_PHONE

PROPERTY: PROPERTY_ADDRESS

1. LEASE TERM
The term of this lease shall commence on LEASE_START_DATE and end on LEASE_END_DATE, for a total period of LEASE_TERM_MONTHS months.

2. RENT
Tenant agrees to pay monthly rent of MONTHLY_RENT dollars, due on the first day of each month.

3. SECURITY DEPOSIT
Tenant shall pay a security deposit of SECURITY_DEPOSIT dollars, to be held by Landlord and returned within 30 days after lease termination, minus any deductions for damages beyond normal wear and tear.

4. UTILITIES
Tenant is responsible for the following utilities: Electric, Gas, Water, Internet/Cable.

5. MAINTENANCE AND REPAIRS
Tenant shall maintain the premises in good condition and promptly notify Landlord of any needed repairs.

6. PETS
PET_POLICY

7. OCCUPANCY
The premises shall be occupied only by the Tenant named above.

8. TERMINATION
Either party may terminate this lease with 30 days written notice.

9. LATE FEES
Rent payments received after the 5th of the month will incur a late fee of 50 dollars.

10. GOVERNING LAW
This Agreement shall be governed by the laws of the State of New York.

LANDLORD SIGNATURE: _________________________ DATE: _________

TENANT SIGNATURE: _________________________ DATE: _________`;
};

export default function LeaseTemplates() {
  const { user, isLoading: isUserLoading } = useUser();
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formData, setFormData] = useState({
    template_name: "",
    template_type: "residential",
    content: "",
    state_specific: "NY",
    is_default: false
  });

  useEffect(() => {
    if (user && user.customer_type === 'landlord') {
      loadTemplates();
    }
  }, [user]);

  const loadTemplates = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const userTemplates = await base44.entities.LeaseTemplate.filter(
        { landlord_id: user.id },
        "-created_date",
        50
      );
      setTemplates(userTemplates);
    } catch (error) {
      console.error("Error loading templates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    setFormData({
      template_name: "New Lease Template",
      template_type: "residential",
      content: getDefaultTemplate(),
      state_specific: "NY",
      is_default: false
    });
    setSelectedTemplate(null);
    setIsEditing(true);
  };

  const handleEdit = (template) => {
    setFormData({
      template_name: template.template_name,
      template_type: template.template_type,
      content: template.content,
      state_specific: template.state_specific || "NY",
      is_default: template.is_default || false
    });
    setSelectedTemplate(template);
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const dataToSave = {
        ...formData,
        landlord_id: user.id
      };

      if (selectedTemplate) {
        await base44.entities.LeaseTemplate.update(selectedTemplate.id, dataToSave);
      } else {
        await base44.entities.LeaseTemplate.create(dataToSave);
      }

      await loadTemplates();
      setIsEditing(false);
      setSelectedTemplate(null);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving template:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (templateId) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
      await base44.entities.LeaseTemplate.delete(templateId);
      await loadTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };

  const handleDuplicate = async (template) => {
    try {
      const duplicateData = {
        template_name: `${template.template_name} (Copy)`,
        template_type: template.template_type,
        content: template.content,
        state_specific: template.state_specific,
        is_default: false,
        landlord_id: user.id
      };
      await base44.entities.LeaseTemplate.create(duplicateData);
      await loadTemplates();
    } catch (error) {
      console.error("Error duplicating template:", error);
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
          <Info className="h-4 w-4" />
          <AlertDescription>
            This page is only accessible to landlords.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="p-4 lg:p-8 bg-gray-100 min-h-screen">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {selectedTemplate ? 'Edit Template' : 'Create Template'}
              </h1>
              <p className="text-gray-600">Customize your lease agreement template</p>
            </div>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>

          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="template_name">Template Name *</Label>
                  <Input
                    id="template_name"
                    value={formData.template_name}
                    onChange={(e) => setFormData({...formData, template_name: e.target.value})}
                    placeholder="e.g., Standard 12-Month Residential"
                  />
                </div>
                <div>
                  <Label htmlFor="template_type">Template Type</Label>
                  <Select value={formData.template_type} onValueChange={(value) => setFormData({...formData, template_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="short_term">Short Term</SelectItem>
                      <SelectItem value="month_to_month">Month-to-Month</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="state_specific">State</Label>
                  <Select value={formData.state_specific} onValueChange={(value) => setFormData({...formData, state_specific: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NY">New York</SelectItem>
                      <SelectItem value="PA">Pennsylvania</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <Switch
                    checked={formData.is_default}
                    onCheckedChange={(checked) => setFormData({...formData, is_default: checked})}
                  />
                  <Label>Set as default template</Label>
                </div>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  <strong>Available placeholders (use UPPERCASE):</strong> TENANT_NAME, PROPERTY_ADDRESS, MONTHLY_RENT, SECURITY_DEPOSIT, LEASE_START_DATE, LEASE_END_DATE, LEASE_TERM_MONTHS, LANDLORD_NAME, PET_POLICY
                </AlertDescription>
              </Alert>

              <div>
                <Label htmlFor="content">Template Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  rows={20}
                  className="font-mono text-sm"
                  placeholder="Enter your lease agreement text..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Save Template
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

  return (
    <div className="p-4 lg:p-8 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lease Templates</h1>
            <p className="text-gray-600">Create and manage your lease agreement templates</p>
          </div>
          <Button onClick={handleCreateNew} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-5 h-5 mr-2" />
            Create Template
          </Button>
        </div>

        {saveSuccess && (
          <Alert className="bg-green-100 border-green-300 text-green-800">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>Template saved successfully!</AlertDescription>
          </Alert>
        )}

        {templates.length === 0 ? (
          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Templates Yet</h3>
              <p className="text-gray-600 mb-6">Create your first lease template to get started.</p>
              <Button onClick={handleCreateNew} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Template
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        {template.template_name}
                        {template.is_default && (
                          <Badge className="bg-yellow-100 text-yellow-800 ml-2">
                            <Star className="w-3 h-3 mr-1" />
                            Default
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          {template.template_type.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-gray-500 ml-2">{template.state_specific}</span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(template)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicate(template)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(template.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}