import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Menu, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import StatsOverview from "@/components/stats-overview";
import SupportRequestForm from "@/components/support-request-form";
import RequestTracking from "@/components/request-tracking";
import KnowledgeBase from "@/components/knowledge-base";
import TechnicianStatus from "@/components/technician-status";
import SystemStatus from "@/components/system-status";
import { api } from "@/lib/api";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [emergencyMessage, setEmergencyMessage] = useState("");
  const [emergencyLocation, setEmergencyLocation] = useState("");

  const handleEmergencyAlert = async () => {
    if (!emergencyMessage.trim() || !emergencyLocation.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both message and location",
        variant: "destructive",
      });
      return;
    }

    try {
      await api.sendEmergencyAlert({
        message: emergencyMessage,
        location: emergencyLocation,
      });
      
      toast({
        title: "Emergency Alert Sent",
        description: "All available technicians have been notified",
      });
      
      setEmergencyOpen(false);
      setEmergencyMessage("");
      setEmergencyLocation("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send emergency alert",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card dark:bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-medical-blue rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h1 className="text-xl font-medium text-foreground">Soporte GEM 5000</h1>
              </div>
              <nav className="hidden md:flex space-x-6">
                <a href="#dashboard" className="text-medical-blue font-medium border-b-2 border-medical-blue pb-4">
                  Panel
                </a>
                <a href="#requests" className="text-muted-foreground hover:text-medical-blue pb-4 transition-colors">
                  Solicitudes
                </a>
                <a href="#knowledge" className="text-muted-foreground hover:text-medical-blue pb-4 transition-colors">
                  Base de Conocimientos
                </a>
                <a href="#technicians" className="text-muted-foreground hover:text-medical-blue pb-4 transition-colors">
                  Técnicos
                </a>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-lg"
              >
                {theme === "light" ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </Button>
              
              {/* Emergency Button */}
              <Dialog open={emergencyOpen} onOpenChange={setEmergencyOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-critical-red hover:bg-red-700 text-white">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    <span className="hidden sm:block">Emergencia</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-critical-red">Alerta de Emergencia</DialogTitle>
                    <DialogDescription>
                      Enviar una alerta inmediata a todos los técnicos disponibles
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Ubicación</label>
                      <Input
                        value={emergencyLocation}
                        onChange={(e) => setEmergencyLocation(e.target.value)}
                        placeholder="ej. UCI Sala 302"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Mensaje de Emergencia</label>
                      <Textarea
                        value={emergencyMessage}
                        onChange={(e) => setEmergencyMessage(e.target.value)}
                        placeholder="Describe la situación de emergencia..."
                        rows={3}
                      />
                    </div>
                    <Button 
                      onClick={handleEmergencyAlert}
                      className="w-full bg-critical-red hover:bg-red-700 text-white"
                    >
                      Enviar Alerta de Emergencia
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              {/* User Profile */}
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-medical-blue text-white text-sm">
                    JD
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:block text-sm font-medium">Dr. Johnson</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <StatsOverview />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Support Request Form */}
          <div className="lg:col-span-1">
            <SupportRequestForm />
          </div>

          {/* Request Tracking */}
          <div className="lg:col-span-2">
            <RequestTracking />
          </div>
        </div>

        {/* Knowledge Base */}
        <div className="mt-8">
          <KnowledgeBase />
        </div>

        {/* Technician Status & System Status */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <TechnicianStatus />
          <SystemStatus />
        </div>
      </div>
    </div>
  );
}
