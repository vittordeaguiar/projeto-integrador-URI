"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  created_at: string;
  updated_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User>();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<string>("desc");

  const priorities = [
    { value: "all", label: "Todas as Prioridades" },
    { value: "baixa", label: "Baixa" },
    { value: "normal", label: "Normal" },
    { value: "alta", label: "Alta" },
    { value: "urgente", label: "Urgente" },
  ];

  const sortOptions = [
    { value: "created_at", label: "Data de Criação" },
    { value: "updated_at", label: "Última Atualização" },
    { value: "priority", label: "Prioridade" },
    { value: "status", label: "Status" },
  ];

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadTickets();
    }
  }, [user]);

  useEffect(() => {
    filterAndSortTickets();
  }, [tickets, selectedPriority, sortBy, sortOrder]);

  async function checkUser() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("email", session.user.email)
        .single();

      // Verificar se o usuário é admin
      if (userData?.role !== "admin") {
        router.push("/unauthorized"); // ou outra página de erro
        return;
      }

      setUser(userData);
    } else {
      router.push("/login");
    }
  }

  async function loadTickets() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao carregar tickets:", error);
        return;
      }

      setTickets(data || []);
    } catch (error) {
      console.error("Erro ao carregar tickets:", error);
    } finally {
      setLoading(false);
    }
  }

  function filterAndSortTickets() {
    let filtered = [...tickets];

    if (selectedPriority !== "all") {
      filtered = filtered.filter((ticket) => ticket.priority === selectedPriority);
    }

    filtered.sort((a, b) => {
      let aValue = a[sortBy as keyof Ticket];
      let bValue = b[sortBy as keyof Ticket];

      if (sortBy === "priority") {
        const priorityOrder = { urgente: 4, alta: 3, normal: 2, baixa: 1 };
        aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
        bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredTickets(filtered);
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgente":
        return "bg-red-100 text-red-800";
      case "alta":
        return "bg-orange-100 text-orange-800";
      case "normal":
        return "bg-blue-100 text-blue-800";
      case "baixa":
        return "bg-green-100 text-green-800";
      default:
        return "bg-zinc-100 text-zinc-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "aberto":
        return "bg-yellow-100 text-yellow-800";
      case "em_andamento":
        return "bg-blue-100 text-blue-800";
      case "fechado":
        return "bg-green-100 text-green-800";
      default:
        return "bg-zinc-100 text-zinc-800";
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-8 text-zinc-600">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard Admin</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 cursor-pointer"
          >
            Sair
          </button>
        </div>

        {/* User Info */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Bem-vindo, {user.name}!</h2>
          <p className="text-zinc-600">Você está conectado como: {user.role}</p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4">Filtros e Ordenação</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtro por Prioridade */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">Prioridade</label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="w-full p-2 border border-zinc-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {priorities.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Ordenar por */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">Ordenar por</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-2 border border-zinc-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Ordem */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">Ordem</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full p-2 border border-zinc-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="desc">Decrescente</option>
                <option value="asc">Crescente</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Total de Tickets</h3>
            <p className="text-3xl font-bold text-blue-600">{tickets.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Filtrados</h3>
            <p className="text-3xl font-bold text-green-600">{filteredTickets.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Urgentes</h3>
            <p className="text-3xl font-bold text-red-600">
              {tickets.filter((t) => t.priority === "urgente").length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Abertos</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {tickets.filter((t) => t.status === "aberto").length}
            </p>
          </div>
        </div>

        {/* Tickets List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-zinc-200">
            <h3 className="text-lg font-semibold">Lista de Tickets</h3>
          </div>

          {loading ? (
            <div className="p-6 text-center">
              <div className="text-lg">Carregando tickets...</div>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-6 text-center text-zinc-500">
              Nenhum ticket encontrado com os filtros selecionados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Título
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Prioridade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Categoria
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Criado em
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-zinc-200">
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-zinc-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-zinc-900">{ticket.title}</div>
                        <div className="text-sm text-zinc-500 truncate max-w-xs">
                          {ticket.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-zinc-900">{ticket.customer_name}</div>
                        <div className="text-sm text-zinc-500">{ticket.customer_email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`capitalize inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}
                        >
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`capitalize inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}
                        >
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="capitalize px-6 py-4 whitespace-nowrap text-sm text-zinc-900">
                        {ticket.category || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                        {new Date(ticket.created_at).toLocaleDateString("pt-BR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
