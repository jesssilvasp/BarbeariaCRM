import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/public/LandingPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CustomerApp } from './components/pwa/CustomerApp';
import { BarberPortal } from './components/barber/BarberPortal';
import { ReceptionTV } from './components/tv/ReceptionTV';
import { BarberFlowStore } from './data/mockDatabase';
import {
  TenantId,
  AppointmentStatus,
  LeadStage,
} from './types';

export default function App() {
  const [dbState, setDbState] = useState(() => BarberFlowStore.loadState());
  const [currentView, setCurrentView] = useState<
    'public' | 'admin' | 'customerApp' | 'barberPortal' | 'tvMode'
  >('public');

  // Save changes to localStorage
  useEffect(() => {
    BarberFlowStore.saveState(dbState);
  }, [dbState]);

  const activeTenant =
    dbState.tenants.find((t: any) => t.id === dbState.activeTenantId) || dbState.tenants[0];

  // Actions
  const handleSelectTenant = (id: TenantId) => {
    setDbState((prev: any) => ({ ...prev, activeTenantId: id }));
  };

  const handleBookAppointment = (newAppt: any) => {
    const createdAppt = {
      ...newAppt,
      id: `apt-${Date.now()}`,
      qrCodeToken: `QR-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      createdAt: new Date().toISOString(),
    };

    setDbState((prev: any) => ({
      ...prev,
      appointments: [createdAppt, ...prev.appointments],
    }));
  };

  const handleUpdateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    setDbState((prev: any) => ({
      ...prev,
      appointments: prev.appointments.map((a: any) => (a.id === id ? { ...a, status } : a)),
    }));
  };

  const handleAddCustomer = (customer: any) => {
    setDbState((prev: any) => ({
      ...prev,
      customers: [customer, ...prev.customers],
    }));
  };

  const handleUpdateLeadStage = (leadId: string, stage: LeadStage) => {
    setDbState((prev: any) => ({
      ...prev,
      leads: prev.leads.map((l: any) => (l.id === leadId ? { ...l, stage } : l)),
    }));
  };

  const handleAddTransaction = (tx: any) => {
    setDbState((prev: any) => ({
      ...prev,
      transactions: [tx, ...prev.transactions],
    }));
  };

  const handleUpdateStock = (productId: string, newQty: number) => {
    setDbState((prev: any) => ({
      ...prev,
      products: prev.products.map((p: any) =>
        p.id === productId ? { ...p, currentStock: newQty } : p
      ),
    }));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {currentView === 'public' && (
        <LandingPage
          tenant={activeTenant}
          services={dbState.services}
          barbers={dbState.barbers}
          onBookAppointment={handleBookAppointment}
          onOpenAdmin={() => setCurrentView('admin')}
          onOpenCustomerApp={() => setCurrentView('customerApp')}
          onOpenTVMode={() => setCurrentView('tvMode')}
          onOpenBarberPortal={() => setCurrentView('barberPortal')}
        />
      )}

      {currentView === 'admin' && (
        <AdminDashboard
          tenants={dbState.tenants}
          activeTenantId={dbState.activeTenantId}
          onSelectTenant={handleSelectTenant}
          services={dbState.services}
          barbers={dbState.barbers}
          customers={dbState.customers}
          appointments={dbState.appointments}
          leads={dbState.leads}
          products={dbState.products}
          transactions={dbState.transactions}
          campaigns={dbState.campaigns}
          whatsappLogs={dbState.whatsappLogs}
          onAddAppointment={handleBookAppointment}
          onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
          onAddCustomer={handleAddCustomer}
          onUpdateLeadStage={handleUpdateLeadStage}
          onAddTransaction={handleAddTransaction}
          onUpdateStock={handleUpdateStock}
          onOpenPublicView={() => setCurrentView('public')}
          onOpenTVMode={() => setCurrentView('tvMode')}
        />
      )}

      {currentView === 'customerApp' && (
        <CustomerApp
          tenant={activeTenant}
          appointments={dbState.appointments}
          onOpenPublicBooking={() => setCurrentView('public')}
          onOpenAdmin={() => setCurrentView('admin')}
        />
      )}

      {currentView === 'barberPortal' && (
        <BarberPortal
          barbers={dbState.barbers[0]}
          appointments={dbState.appointments}
          onUpdateStatus={handleUpdateAppointmentStatus}
          onBackToAdmin={() => setCurrentView('admin')}
        />
      )}

      {currentView === 'tvMode' && (
        <ReceptionTV
          tenant={activeTenant}
          appointments={dbState.appointments}
          onBackToAdmin={() => setCurrentView('admin')}
        />
      )}
    </div>
  );
}
