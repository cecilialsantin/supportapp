import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { QrCode, Send, Loader2 } from "lucide-react";
import { insertSupportRequestSchema } from "@shared/schema";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type FormData = {
  serialNumber: string;
  priority: "low" | "medium" | "high";
  description: string;
  location: string;
  contactNumber: string;
  submittedBy: string;
};

export default function SupportRequestForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPriority, setSelectedPriority] = useState<"low" | "medium" | "high">("medium");

  const form = useForm<FormData>({
    resolver: zodResolver(insertSupportRequestSchema.extend({
      submittedBy: insertSupportRequestSchema.shape.submittedBy.default("Dr. Johnson")
    })),
    defaultValues: {
      serialNumber: "",
      priority: "medium",
      description: "",
      location: "",
      contactNumber: "",
      submittedBy: "Dr. Johnson"
    },
  });

  const createRequestMutation = useMutation({
    mutationFn: api.createSupportRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard-stats"] });
      
      toast({
        title: "Request Submitted",
        description: "Your support request has been submitted successfully",
      });
      
      form.reset();
      setSelectedPriority("medium");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit request",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createRequestMutation.mutate(data);
  };

  const priorityOptions = [
    { value: "low", label: "Baja", color: "bg-success-green" },
    { value: "medium", label: "Media", color: "bg-warning-orange" },
    { value: "high", label: "Alta", color: "bg-critical-red" }
  ];

  return (
    <Card className="border-border">
      <CardHeader className="border-b border-border">
        <CardTitle className="text-lg font-medium text-foreground">Enviar Solicitud de Soporte</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">Reporta problemas con GEM 5000 rápidamente</p>
      </CardHeader>
      
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Device Serial Number */}
            <FormField
              control={form.control}
              name="serialNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">
                    Número de Serie del Equipo
                    <span className="text-critical-red ml-1">*</span>
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        placeholder="ej. GEM5000-ABC123"
                        className="pr-10"
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-medical-blue"
                    >
                      <QrCode className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Priority Level */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">Nivel de Prioridad</FormLabel>
                  <div className="grid grid-cols-3 gap-2">
                    {priorityOptions.map((option) => (
                      <Button
                        key={option.value}
                        type="button"
                        variant={selectedPriority === option.value ? "default" : "outline"}
                        className={`text-sm font-medium transition-colors ${
                          selectedPriority === option.value
                            ? `${option.color} text-white hover:opacity-90`
                            : `border-2 hover:${option.color} hover:text-white`
                        }`}
                        onClick={() => {
                          setSelectedPriority(option.value as "low" | "medium" | "high");
                          field.onChange(option.value);
                        }}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Issue Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">Descripción del Problema</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe el problema en detalle..."
                      rows={4}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location/Department */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">Ubicación/Departamento</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar departamento..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="UCI">UCI</SelectItem>
                      <SelectItem value="Emergencias">Emergencias</SelectItem>
                      <SelectItem value="Cirugía">Cirugía</SelectItem>
                      <SelectItem value="Cardiología">Cardiología</SelectItem>
                      <SelectItem value="Laboratorio">Laboratorio</SelectItem>
                      <SelectItem value="Radiología">Radiología</SelectItem>
                      <SelectItem value="Pediatría">Pediatría</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contact Information */}
            <FormField
              control={form.control}
              name="contactNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">Número de Contacto</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Extensión o número móvil"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-medical-blue hover:bg-blue-700 text-white font-medium"
              disabled={createRequestMutation.isPending}
            >
              {createRequestMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Solicitud
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
