"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PlusCircle, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import { Inspection } from "@/lib/types";
import { InspectionForm } from "./_components/InspectionForm";

export default function LancamentosPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [inspections, setInspections] = useLocalStorage<Inspection[]>(
    "inspections",
    []
  );
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingInspection, setEditingInspection] = useState<Inspection | null>(null);

  const selectedDateString = date ? format(date, "yyyy-MM-dd") : "";

  const inspectionsForSelectedDate = inspections.filter(
    (insp) => insp.date === selectedDateString
  );
  
  const handleSave = (inspection: Inspection) => {
    const existingIndex = inspections.findIndex(i => i.id === inspection.id);
    if (existingIndex > -1) {
      const updatedInspections = [...inspections];
      updatedInspections[existingIndex] = inspection;
      setInspections(updatedInspections);
    } else {
      setInspections([...inspections, inspection]);
    }
    setDialogOpen(false);
    setEditingInspection(null);
  };
  
  const openEditDialog = (inspection: Inspection) => {
    setEditingInspection(inspection);
    setDialogOpen(true);
  };
  
  const openNewDialog = () => {
    setEditingInspection(null);
    setDialogOpen(true);
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-primary">
                Escolha a Data
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                locale={ptBR}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
          <Button asChild>
            <Link href="/lancamentos/editar">
              <Edit className="mr-2 h-4 w-4" /> Editar Processos
            </Link>
          </Button>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-headline text-primary">
                  Vistorias do Dia
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {date
                    ? format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                    : "Nenhuma data selecionada"}
                </p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openNewDialog}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Vistoria
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle className="font-headline text-primary">
                      {editingInspection ? 'Editar Vistoria' : 'Nova Vistoria'}
                    </DialogTitle>
                  </DialogHeader>
                  <InspectionForm
                    date={selectedDateString}
                    onSave={handleSave}
                    existingInspection={editingInspection}
                  />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {inspectionsForSelectedDate.length > 0 ? (
                <ul className="space-y-4">
                  {inspectionsForSelectedDate.map((insp) => (
                    <li
                      key={insp.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div>
                        <p className="font-semibold">
                          Processo: {insp.processNumber}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {insp.activities.length} atividade(s) registrada(s)
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(insp)}>
                        Editar
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <p>Nenhuma vistoria registrada para esta data.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
