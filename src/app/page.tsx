"use client";

import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import { UserData } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const [userData] = useLocalStorage<UserData | null>("userData", null);
  const firstName = userData?.nomeCompleto?.split(" ")[0] || "";

  return (
    <div className="flex flex-1 items-center justify-center p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6">
          <h1 className="text-3xl font-headline text-primary mb-6 text-center">
            Boas Vindas
          </h1>
          <p
            className="text-center"
            style={{ color: "#406b30", fontSize: "16px" }}
          >
            Olá {firstName}, seja bem vindo(a) ao Aplicativo ProdutiviNet. Nele
            você poderá controlar toda a sua produtividade fiscal e ter à mão
            todos os pontos conquistados durante o período que quiser. Use à
            vontade, ele foi desenvolvido especialmente para você!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
