"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { v4 as uuidv4 } from 'uuid';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Inspection } from "@/lib/types";
import { ACTIVITIES } from "@/lib/activities";

const inspectionActivitySchema = z.object({
  activityName: z.string(),
  quantity: z.number().min(1, "A quantidade deve ser no mínimo 1"),
});

const formSchema = z.object({
  processNumber: z.string().min(1, "Número do processo é obrigatório."),
  activities: z.array(inspectionActivitySchema),
});

interface InspectionFormProps {
  date: string;
  onSave: (inspection: Inspection) => void;
  existingInspection?: Inspection | null;
}

export function InspectionForm({ date, onSave, existingInspection }: InspectionFormProps) {
  const defaultActivities = existingInspection 
    ? existingInspection.activities 
    : [];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      processNumber: existingInspection?.processNumber || "",
      activities: defaultActivities,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "activities",
  });
  
  function onSubmit(values: z.infer<typeof formSchema>) {
    const inspection: Inspection = {
      id: existingInspection?.id || uuidv4(),
      date: date,
      processNumber: values.processNumber,
      activities: values.activities,
    };
    onSave(inspection);
    form.reset();
  }

  const handleCheckboxChange = (checked: boolean, activityName: string) => {
    if (checked) {
      append({ activityName, quantity: 1 });
    } else {
      const index = fields.findIndex(
        (field) => field.activityName === activityName
      );
      if (index > -1) {
        remove(index);
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="processNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número do Processo</FormLabel>
              <FormControl>
                <Input placeholder="Digite o número do processo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel>Atividades</FormLabel>
          <ScrollArea className="h-72 mt-2 rounded-md border p-4">
            <div className="space-y-4">
              {ACTIVITIES.map((activity) => {
                const selectedActivityIndex = fields.findIndex(
                  (field) => field.activityName === activity.name
                );
                const isChecked = selectedActivityIndex > -1;

                return (
                  <div key={activity.name}>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={activity.name}
                        checked={isChecked}
                        onCheckedChange={(checked) => handleCheckboxChange(!!checked, activity.name)}
                      />
                      <label
                        htmlFor={activity.name}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {activity.name}
                      </label>
                    </div>
                    {isChecked && (
                      <div className="pl-6 pt-2">
                        <FormField
                          control={form.control}
                          name={`activities.${selectedActivityIndex}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantidade</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Qtd."
                                  className="w-24"
                                  {...field}
                                  onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        <Button type="submit">Salvar</Button>
      </form>
    </Form>
  );
}
