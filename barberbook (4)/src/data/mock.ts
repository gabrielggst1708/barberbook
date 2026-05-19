import { Service, Appointment } from '../types';

export const MOCK_SERVICES: Service[] = [
  {
    id: '1',
    name: 'Corte Moderno',
    description: 'Corte degradê com finalização em pomada matte. Ideal para um visual limpo e atual.',
    price: 45.00,
    category: 'corte',
    imageUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=800&auto=format&fit=crop',
    duration: 40
  },
  {
    id: '2',
    name: 'Barba Completa',
    description: 'Modelagem de barba com toalha quente e produtos premium para hidratação.',
    price: 35.00,
    category: 'barba',
    imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=800&auto=format&fit=crop',
    duration: 30
  },
  {
    id: '3',
    name: 'Combo Master',
    description: 'Corte + Barba + Sobrancelha. O tratamento completo para renovar seu visual.',
    price: 75.00,
    category: 'combo',
    imageUrl: 'https://images.unsplash.com/photo-1621605815841-2dddb39744a8?q=80&w=800&auto=format&fit=crop',
    duration: 70
  },
  {
    id: '4',
    name: 'Sobrancelha na Navalha',
    description: 'Limpeza e design de sobrancelha utilizando navalha para maior precisão.',
    price: 15.00,
    category: 'finalização',
    imageUrl: 'https://images.unsplash.com/photo-1593702295094-272a9f01511f?q=80&w=800&auto=format&fit=crop',
    duration: 15
  }
];

export const MOCK_HISTORY: Appointment[] = [
  {
    id: 'h1',
    customerId: 'user1',
    customerName: 'Gustavo',
    serviceId: '1',
    serviceName: 'Corte Moderno',
    date: new Date(Date.now() - 86400000 * 7).toISOString(), // 7 days ago
    status: 'completed',
    notes: 'Deixar a nuca mais alta e usar pomada de brilho.',
    price: 45.00
  },
  {
    id: 'h2',
    customerId: 'user1',
    customerName: 'Gustavo',
    serviceId: '2',
    serviceName: 'Barba Completa',
    date: new Date(Date.now() - 86400000 * 21).toISOString(), // 21 days ago
    status: 'completed',
    notes: 'Alinhar bem as bochechas.',
    price: 35.00
  }
];
