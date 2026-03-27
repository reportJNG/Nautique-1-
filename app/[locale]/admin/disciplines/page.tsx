// app/[locale]/admin/disciplines/page.tsx
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

async function getData() {
  const [espaces, disciplines] = await Promise.all([
    prisma.espace.findMany({
      include: {
        categoriesAge: true,
      },
    }),
    prisma.discipline.findMany({
      include: {
        espace: true,
      },
    }),
  ]);
  return { espaces, disciplines };
}

export default async function DisciplinesPage() {
  const { espaces, disciplines } = await getData();

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        Disciplines et Espaces
      </h1>

      <Tabs defaultValue="espaces">
        <TabsList>
          <TabsTrigger value="espaces">Espaces</TabsTrigger>
          <TabsTrigger value="disciplines">Disciplines</TabsTrigger>
        </TabsList>

        <TabsContent value="espaces" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            {espaces.map((espace) => (
              <Card key={espace.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{espace.designation}</CardTitle>
                    <Badge>{espace.code}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4">{espace.description}</p>
                  <div>
                    <p className="text-sm font-medium mb-2">Catégories d&apos;âge :</p>
                    <div className="flex flex-wrap gap-2">
                      {espace.categoriesAge.map((cat) => (
                        <Badge key={cat.id} variant="secondary">
                          {cat.designation}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="disciplines" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm font-medium text-gray-500">
                      <th className="pb-3">Code</th>
                      <th className="pb-3">Désignation</th>
                      <th className="pb-3">Espace</th>
                      <th className="pb-3">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {disciplines.map((discipline) => (
                      <tr key={discipline.id} className="border-b">
                        <td className="py-3 font-mono">{discipline.code}</td>
                        <td className="py-3">{discipline.designation}</td>
                        <td className="py-3">{discipline.espace.designation}</td>
                        <td className="py-3">
                          {discipline.actif === 1 ? (
                            <Badge className="bg-green-100 text-green-700">Actif</Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-600">Inactif</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
