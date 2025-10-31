
import React, { useState, useEffect } from "react";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { Quote } from "@/api/entities";
import { UploadFile, InvokeLLM } from "@/api/integrations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  Upload,
  Wand2,
  Bot,
  X,
  Plus,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

import PhotoEditor from "../components/ai-quote/PhotoEditor";
import AIQuoteResults from "../components/ai-quote/AIQuoteResults";
import { useUser } from "@/components/hooks/useUser";

const SERVICE_TYPES = [
  { value: "plumbing", label: "Plumbing" },
  { value: "electrical", label: "Electrical" },
  { value: "hvac", label: "HVAC" },
  { value: "general_maintenance", label: "General Maintenance" },
  { value: "landscaping", label: "Landscaping" },
  { value: "cleaning", label: "Cleaning" },
  { value: "painting", label: "Painting" },
  { value: "roofing", label: "Roofing" },
  { value: "other", label: "Other" }
];

export default function AIQuote() {
  const { user, isLoading: isUserLoading } = useUser();
  const [step, setStep] = useState(1);
  const [photos, setPhotos] = useState([]);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    service_type: "",
    urgency: "normal"
  });
  const [aiQuote, setAiQuote] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingQuote, setIsGeneratingQuote] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isUserLoading && user && user.subscription_status !== 'active') {
      window.location.href = createPageUrl("Subscription");
    }
  }, [user, isUserLoading]);

  if (isUserLoading) {
      return (
        <div className="p-8 text-center bg-gray-100 min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
        </div>
      );
  }

  const handleFileUpload = async (files) => {
    setIsLoading(true);
    setError("");

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const { file_url } = await UploadFile({ file });
        return {
          id: Date.now() + Math.random(),
          url: file_url,
          original_name: file.name,
          edited_url: null,
          annotations: []
        };
      });

      const uploadedPhotos = await Promise.all(uploadPromises);
      setPhotos(prev => [...prev, ...uploadedPhotos]);

      if (step === 1 && uploadedPhotos.length > 0) {
        setStep(2);
      }
    } catch (error) {
      setError("Failed to upload photos. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const removePhoto = (photoId) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId));
    if (photos.length === 1) {
      setStep(1);
    }
  };

  const handlePhotoEdit = (photoId, editedUrl, annotations) => {
    setPhotos(prev => prev.map(photo =>
      photo.id === photoId
        ? { ...photo, edited_url: editedUrl, annotations }
        : photo
    ));
    setEditingPhoto(null);
  };

  const generateAIQuote = async () => {
    if (!formData.title || !formData.service_type || photos.length === 0) {
      setError("Please fill in all required fields and upload at least one photo.");
      return;
    }

    setIsGeneratingQuote(true);
    setError("");

    try {
      const photoUrls = photos.map(photo => photo.edited_url || photo.url);

      const prompt = `
        Analyze the uploaded photos and provide a detailed estimate for a ${formData.service_type} project.

        Project Title: ${formData.title}
        Service Type: ${formData.service_type}
        Description: ${formData.description}
        Urgency: ${formData.urgency}

        Based on the photos, provide:
        1. A detailed analysis of what work is needed
        2. Estimated labor hours
        3. Materials needed with approximate costs
        4. Total estimated cost range
        5. Complexity assessment (simple/moderate/complex)
        6. Potential issues or considerations
        7. Recommended timeline

        Be realistic with pricing based on current market rates for professional home services.
      `;

      const result = await InvokeLLM({
        prompt,
        file_urls: photoUrls,
        response_json_schema: {
          type: "object",
          properties: {
            analysis: { type: "string" },
            work_needed: { type: "array", items: { type: "string" } },
            labor_hours: { type: "number" },
            materials: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  item: { type: "string" },
                  estimated_cost: { type: "number" },
                  notes: { type: "string" }
                }
              }
            },
            cost_range_min: { type: "number" },
            cost_range_max: { type: "number" },
            complexity: { type: "string", enum: ["simple", "moderate", "complex"] },
            considerations: { type: "array", items: { type: "string" } },
            timeline_days: { type: "number" },
            confidence_level: { type: "string", enum: ["low", "medium", "high"] }
          }
        }
      });

      setAiQuote(result);
      setStep(4);
    } catch (error) {
      setError("Failed to generate AI quote. Please try again.");
      console.error("AI Quote Error:", error);
    } finally {
      setIsGeneratingQuote(false);
    }
  };

  const saveQuoteRequest = async () => {
    try {
      if (!user) {
        setError("User not logged in. Cannot save quote request.");
        return;
      }

      const quoteData = {
        title: formData.title,
        description: `${formData.description}\n\nAI Analysis: ${aiQuote.analysis}`,
        amount: (aiQuote.cost_range_min + aiQuote.cost_range_max) / 2,
        customer_id: user.id,
        status: "pending",
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        line_items: [
          {
            description: "Labor",
            quantity: aiQuote.labor_hours,
            rate: 75,
            amount: aiQuote.labor_hours * 75
          },
          ...aiQuote.materials.map(material => ({
            description: material.item,
            quantity: 1,
            rate: material.estimated_cost,
            amount: material.estimated_cost
          }))
        ],
        notes: `AI-Generated Quote\nComplexity: ${aiQuote.complexity}\nTimeline: ${aiQuote.timeline_days} days\nConfidence: ${aiQuote.confidence_level}`
      };

      await Quote.create(quoteData);

      setStep(1);
      setPhotos([]);
      setFormData({ title: "", description: "", service_type: "", urgency: "normal" });
      setAiQuote(null);

    } catch (error) {
      setError("Failed to save quote request.");
      console.error("Save Quote Error:", error);
    }
  };

  return (
    <div className="p-4 lg:p-8 bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50 min-h-screen">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Wand2 className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              AI Quote Generator
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload photos of your project and get an intelligent, instant AI-powered estimate
          </p>

          {/* Progress Steps */}
          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-4">
              {[1, 2, 3, 4].map((stepNum) => (
                <React.Fragment key={stepNum}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    step >= stepNum
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {stepNum}
                  </div>
                  {stepNum < 4 && (
                    <div className={`w-8 h-1 rounded-full transition-all duration-300 ${
                      step > stepNum ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : 'bg-gray-200'
                    }`}></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-8 mt-4 text-sm font-medium">
            <span className={step >= 1 ? 'text-purple-600 font-bold' : 'text-gray-500'}>Upload</span>
            <span className={step >= 2 ? 'text-purple-600 font-bold' : 'text-gray-500'}>Enhance</span>
            <span className={step >= 3 ? 'text-purple-600 font-bold' : 'text-gray-500'}>Describe</span>
            <span className={step >= 4 ? 'text-purple-600 font-bold' : 'text-gray-500'}>Results</span>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Photo Upload */}
        {step === 1 && (
          <Card className="bg-white border border-gray-200 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Camera className="w-5 h-5" />
                Upload Project Photos
              </CardTitle>
              <p className="text-gray-600">
                Upload clear photos showing the work area, issues, or project requirements
              </p>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-yellow-400 transition-colors bg-gray-50">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Drop photos here or click to browse
                  </h3>
                  <p className="text-gray-600">
                    Support for JPG, PNG, GIF up to 10MB each
                  </p>
                </label>
              </div>

              {isLoading && (
                <div className="text-center mt-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Uploading photos...</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Photo Enhancement */}
        {step === 2 && (
          <Card className="bg-white border border-gray-200 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Sparkles className="w-5 h-5" />
                Enhance Your Photos
              </CardTitle>
              <p className="text-gray-600">
                Add annotations and highlights to help our AI better understand your needs
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                      <img
                        src={photo.edited_url || photo.url}
                        alt="Project photo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 space-x-2">
                        <Button
                          size="sm"
                          onClick={() => setEditingPhoto(photo)}
                          className="bg-white text-gray-900 hover:bg-gray-100"
                        >
                          <Wand2 className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removePhoto(photo.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    {photo.annotations && photo.annotations.length > 0 && (
                      <Badge className="absolute top-2 right-2 bg-green-600 text-white">
                        Enhanced
                      </Badge>
                    )}
                  </div>
                ))}

                <label htmlFor="add-more-photos" className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-yellow-400 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                    id="add-more-photos"
                  />
                  <div className="text-center">
                    <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <span className="text-sm text-gray-500">Add More</span>
                  </div>
                </label>
              </div>

              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => setStep(1)} className="border-gray-300 text-gray-700 hover:bg-gray-50">
                  Back
                </Button>
                <Button onClick={() => setStep(3)} className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold">
                  Continue to Description
                  <Wand2 className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Project Description */}
        {step === 3 && (
          <Card className="bg-white border border-gray-200 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Bot className="w-5 h-5" />
                Describe Your Project
              </CardTitle>
              <p className="text-gray-600">
                Help our AI understand exactly what you need done
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Fix leaking bathroom faucet"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="border-gray-300 focus:border-yellow-400 focus:ring-yellow-400"
                />
              </div>

              <div>
                <Label htmlFor="service_type">Service Type *</Label>
                <select
                  id="service_type"
                  value={formData.service_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, service_type: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                >
                  <option value="">Select service type</option>
                  {SERVICE_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="description">Detailed Description</Label>
                <Textarea
                  id="description"
                  rows={4}
                  placeholder="Describe the issue, what you want done, any specific requirements..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="border-gray-300 focus:border-yellow-400 focus:ring-yellow-400"
                />
              </div>

              <div>
                <Label htmlFor="urgency">Urgency Level</Label>
                <select
                  id="urgency"
                  value={formData.urgency}
                  onChange={(e) => setFormData(prev => ({ ...prev, urgency: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                >
                  <option value="normal">Normal (within 1-2 weeks)</option>
                  <option value="urgent">Urgent (within few days)</option>
                  <option value="emergency">Emergency (ASAP)</option>
                </select>
              </div>

              <div className="flex justify-between gap-4">
                <Button variant="outline" onClick={() => setStep(2)} className="border-gray-300 text-gray-700 hover:bg-gray-50">
                  Back to Photos
                </Button>
                <Button
                  onClick={generateAIQuote}
                  disabled={isGeneratingQuote}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
                >
                  {isGeneratingQuote ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                      Generating Quote...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate AI Quote
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: AI Quote Results */}
        {step === 4 && aiQuote && (
          <AIQuoteResults
            quote={aiQuote}
            projectData={formData}
            photos={photos}
            onSaveRequest={saveQuoteRequest}
            onStartOver={() => {
              setStep(1);
              setPhotos([]);
              setFormData({ title: "", description: "", service_type: "", urgency: "normal" });
              setAiQuote(null);
            }}
          />
        )}

        {/* Photo Editor Modal */}
        {editingPhoto && (
          <PhotoEditor
            photo={editingPhoto}
            onSave={handlePhotoEdit}
            onCancel={() => setEditingPhoto(null)}
          />
        )}
      </div>
    </div>
  );
}
