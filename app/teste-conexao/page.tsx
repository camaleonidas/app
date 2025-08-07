import TesteConexaoVisual from "@/components/teste-conexao-visual"

export default function TesteConexaoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Diagnóstico de Conexão
          </h1>
          <p className="text-gray-600">
            Teste completo da integração com Supabase
          </p>
        </div>
        
        <TesteConexaoVisual />
      </div>
    </div>
  )
}
