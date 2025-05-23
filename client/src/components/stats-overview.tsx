import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ClipboardList, 
  AlertCircle, 
  UserCheck, 
  Clock,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { api } from "@/lib/api";

export default function StatsOverview() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard-stats"],
    queryFn: api.getDashboardStats,
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-12 w-12 rounded-lg mb-4" />
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16 mb-4" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Active Requests",
      value: stats?.activeRequests || 0,
      icon: ClipboardList,
      color: "text-medical-blue",
      bgColor: "bg-blue-50 dark:bg-blue-950",
      trend: { value: "8.1%", direction: "up", label: "from last week" }
    },
    {
      title: "Urgent",
      value: stats?.urgentRequests || 0,
      icon: AlertCircle,
      color: "text-critical-red",
      bgColor: "bg-red-50 dark:bg-red-950",
      trend: { value: "12.3%", direction: "down", label: "from yesterday" }
    },
    {
      title: "Available Techs",
      value: stats?.availableTechs || 0,
      icon: UserCheck,
      color: "text-success-green",
      bgColor: "bg-green-50 dark:bg-green-950",
      trend: { value: `Out of ${stats?.totalTechs || 0} total`, direction: null, label: "" }
    },
    {
      title: "Avg Response",
      value: stats?.avgResponseTime || "0min",
      icon: Clock,
      color: "text-warning-orange",
      bgColor: "bg-orange-50 dark:bg-orange-950",
      trend: { value: "2.1min", direction: "down", label: "faster" }
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <Card key={index} className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <p className={`text-2xl font-bold mt-1 ${
                  stat.title === "Urgent" ? "text-critical-red" :
                  stat.title === "Available Techs" ? "text-success-green" :
                  "text-foreground"
                }`}>
                  {stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`${stat.color} text-xl w-6 h-6`} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              {stat.trend.direction === "up" && (
                <TrendingUp className="text-success-green text-xs w-3 h-3 mr-1" />
              )}
              {stat.trend.direction === "down" && (
                <TrendingDown className="text-success-green text-xs w-3 h-3 mr-1" />
              )}
              <span className={`font-medium ${
                stat.trend.direction ? "text-success-green" : "text-muted-foreground"
              }`}>
                {stat.trend.value}
              </span>
              {stat.trend.label && (
                <span className="text-muted-foreground ml-1">{stat.trend.label}</span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
