import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Save, X, Phone } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { Technician } from "@shared/schema";

export default function TechnicianStatus() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingPhone, setEditingPhone] = useState("");
  const [onCallTechId, setOnCallTechId] = useState<number>(1); // Default to first tech

  const { data: technicians, isLoading } = useQuery<Technician[]>({
    queryKey: ["/api/technicians"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const updateTechnicianMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Technician> }) => 
      api.updateTechnician(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/technicians"] });
      toast({
        title: "Técnico Actualizado",
        description: "Los datos del técnico se han actualizado correctamente",
      });
      setEditingId(null);
      setEditingPhone("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el técnico",
        variant: "destructive",
      });
    },
  });

  const handleEditClick = (technician: Technician) => {
    setEditingId(technician.id);
    setEditingPhone(technician.phone || "");
  };

  const handleSaveClick = (technicianId: number) => {
    updateTechnicianMutation.mutate({
      id: technicianId,
      data: { phone: editingPhone }
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingPhone("");
  };

  const handleSetOnCall = (technicianId: number) => {
    setOnCallTechId(technicianId);
    toast({
      title: "Guardia Actualizada",
      description: "Se ha cambiado el técnico de guardia para recibir SMS",
    });
  };

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
        <CardTitle className="text-lg font-medium text-foreground">Gestión de Técnicos y Guardias</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">Administrar números de teléfono y asignar guardia semanal</p>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-4">
          {technicians?.map((technician) => (
            <div key={technician.id} className={`p-4 rounded-lg border transition-all ${
              onCallTechId === technician.id 
                ? 'bg-blue-50 dark:bg-blue-950 border-medical-blue shadow-md' 
                : 'bg-muted/50 dark:bg-muted/20 border-border'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className={`w-10 h-10 ${getStatusColor(technician.status)}`}>
                    <AvatarFallback className="text-white font-medium">
                      {getInitials(technician.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-foreground">{technician.name}</p>
                      {onCallTechId === technician.id && (
                        <Badge className="bg-medical-blue text-white text-xs">
                          <Phone className="w-3 h-3 mr-1" />
                          DE GUARDIA
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{technician.specialty}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={`${getStatusColor(technician.status)} text-white text-xs font-medium border-0`}>
                    {getStatusLabel(technician.status)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {technician.status === "off_duty" ? "-" : `${technician.activeRequests} activas`}
                  </span>
                </div>
              </div>
              
              {/* Phone number management */}
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    {editingId === technician.id ? (
                      <Input
                        value={editingPhone}
                        onChange={(e) => setEditingPhone(e.target.value)}
                        placeholder="Número de celular"
                        className="w-48 h-8"
                      />
                    ) : (
                      <span className="text-sm text-foreground">
                        {technician.phone || "Sin número registrado"}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {editingId === technician.id ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleSaveClick(technician.id)}
                          disabled={updateTechnicianMutation.isPending}
                          className="h-8 px-3"
                        >
                          <Save className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                          className="h-8 px-3"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditClick(technician)}
                          className="h-8 px-3"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Editar
                        </Button>
                        {onCallTechId !== technician.id && (
                          <Button
                            size="sm"
                            onClick={() => handleSetOnCall(technician.id)}
                            className="h-8 px-3 bg-medical-blue hover:bg-blue-700"
                          >
                            Asignar Guardia
                          </Button>
                        )}
                      </>
                    )}
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
