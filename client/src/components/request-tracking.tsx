import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Filter, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { SupportRequest } from "@shared/schema";

export default function RequestTracking() {
  const { data: requests, isLoading } = useQuery<SupportRequest[]>({
    queryKey: ["/api/support-requests"],
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
  });

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-9 w-20" />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="w-3 h-3 rounded-full" />
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                      <Skeleton className="h-4 w-64" />
                      <div className="flex space-x-4">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right space-y-1">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="w-8 h-8 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-critical-red";
      case "medium": return "bg-warning-orange";
      case "low": return "bg-success-green";
      default: return "bg-muted";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved": return "bg-success-green";
      case "in_progress": return "bg-warning-orange";
      case "open": return "bg-blue-500";
      case "closed": return "bg-gray-500";
      default: return "bg-muted";
    }
  };

  const getStatusIndicator = (status: string, priority: string) => {
    if (status === "open" && priority === "high") {
      return <div className="w-3 h-3 bg-critical-red rounded-full pulse-urgent" />;
    }
    return <div className={`w-3 h-3 ${getStatusColor(status)} rounded-full`} />;
  };

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
  };

  const getTechnicianColor = (status: string) => {
    switch (status) {
      case "resolved": return "bg-gray-400";
      case "in_progress": return "bg-medical-blue";
      case "open": return "bg-success-green";
      default: return "bg-gray-400";
    }
  };

  return (
    <Card className="border-border">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-medium text-foreground">Recent Requests</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Track ongoing support cases</p>
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-4">
          {requests?.map((request) => (
            <div key={request.id} className="flex items-center justify-between p-4 bg-muted/50 dark:bg-muted/20 rounded-lg border border-border">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {getStatusIndicator(request.status, request.priority)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-foreground">
                      #SR-{String(request.id).padStart(3, '0')}
                    </span>
                    <Badge className={`${getPriorityColor(request.priority)} text-white text-xs font-medium`}>
                      {request.priority.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className={`${getStatusColor(request.status)} text-white border-0 text-xs font-medium`}>
                      {request.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {request.description}
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                    <span>{request.serialNumber}</span>
                    <span>{request.location}</span>
                    <span>{formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    {request.assignedTechnician || 'Unassigned'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {request.assignedTechnician ? 'Technician' : 'Pending Assignment'}
                  </p>
                </div>
                <Avatar className="w-8 h-8">
                  <AvatarFallback className={`${getTechnicianColor(request.status)} text-white text-xs font-medium`}>
                    {request.assignedTechnician ? getInitials(request.assignedTechnician) : '?'}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 text-center">
          <Button variant="ghost" className="text-medical-blue hover:text-blue-700">
            View All Requests
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
