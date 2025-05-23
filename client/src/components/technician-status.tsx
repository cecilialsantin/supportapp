import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import type { Technician } from "@shared/schema";

export default function TechnicianStatus() {
  const { data: technicians, isLoading } = useQuery<Technician[]>({
    queryKey: ["/api/technicians"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-success-green";
      case "busy": return "bg-warning-orange";
      case "off_duty": return "bg-gray-500";
      default: return "bg-gray-400";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "available": return "Available";
      case "busy": return "Busy";
      case "off_duty": return "Off Duty";
      default: return "Unknown";
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card className="border-border">
      <CardHeader className="border-b border-border">
        <CardTitle className="text-lg font-medium text-foreground">Technician Availability</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">Current shift status</p>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-4">
          {technicians?.map((technician) => (
            <div key={technician.id} className="flex items-center justify-between p-3 bg-muted/50 dark:bg-muted/20 rounded-lg border border-border">
              <div className="flex items-center space-x-3">
                <Avatar className={`w-10 h-10 ${getStatusColor(technician.status)}`}>
                  <AvatarFallback className="text-white font-medium">
                    {getInitials(technician.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{technician.name}</p>
                  <p className="text-xs text-muted-foreground">{technician.specialty}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={`${getStatusColor(technician.status)} text-white text-xs font-medium border-0`}>
                  {getStatusLabel(technician.status)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {technician.status === "off_duty" ? "-" : `${technician.activeRequests} active`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
