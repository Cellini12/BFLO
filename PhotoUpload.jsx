
import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // Added this import
import { 
  ArrowLeft, 
  Camera, 
  Upload,
  X,
  Image as ImageIcon,
  Loader2
} from "lucide-react";

export default function PhotoUpload({ job, onUpload, onCancel }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files).filter(
      file => file.type.startsWith("image/")
    );
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files]);
    }
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const removeFile = (indexToRemove) => {
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setIsUploading(true);
    try {
      await onUpload(selectedFiles);
      setSelectedFiles([]);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={onCancel} 
          size="icon"
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upload Photos</h1>
          <p className="text-gray-600">{job?.title}</p>
        </div>
      </div>

      <Card className="bg-white border border-gray-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-gray-900">
            Add Photos to Your Service Request
          </CardTitle>
          <p className="text-gray-600">
            Clear photos help our technicians understand the issue and prepare accordingly.
          </p>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center transition-colors hover:border-yellow-400 bg-gray-50 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <div className="space-y-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                <ImageIcon className="w-8 h-8 text-yellow-600" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Click to upload or drag & drop
                </h3>
                <p className="text-gray-600 mb-4">
                  (You can add multiple photos at once)
                </p>
              </div>
              
              <p className="text-xs text-gray-500">
                Supported: JPG, PNG, GIF (max 10MB each)
              </p>
            </div>
          </div>

          {(job.photos?.length > 0 || selectedFiles.length > 0) && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Current & New Photos
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {job.photos?.map((photo, index) => (
                    <div key={`existing-${index}`} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                            <img src={photo.url} alt={`Existing ${index + 1}`} className="w-full h-full object-cover" />
                        </div>
                        <Badge className="absolute top-2 left-2 bg-green-600 text-white text-xs">
                          Uploaded
                        </Badge>
                    </div>
                ))}
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-yellow-400">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <Badge className="absolute top-2 left-2 bg-yellow-400 text-black text-xs">
                      New
                    </Badge>
                    <p className="text-xs text-gray-600 mt-1 truncate">
                      {file.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
            <Button 
              variant="outline" 
              onClick={onCancel} 
              disabled={isUploading}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || isUploading}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 mr-2" />
                  Upload {selectedFiles.length} Photo{selectedFiles.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
