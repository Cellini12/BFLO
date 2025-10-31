import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Job } from "@/api/entities";
import { ChatMessage } from "@/api/entities";
import { Technician } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Send, 
  Image, 
  MapPin,
  Phone,
  User as UserIcon,
  Wrench
} from "lucide-react";
import { format } from "date-fns";

export default function JobChat() {
  const [job, setJob] = useState(null);
  const [technician, setTechnician] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
    checkUrlParams();
  }, []);

  const checkUrlParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get('job_id');
    if (jobId) {
      loadChatData(jobId);
    }
  };

  const loadData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const loadChatData = async (jobId) => {
    try {
      const [jobData, chatMessages] = await Promise.all([
        Job.get(jobId),
        ChatMessage.filter({ job_id: jobId }, "created_date")
      ]);

      setJob(jobData);
      setMessages(chatMessages);

      // Load technician if assigned
      if (jobData.technician_id) {
        const techData = await Technician.get(jobData.technician_id);
        setTechnician(techData);
      }
    } catch (error) {
      console.error("Error loading chat data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !job) return;

    try {
      await ChatMessage.create({
        job_id: job.id,
        sender_id: user.id,
        sender_type: "customer",
        message: newMessage,
        message_type: "text"
      });

      setNewMessage("");
      await loadChatData(job.id);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-16 bg-gray-200 rounded-xl"></div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-6 lg:p-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No job found for chat</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <Card className="bg-white/60 backdrop-blur border-0 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                  Job Communication
                </CardTitle>
                <p className="text-gray-600">{job.title}</p>
              </div>
              {technician && (
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-2">
                    <img 
                      src={technician.photo_url || '/api/placeholder/40/40'} 
                      alt={technician.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{technician.name}</p>
                      <p className="text-sm text-gray-500">Your Technician</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Chat Messages */}
        <Card className="bg-white/60 backdrop-blur border-0 shadow-xl">
          <CardContent className="p-0">
            <div className="h-96 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Start a conversation about your service</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div 
                    key={message.id}
                    className={`flex ${message.sender_type === 'customer' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender_type === 'customer' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-900'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        {message.sender_type === 'customer' ? (
                          <UserIcon className="w-4 h-4" />
                        ) : (
                          <Wrench className="w-4 h-4" />
                        )}
                        <span className="text-xs opacity-75">
                          {message.sender_type === 'customer' ? 'You' : (technician?.name || 'Technician')}
                        </span>
                      </div>
                      <p>{message.message}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender_type === 'customer' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {format(new Date(message.created_date), "h:mm a")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Message Input */}
            <div className="border-t border-gray-200 p-6">
              <div className="flex gap-4">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1"
                />
                <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex gap-2 mt-3">
                <Button variant="outline" size="sm">
                  <Image className="w-4 h-4 mr-2" />
                  Photo
                </Button>
                <Button variant="outline" size="sm">
                  <MapPin className="w-4 h-4 mr-2" />
                  Location
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}