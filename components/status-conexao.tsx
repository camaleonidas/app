"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, RefreshCw, Database, Clock } from "lucide-react"
import { useSupabaseSync } from "@/hooks/use-supabase-sync"

export function StatusConexao() {
  const { isOnline, isLoading, lastSync, testarConexao, sincronizarDados } = useSupabaseSync()

  return (
    <Card className={`border-2 ${isOnline ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isOnline ? <Wifi className="h-5 w-5 text-green-600" /> : <WifiOff className="h-5 w-5 text-red-600" />}

            <div>
              <div className="flex items-center gap-2">
                <Badge variant={isOnline ? "default" : "destructive"}>
                  {isLoading ? "Testando..." : isOnline ? "Online" : "Offline"}
                </Badge>
                <span className="text-sm font-medium">
                  {isOnline ? "Conectado ao Supabase" : "Usando dados locais"}
                </span>
              </div>

              {lastSync && (
                <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                  <Clock className="h-3 w-3" />
                  <span>Última sincronização: {lastSync}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={testarConexao} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
              Testar
            </Button>

            {isOnline && (
              <Button size="sm" onClick={sincronizarDados} disabled={isLoading}>
                <Database className="h-4 w-4 mr-1" />
                Sincronizar
              </Button>
            )}
          </div>
        </div>

        {!isOnline && (
          <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-sm">
            <strong>⚠️ Modo Offline:</strong> Os dados estão sendo salvos localmente. Quando a conexão for restaurada,
            sincronize os dados.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
