import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  X, 
  Save,
  MessageCircle,
  Square,
  Circle,
  ArrowRight,
  Trash2
} from "lucide-react";

export default function PhotoEditor({ photo, onSave, onCancel }) {
  const [annotations, setAnnotations] = useState(photo.annotations || []);
  const [activeAnnotationType, setActiveAnnotationType] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  const addTextAnnotation = (x, y) => {
    const text = prompt("Enter annotation text:");
    if (text) {
      const newAnnotation = {
        id: Date.now(),
        type: 'text',
        x,
        y,
        text,
        color: '#ff6b6b'
      };
      setAnnotations(prev => [...prev, newAnnotation]);
    }
  };

  const handleCanvasClick = (e) => {
    if (!activeAnnotationType) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeAnnotationType === 'text') {
      addTextAnnotation(x, y);
    }
  };

  const removeAnnotation = (id) => {
    setAnnotations(prev => prev.filter(ann => ann.id !== id));
  };

  const handleSave = () => {
    // In a real implementation, you would draw the annotations onto the image
    // For now, we'll just pass back the annotations
    onSave(photo.id, photo.url, annotations);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-hidden bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Enhance Photo</CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent className="overflow-auto">
          
          {/* Tools */}
          <div className="flex gap-2 mb-4 p-4 bg-gray-50 rounded-lg">
            <Button
              variant={activeAnnotationType === 'text' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveAnnotationType(activeAnnotationType === 'text' ? null : 'text')}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Add Note
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAnnotations([])}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>

          {/* Image Canvas */}
          <div className="relative mb-6 bg-gray-100 rounded-lg overflow-hidden">
            <img
              ref={imageRef}
              src={photo.url}
              alt="Edit photo"
              className="max-w-full h-auto"
            />
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="absolute inset-0 w-full h-full cursor-crosshair"
              style={{ 
                display: activeAnnotationType ? 'block' : 'none',
                background: 'transparent' 
              }}
            />
            
            {/* Render Annotations */}
            {annotations.map((annotation) => (
              <div
                key={annotation.id}
                className="absolute bg-red-500 text-white p-2 rounded text-sm max-w-32 group"
                style={{
                  left: annotation.x,
                  top: annotation.y,
                  transform: 'translate(-50%, -100%)'
                }}
              >
                {annotation.text}
                <button
                  onClick={() => removeAnnotation(annotation.id)}
                  className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
                <div
                  className="absolute top-full left-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-500"
                  style={{ transform: 'translateX(-50%)' }}
                />
              </div>
            ))}
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h4 className="font-semibold text-blue-900 mb-2">How to enhance your photo:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Click "Add Note" then click on the image to add text annotations</li>
              <li>• Point out specific areas that need attention</li>
              <li>• Describe issues, measurements, or special requirements</li>
              <li>• Enhanced photos help our AI provide more accurate quotes</li>
            </ul>
          </div>

          {/* Current Annotations List */}
          {annotations.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold mb-3">Current Annotations ({annotations.length})</h4>
              <div className="space-y-2">
                {annotations.map((annotation, index) => (
                  <div key={annotation.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">{index + 1}. {annotation.text}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAnnotation(annotation.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" />
              Save Enhanced Photo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}