import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Save, 
  Loader2,
  Building,
  Plus,
  Trash2
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function Profile() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    customer_type: 'homeowner',
    company_name: '',
    phone: '',
    address: '',
    properties: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      setFormData({
        full_name: currentUser.full_name || '',
        email: currentUser.email || '',
        customer_type: currentUser.customer_type || 'homeowner',
        company_name: currentUser.company_name || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        properties: currentUser.properties || [{ address: '', property_type: '', notes: '' }]
      });
    } catch (error) {
      console.error("Error loading user profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handlePropertyChange = (index, field, value) => {
    const newProperties = [...formData.properties];
    newProperties[index][field] = value;
    handleInputChange('properties', newProperties);
  };

  const addProperty = () => {
    const newProperties = [...(formData.properties || []), { address: '', property_type: '', notes: '' }];
    handleInputChange('properties', newProperties);
  };

  const removeProperty = (index) => {
    if (formData.properties.length <= 1) return;
    const newProperties = formData.properties.filter((_, i) => i !== index);
    handleInputChange('properties', newProperties);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    const { full_name, email, ...updateData } = formData;
    
    // Ensure properties for landlords are not empty
    if (updateData.customer_type === 'landlord') {
      updateData.properties = updateData.properties.filter(p => p.address.trim() !== '');
    } else {
      updateData.properties = [];
    }

    try {
      await User.updateMyUserData(updateData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 bg-background min-h-screen">
        <div className="animate-pulse space-y-4 max-w-4xl mx-auto">
          <div className="h-10 w-1/3 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded-xl"></div>
          <div className="h-64 bg-muted rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 bg-background min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Your Profile</h1>
          <p className="text-muted-foreground">Manage your personal and property information.</p>
        </div>

        <form onSubmit={handleSave}>
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input id="full_name" value={formData.full_name} disabled className="bg-muted/50" />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={formData.email} disabled className="bg-muted/50" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Primary Address</Label>
                  <Input 
                    id="address" 
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="customer_type">Account Type</Label>
                 <Select value={formData.customer_type} onValueChange={(value) => handleInputChange('customer_type', value)}>
                    <SelectTrigger className="w-full mt-1">
                        <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="homeowner">Homeowner</SelectItem>
                        <SelectItem value="landlord">Landlord / Property Manager</SelectItem>
                    </SelectContent>
                </Select>
              </div>

              {formData.customer_type === 'landlord' && (
                <div>
                  <Label htmlFor="company_name">Company Name (Optional)</Label>
                  <Input 
                    id="company_name" 
                    value={formData.company_name}
                    onChange={(e) => handleInputChange('company_name', e.target.value)}
                  />
                </div>
              )}
            </CardContent>
          </Card>
          
          {formData.customer_type === 'landlord' && (
            <Card className="mt-8">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" /> Managed Properties
                  </CardTitle>
                  <CardDescription>Add and manage all the properties under your care.</CardDescription>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addProperty}>
                  <Plus className="w-4 h-4 mr-2" /> Add Property
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.properties?.map((prop, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4 relative bg-muted/30">
                     <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs">Property Address</Label>
                        <Input placeholder="123 Main St, Buffalo, NY" value={prop.address} onChange={(e) => handlePropertyChange(index, 'address', e.target.value)} />
                      </div>
                      <div>
                        <Label className="text-xs">Property Type</Label>
                        <Input placeholder="e.g., Duplex, Single-Family" value={prop.property_type} onChange={(e) => handlePropertyChange(index, 'property_type', e.target.value)} />
                      </div>
                    </div>
                    <div>
                        <Label className="text-xs">Notes</Label>
                        <Input placeholder="e.g., Access code 1234, tenant name" value={prop.notes} onChange={(e) => handlePropertyChange(index, 'notes', e.target.value)} />
                    </div>
                    {formData.properties.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => removeProperty(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {(!formData.properties || formData.properties.length === 0) && (
                   <div className="text-center py-6">
                     <p className="text-muted-foreground">No properties added yet. Click "Add Property" to start.</p>
                   </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-4 mt-8">
            {saveSuccess && (
              <Alert className="bg-green-500/10 border-green-500/20 text-green-700">
                <AlertTitle>Success!</AlertTitle>
                <AlertDescription>Your profile has been saved.</AlertDescription>
              </Alert>
            )}
            <Button type="submit" disabled={isSaving} size="lg">
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}