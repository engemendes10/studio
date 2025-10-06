"use client";

import { useState, useMemo } from 'react';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import { Inspection } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { InspectionForm } from '../_components/InspectionForm';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function EditarProcessosPage() {
  const [inspections, setInspections] = useLocalStorage<Inspection[]>("inspections", []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProcess, setSelectedProcess] = useState<string | null>(null);
  const [editingInspection, setEditingInspection] = useState<Inspection | null>(null);
  const [isFormOpen, setFormOpen] = useState(false);

  const processNumbers = useMemo(() => {
    const uniqueProcesses = [...new Set(inspections.map(i => i.processNumber))];
    if (!searchQuery) return uniqueProcesses;
    return uniqueProcesses.filter(p => p.includes(searchQuery));
  }, [inspections, searchQuery]);

  const inspectionsForSelectedProcess = useMemo(() => {
    if (!selectedProcess) return [];
    return inspections.filter(i => i.processNumber === selectedProcess).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [inspections, selectedProcess]);
  
  const handleSave = (inspection: Inspection) => {
    const existingIndex = inspections.findIndex(i => i.id === inspection.id);
    if (existingIndex > -1) {
      const updatedInspections = [...inspections];
      updatedInspections[existingIndex] = inspection;
      setInspections(updatedInspections);
    }
    setFormOpen(false);
    setEditingInspection(null);
  };
  
  const openEditDialog = (inspection: Inspection) => {
    setEditingInspection(inspection);
    setFormOpen(true);
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-primary">Buscar Processo</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Digite o número do processo..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <ul className="mt-4 space-y-2 max-h-96 overflow-y-auto">
                {processNumbers.map(proc => (
                  <li key={proc}>
                    <Button variant={selectedProcess === proc ? "secondary" : "ghost"} className="w-full justify-start" onClick={() => setSelectedProcess(proc)}>
                      {proc}
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-primary">Lançamentos do Processo</CardTitle>
              <p className="text-sm text-muted-foreground">Processo: {selectedProcess || "Nenhum selecionado"}</p>
            </CardHeader>
            <CardContent>
              {selectedProcess ? (
                 inspectionsForSelectedProcess.length > 0 ? (
                  <ul className="space-y-4">
                    {inspectionsForSelectedProcess.map(insp => (
                      <li key={insp.id} className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <p className="font-semibold">{format(parseISO(insp.date), "dd/MM/yyyy", { locale: ptBR })}</p>
                          <p className="text-sm text-muted-foreground">{insp.activities.length} atividade(s)</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(insp)}>
                          Alterar
                        </Button>
                      </li>
                    ))}
                  </ul>
                 ) : (
                  <p className="text-muted-foreground text-center py-8">Nenhum lançamento encontrado para este processo.</p>
                 )
              ) : (
                <p className="text-muted-foreground text-center py-8">Selecione um processo para ver os lançamentos.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-primary">
              Editar Vistoria
            </DialogTitle>
          </DialogHeader>
          {editingInspection && (
            <InspectionForm
              date={editingInspection.date}
              onSave={handleSave}
              existingInspection={editingInspection}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
