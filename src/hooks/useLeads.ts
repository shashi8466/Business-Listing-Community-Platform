import { useState, useEffect, useCallback } from "react";
import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, doc, DocumentData } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { Lead, LeadStatus } from "@/types";

interface UseLeadsOptions {
  businessId?: string;
  userId?: string;
}

export const useLeads = (options: UseLeadsOptions = {}) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const db = await getFirebaseDb();
      
      let q;
      if (options.businessId) {
        q = query(
          collection(db, "leads"),
          where("businessId", "==", options.businessId),
          orderBy("createdAt", "desc")
        );
      } else if (options.userId) {
        q = query(
          collection(db, "leads"),
          where("userId", "==", options.userId),
          orderBy("createdAt", "desc")
        );
      } else {
        setLeads([]);
        setLoading(false);
        return;
      }
      
      const querySnapshot = await getDocs(q);
      const results: Lead[] = querySnapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data() as DocumentData;
        return {
          id: docSnapshot.id,
          businessId: data.businessId,
          businessName: data.businessName,
          userId: data.userId,
          name: data.name,
          email: data.email,
          phone: data.phone,
          message: data.message,
          status: data.status,
          notes: data.notes,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date()
        };
      });
      
      setLeads(results);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching leads:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [options.businessId, options.userId]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const createLead = async (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const db = await getFirebaseDb();
    
    const newLead = {
      ...lead,
      status: 'pending' as LeadStatus,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await addDoc(collection(db, "leads"), newLead);
    
    const createdLead = { ...newLead, id: docRef.id } as Lead;
    setLeads(prev => [createdLead, ...prev]);
    
    return docRef.id;
  };

  const updateLeadStatus = async (leadId: string, status: LeadStatus, notes?: string) => {
    const db = await getFirebaseDb();
    
    const updateData: Record<string, any> = {
      status,
      updatedAt: new Date()
    };
    
    if (notes !== undefined) {
      updateData.notes = notes;
    }
    
    await updateDoc(doc(db, "leads", leadId), updateData);
    
    setLeads(prev => prev.map(l => 
      l.id === leadId 
        ? { ...l, status, notes: notes ?? l.notes, updatedAt: new Date() }
        : l
    ));
  };

  const getLeadStats = () => {
    const total = leads.length;
    const pending = leads.filter(l => l.status === 'pending').length;
    const contacted = leads.filter(l => l.status === 'contacted').length;
    const closed = leads.filter(l => l.status === 'closed').length;
    
    return { total, pending, contacted, closed };
  };

  return { leads, loading, error, createLead, updateLeadStatus, getLeadStats, refetch: fetchLeads };
};
