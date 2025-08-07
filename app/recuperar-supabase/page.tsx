import RecuperarSupabase from "@/components/recuperar-supabase"

export default function RecuperarSupabasePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔧 Recuperar Configuração do Supabase
          </h1>
          <p className="text-gray-600">
            Vamos recuperar suas credenciais do Supabase que foram deletadas acidentalmente
          </p>
        </div>
        
        <RecuperarSupabase />
      </div>
    </div>
  )
}
