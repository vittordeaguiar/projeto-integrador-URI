import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sistema de Atendimento
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Bem-vindo ao nosso sistema de atendimento ao cliente
          </p>

          <div className="space-x-4">
            <Link
              href="/novo-ticket"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition font-medium"
            >
              Abrir Novo Chamado
            </Link>
            <Link
              href="/login"
              className="inline-block bg-gray-200 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-300 transition font-medium"
            >
              Login (Interno)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
