import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, UserCog } from "lucide-react";
import { AGENT_ROLES } from "@/lib/constants";
async function getAgents() {
    return prisma.agent.findMany({
        include: { role: true },
        orderBy: { createdAt: "desc" },
    });
}
export default async function AgentsPage() {
    const agents = await getAgents();
    return (<div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gestion des agents
        </h1>
        <Button>
          <Plus className="mr-2 h-4 w-4"/>
          Nouvel agent
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des agents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm font-medium text-gray-500">
                  <th className="pb-3">Nom</th>
                  <th className="pb-3">Login</th>
                  <th className="pb-3">Rôle</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Statut</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent) => (<tr key={agent.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="py-3 flex items-center gap-2">
                      <UserCog className="h-4 w-4 text-gray-400"/>
                      {agent.prenom} {agent.nom}
                    </td>
                    <td className="py-3 font-mono text-sm">{agent.login}</td>
                    <td className="py-3">
                      {AGENT_ROLES[agent.role.code as keyof typeof AGENT_ROLES]}
                    </td>
                    <td className="py-3 text-sm">{agent.email}</td>
                    <td className="py-3">
                      {agent.actif === 1 ? (<Badge className="bg-green-100 text-green-700">Actif</Badge>) : (<Badge className="bg-gray-100 text-gray-600">Inactif</Badge>)}
                    </td>
                  </tr>))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>);
}
