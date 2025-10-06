import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ACTIVITIES } from "@/lib/activities";

export default function AtividadesPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-primary">
            Tabela de Atividades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold">Atividade</TableHead>
                <TableHead className="text-right font-bold">
                  Pontuação
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ACTIVITIES.map((activity) => (
                <TableRow key={activity.name}>
                  <TableCell>{activity.name}</TableCell>
                  <TableCell className="text-right">{activity.points}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
