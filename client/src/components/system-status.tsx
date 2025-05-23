import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, MessageSquare, Bot, Database, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { SystemNotification } from "@shared/schema";

export default function SystemStatus() {
  const { data: systemStatus, isLoading } = useQuery<SystemNotification[]>({
    queryKey: ["/api/system-status"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-40" />
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-5 h-5 rounded" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="w-3 h-3 rounded-full" />
              </div>
            ))}
          </div>
          <Skeleton className="h-9 w-full mt-6" />
        </CardContent>
      </Card>
    );
  }

  const getSystemIcon = (type: string) => {
    switch (type) {
      case "email": return Mail;
      case "sms": return MessageSquare;
      case "system": return Database;
      default: return Activity;
    }
  };

  const getSystemName = (type: string) => {
    switch (type) {
      case "email": return "Email Notifications";
      case "sms": return "SMS Alerts";
      case "system": return "Request Database";
      default: return "System";
    }
  };

  const getSystemDescription = (type: string, lastActivity: Date) => {
    const timeAgo = formatDistanceToNow(new Date(lastActivity), { addSuffix: true });
    switch (type) {
      case "email": return `Last sent: ${timeAgo}`;
      case "sms": return `Last sent: ${timeAgo}`;
      case "system": return "All systems operational";
      default: return `Last activity: ${timeAgo}`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-success-green";
      case "inactive": return "bg-critical-red";
      case "warning": return "bg-warning-orange";
      default: return "bg-gray-400";
    }
  };

  const getIconColor = (type: string, status: string) => {
    if (status !== "active") return "text-critical-red";
    
    switch (type) {
      case "email": return "text-success-green";
      case "sms": return "text-success-green";
      case "system": return "text-success-green";
      default: return "text-warning-orange";
    }
  };

  // Add Whaticket integration status (mock)
  const allSystems = [
    ...(systemStatus || []),
    {
      id: 999,
      type: "whaticket",
      status: "active" as const,
      lastActivity: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
    }
  ];

  return (
    <Card className="border-border">
      <CardHeader className="border-b border-border">
        <CardTitle className="text-lg font-medium text-foreground">System Status</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">Integration health checks</p>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-4">
          {allSystems.map((system) => {
            const IconComponent = system.type === "whaticket" ? Bot : getSystemIcon(system.type);
            const systemName = system.type === "whaticket" ? "Whaticket Bot" : getSystemName(system.type);
            const description = system.type === "whaticket" ? "API endpoint active" : getSystemDescription(system.type, system.lastActivity!);
            const iconColor = getIconColor(system.type, system.status);
            
            return (
              <div key={system.id} className="flex items-center justify-between p-3 bg-muted/50 dark:bg-muted/20 rounded-lg border border-border">
                <div className="flex items-center space-x-3">
                  <IconComponent className={`${iconColor} w-5 h-5`} />
                  <div>
                    <p className="font-medium text-foreground">{systemName}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                </div>
                <span className={`w-3 h-3 ${getStatusColor(system.status)} rounded-full`} />
              </div>
            );
          })}
        </div>
        
        <div className="mt-6">
          <Button variant="outline" className="w-full">
            System Diagnostics
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
