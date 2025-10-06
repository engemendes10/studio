"use client";

import { useState, useMemo } from 'react';
import { DateRange } from 'react-day-picker';
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell, Text } from 'recharts';

import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import { Inspection, UserData, defaultUserData, Activity } from '@/lib/types';
import { ACTIVITIES, CHART_COLORS } from '@/lib/activities';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface ReportData {
  activityName: string;
  quantity: number;
  totalPoints: number;
}

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

export function ReportClient() {
  const [date, setDate] = useState<DateRange | undefined>();
  const [inspections] = useLocalStorage<Inspection[]>("inspections", []);
  const [userData] = useLocalStorage<UserData>("userData", defaultUserData);
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [period, setPeriod] = useState<DateRange | undefined>();

  const activityMap = new Map<string, number>(ACTIVITIES.map(a => [a.name, a.points]));

  const generateReport = () => {
    if (!date?.from || !date?.to) {
      return;
    }
    const interval = { start: startOfDay(date.from), end: endOfDay(date.to) };
    
    const filteredInspections = inspections.filter(i => isWithinInterval(parseISO(i.date), interval));
    
    const aggregatedData = new Map<string, { quantity: number; totalPoints: number }>();

    for (const inspection of filteredInspections) {
      for (const activity of inspection.activities) {
        const points = activityMap.get(activity.activityName) || 0;
        const current = aggregatedData.get(activity.activityName) || { quantity: 0, totalPoints: 0 };
        current.quantity += activity.quantity;
        current.totalPoints += activity.quantity * points;
        aggregatedData.set(activity.activityName, current);
      }
    }

    const sortedReportData = Array.from(aggregatedData.entries()).map(([activityName, data]) => ({
      activityName,
      ...data,
    })).sort((a,b) => a.activityName.localeCompare(b.activityName));

    setReportData(sortedReportData);
    setPeriod(date);
  };

  const grandTotalPoints = useMemo(() => {
    return reportData.reduce((sum, item) => sum + item.totalPoints, 0);
  }, [reportData]);

  const handleExportPDF = () => {
    if (!period || !userData) return;
    const doc = new jsPDF() as jsPDFWithAutoTable;

    // Header
    doc.setFont('times', 'bold');
    doc.setFontSize(24);
    doc.text('Prefeitura Municipal de Campinas', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(20);
    doc.text('Secretaria Municipal de Urbanismo', doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });
    doc.text('Departamento de Controle Urbano', doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });
    
    doc.setFont('times', 'bold');
    doc.setFontSize(24);
    doc.text('Relatório Mensal de Produtividade Fiscal', doc.internal.pageSize.getWidth() / 2, 55, { align: 'center' });

    // User Info
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    const userInfo = `${userData.nomeCompleto} - Matrícula: ${userData.matricula}`;
    doc.text(userInfo, 14, 70);
    
    const periodText = `Período: ${format(period.from!, 'dd/MM/yyyy')} a ${format(period.to!, 'dd/MM/yyyy')}`;
    doc.text(periodText, 14, 77);
    
    // Table
    const tableColumn = ["Atividade", "Quantidade", "Pontuação"];
    const tableRows: (string | number)[][] = [];
    reportData.forEach(item => {
      const row = [
        item.activityName,
        item.quantity,
        item.totalPoints,
      ];
      tableRows.push(row);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 85,
      theme: 'grid',
      headStyles: { fillColor: [128, 9, 9] },
      styles: { font: 'helvetica', fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 120 },
        1: { halign: 'right' },
        2: { halign: 'right' },
      }
    });
    
    let finalY = doc.autoTable.previous.finalY;

    // Footer
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: ${grandTotalPoints}`, 14, finalY + 10);
    doc.setFont('helvetica', 'normal');
    doc.text('Porcentagem Efetiva do Mês: 85%', 14, finalY + 17);
    
    doc.text('___________________________________', doc.internal.pageSize.getWidth() / 2, finalY + 40, { align: 'center' });
    doc.text('Assinatura do Coordenador', doc.internal.pageSize.getWidth() / 2, finalY + 45, { align: 'center' });

    doc.save(`relatorio_produtividade_${userData.nomeCompleto.split(' ')[0]}.pdf`);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/80 backdrop-blur-sm p-2 border rounded-md shadow-lg">
          <p className="font-bold">{label}</p>
          <p className="text-sm">{`${payload[0].name}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };
  
  const RotatedAxisTick = (props: any) => {
    const { x, y, payload } = props;
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={16}
          textAnchor="end"
          fill="#666"
          transform="rotate(-90)"
          fontSize={10}
        >
          {payload.value}
        </text>
      </g>
    );
  };


  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-primary">Gerar Relatório de Produtividade</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full sm:w-[300px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "dd/MM/yy")} - {format(date.to, "dd/MM/yy")}
                    </>
                  ) : (
                    format(date.from, "dd/MM/yyyy")
                  )
                ) : (
                  <span>Escolha o período</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
          <Button onClick={generateReport}>Gerar Relatório</Button>
        </CardContent>
      </Card>
      
      {reportData.length > 0 && period && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle className="font-headline text-primary">Relatório Gerado</CardTitle>
                <p className="text-sm text-muted-foreground">
                    Período: {format(period.from!, "dd/MM/yyyy")} a {format(period.to!, "dd/MM/yyyy")}
                </p>
            </div>
            <Button onClick={handleExportPDF}><Download className="mr-2 h-4 w-4"/>Exportar PDF</Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Atividade</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                  <TableHead className="text-right">Pontuação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.map((item) => (
                  <TableRow key={item.activityName}>
                    <TableCell>{item.activityName}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{item.totalPoints}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={2} className="font-bold">Total</TableCell>
                  <TableCell className="text-right font-bold">{grandTotalPoints}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>
      )}

      {reportData.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-primary">Gráfico de Pontuação</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={reportData} margin={{ top: 5, right: 20, left: 10, bottom: 150 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="activityName" interval={0} tick={<RotatedAxisTick />} height={160} />
                            <YAxis />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="totalPoints" name="Pontuação">
                                {reportData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-primary">Gráfico de Quantidades</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={reportData} margin={{ top: 5, right: 20, left: 10, bottom: 150 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="activityName" interval={0} tick={<RotatedAxisTick />} height={160} />
                            <YAxis />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="quantity" name="Quantidade">
                                {reportData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}
