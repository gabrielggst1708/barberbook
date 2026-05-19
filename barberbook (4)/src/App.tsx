/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ServiceCard } from './components/ServiceCard';
import { HistoryItem } from './components/HistoryItem';
import { Calendar as CustomCalendar } from './components/Calendar';
import { Service, Appointment } from './types';
import { Scissors, History, Calendar, User, Search, Clock, ChevronRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { format, setHours, setMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Tab = 'gallery' | 'history' | 'booking' | 'profile';

const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('gallery');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  const [services, setServices] = useState<Service[]>([]);
  const [history, setHistory] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [servicesRes, historyRes] = await Promise.all([
        fetch('/api/servicos'),
        fetch('/api/agendamentos')
      ]);
      const servicesData = await servicesRes.json();
      const historyData = await historyRes.json();
      setServices(servicesData);
      setHistory(historyData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setActiveTab('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedTime || !selectedService) return;

    try {
      setIsBooking(true);
      
      // For this simple demo, we'll try to find or create a default client
      // In a real app, this would come from auth
      let clientsRes = await fetch('/api/clientes');
      let clients = await clientsRes.json();
      let clientId = clients.length > 0 ? clients[0].id : null;

      if (!clientId) {
        const newClientRes = await fetch('/api/clientes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Cliente Teste', email: 'teste@example.com' })
        });
        const newClient = await newClientRes.json();
        clientId = newClient.id;
      }

      const [hours, minutes] = selectedTime.split(':').map(Number);
      const bookingDate = setMinutes(setHours(selectedDate, hours), minutes);

      const response = await fetch('/api/agendamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: clientId,
          servico_id: selectedService.id,
          date: bookingDate.toISOString(),
          status: 'pending',
          price: selectedService.price,
          notes: ''
        })
      });

      if (response.ok) {
        await fetchData();
        setActiveTab('history');
        setSelectedDate(null);
        setSelectedTime(null);
        setSelectedService(null);
        alert('Agendamento realizado com sucesso!');
      }
    } catch (error) {
      console.error('Error booking:', error);
      alert('Erro ao realizar agendamento.');
    } finally {
      setIsBooking(false);
    }
  };

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24">
      {/* Header */}
      <header className="bg-white border-b border-black/5 sticky top-0 z-10 px-6 py-4">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-gray-900">BARBER<span className="text-emerald-600">BOOK</span></h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Estilo & Precisão</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <User size={20} />
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 pt-6">
        <AnimatePresence mode="wait">
          {activeTab === 'gallery' && (
            <motion.div
              key="gallery"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text"
                  placeholder="Buscar serviço ou categoria..."
                  className="w-full bg-white border border-black/5 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <section>
                <div className="flex justify-between items-end mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Nossos Serviços</h2>
                  <span className="text-xs font-medium text-gray-400">{filteredServices.length} opções</span>
                </div>
                <div className="grid gap-4">
                  {filteredServices.map(service => (
                    <ServiceCard 
                      key={service.id} 
                      service={service} 
                      onSelect={handleServiceSelect}
                    />
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <header>
                <h2 className="text-xl font-bold text-gray-900">Seu Histórico</h2>
                <p className="text-sm text-gray-500">Veja seus últimos atendimentos e observações.</p>
              </header>

              <div className="space-y-1">
                {history.map(item => (
                  <HistoryItem key={item.id} appointment={item} />
                ))}
              </div>

              {history.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <History size={32} />
                  </div>
                  <p className="text-gray-500 font-medium">Nenhum serviço realizado ainda.</p>
                </div>
              )}
            </motion.div>
          )}
          
          {activeTab === 'booking' && (
            <motion.div
              key="booking"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <header>
                <h2 className="text-xl font-bold text-gray-900">Agendar Horário</h2>
                {selectedService ? (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-500">Serviço:</span>
                    <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
                      {selectedService.name}
                    </span>
                  </div>
                ) : (
                  <div className="bg-amber-50 text-amber-700 p-4 rounded-2xl flex items-center gap-3 mt-2">
                    <Scissors size={18} />
                    <p className="text-sm font-medium">Selecione um serviço na galeria primeiro.</p>
                  </div>
                )}
              </header>

              <CustomCalendar 
                selectedDate={selectedDate} 
                onDateSelect={(date) => {
                  setSelectedDate(date);
                  setSelectedTime(null);
                }} 
              />

              {selectedDate && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2 text-gray-900">
                    <Clock size={18} className="text-emerald-600" />
                    <h3 className="font-bold">Horários para {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}</h3>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {TIME_SLOTS.map(time => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={cn(
                          "py-3 rounded-xl text-sm font-bold transition-all border",
                          selectedTime === time 
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-100" 
                            : "bg-white text-gray-600 border-black/5 hover:border-emerald-200"
                        )}
                      >
                        {time}
                      </button>
                    ))}
                  </div>

                  {selectedTime && selectedService && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      disabled={isBooking}
                      onClick={handleConfirmBooking}
                      className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-gray-200 mt-4 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isBooking ? <Loader2 className="animate-spin" size={18} /> : 'Confirmar Agendamento'}
                      {!isBooking && <ChevronRight size={18} />}
                    </motion.button>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <header>
                <h2 className="text-xl font-bold text-gray-900">Painel do Barbeiro</h2>
                <p className="text-sm text-gray-500">Gestão de banco de dados e agendamentos.</p>
              </header>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Total Clientes</p>
                  <p className="text-2xl font-black text-gray-900">
                    {Array.from(new Set(history.map(h => h.customerId))).length}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Ganhos</p>
                  <p className="text-2xl font-black text-emerald-600">
                    R$ {history.reduce((acc, curr) => acc + curr.price, 0).toFixed(2)}
                  </p>
                </div>
              </div>

              <section className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <h3 className="font-bold text-sm text-gray-900">Agendamentos Recentes</h3>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Banco de Dados</span>
                </div>
                <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
                  {history.map((item) => (
                    <div key={item.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                      <div>
                        <p className="text-xs font-bold text-gray-900">{item.customerName}</p>
                        <p className="text-[10px] text-gray-500">{item.serviceName} • {format(new Date(item.date), "dd/MM HH:mm")}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-emerald-600">R$ {item.price.toFixed(2)}</p>
                        <p className={cn(
                          "text-[9px] font-bold uppercase",
                          item.status === 'completed' ? 'text-emerald-500' : 'text-amber-500'
                        )}>{item.status}</p>
                      </div>
                    </div>
                  ))}
                  {history.length === 0 && (
                    <div className="p-8 text-center text-gray-400 text-xs italic">
                      Nenhum agendamento no banco de dados.
                    </div>
                  )}
                </div>
              </section>

              <div className="bg-emerald-600 p-6 rounded-2xl text-white shadow-xl shadow-emerald-100">
                <h3 className="font-bold mb-2">Sincronização Ativa</h3>
                <p className="text-xs text-emerald-50 opacity-90 leading-relaxed mb-4">
                  Seu banco de dados SQLite está rodando no servidor e todos os agendamentos são persistidos em tempo real.
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => fetchData()}
                    className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-xs font-bold transition-colors"
                  >
                    Recarregar DB
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-black/5 px-6 py-3 z-20">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <NavButton 
            active={activeTab === 'gallery'} 
            onClick={() => setActiveTab('gallery')}
            icon={<Scissors size={20} />}
            label="Serviços"
          />
          <NavButton 
            active={activeTab === 'booking'} 
            onClick={() => setActiveTab('booking')}
            icon={<Calendar size={20} />}
            label="Agenda"
          />
          <NavButton 
            active={activeTab === 'history'} 
            onClick={() => setActiveTab('history')}
            icon={<History size={20} />}
            label="Histórico"
          />
          <NavButton 
            active={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')}
            icon={<User size={20} />}
            label="Perfil"
          />
        </div>
      </nav>
    </div>
  );
}

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function NavButton({ active, onClick, icon, label }: NavButtonProps) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 transition-all duration-300",
        active ? "text-emerald-600 scale-110" : "text-gray-400 hover:text-gray-600"
      )}
    >
      <div className={cn(
        "p-2 rounded-xl transition-colors",
        active ? "bg-emerald-50" : "bg-transparent"
      )}>
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}

