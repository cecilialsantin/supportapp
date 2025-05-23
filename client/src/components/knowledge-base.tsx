import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, AlertTriangle, Wifi, Wrench } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { KnowledgeBaseArticle } from "@shared/schema";

export default function KnowledgeBase() {
  const { data: articles, isLoading } = useQuery<KnowledgeBaseArticle[]>({
    queryKey: ["/api/knowledge-base"],
  });

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <Skeleton className="h-6 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 bg-muted rounded-lg">
                <div className="flex items-start space-x-3">
                  <Skeleton className="w-5 h-5 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                    <div className="flex items-center space-x-2 mt-3">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "troubleshooting": return AlertTriangle;
      case "network": return Wifi;
      case "maintenance": return Wrench;
      default: return AlertTriangle;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "troubleshooting": return "text-warning-orange";
      case "network": return "text-medical-blue";
      case "maintenance": return "text-success-green";
      default: return "text-muted-foreground";
    }
  };

  return (
    <Card className="border-border">
      <CardHeader className="border-b border-border">
        <CardTitle className="text-lg font-medium text-foreground">Knowledge Base Quick Access</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">Common GEM 5000 troubleshooting guides</p>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles?.map((article) => {
            const IconComponent = getCategoryIcon(article.category);
            const iconColor = getCategoryColor(article.category);
            
            return (
              <div 
                key={article.id} 
                className="group cursor-pointer"
              >
                <div className="bg-muted/50 dark:bg-muted/20 rounded-lg p-4 group-hover:bg-medical-blue/10 transition-colors border border-border group-hover:border-medical-blue/30">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <IconComponent className={`${iconColor} text-lg w-5 h-5`} />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground group-hover:text-medical-blue transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {article.content.substring(0, 100)}...
                      </p>
                      <div className="flex items-center mt-3 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>{article.readTime} min read</span>
                        <span className="mx-2">•</span>
                        <span>Updated {formatDistanceToNow(new Date(article.updatedAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 text-center">
          <Button className="bg-medical-blue hover:bg-blue-700 text-white">
            Browse All Articles
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
