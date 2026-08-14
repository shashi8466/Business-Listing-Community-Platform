import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
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
      
      let query = supabase
        .from("leads")
        .select("*, businesses(name)")
        .order("created_at", { ascending: false });

      if (options.businessId) {
        query = query.eq("business_id", options.businessId);
      } else if (options.userId) {
        // The new Supabase schema doesn't have user_id on leads. 
        // We will just return empty for now if this is requested.
        setLeads([]);
        setLoading(false);
        return;
      } else {
        setLeads([]);
        setLoading(false);
        return;
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      
      if (data) {
        const results: Lead[] = data.map((d: any) => ({
          id: d.id,
          businessId: d.business_id,
          businessName: d.businesses?.name || "Unknown Business",
          name: d.name,
          email: d.email,
          phone: d.phone || "",
          message: d.message || "",
          status: (d.status === 'new' ? 'pending' : d.status) as LeadStatus, // Map new to pending
          notes: d.metadata?.notes || "",
          createdAt: new Date(d.created_at),
          updatedAt: new Date(d.updated_at)
        }));
        
        setLeads(results);
      }
      setError(null);
    } catch (err: any) {
      console.error("Error fetching leads:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [options.businessId, options.userId]);

  useEffect(() => {
    let mounted = true;
    if (mounted) fetchLeads();
    return () => { mounted = false; };
  }, [fetchLeads]);

  const createLead = async (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const { data, error } = await supabase
      .from("leads")
      .insert({
        business_id: lead.businessId,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        message: lead.message,
        status: 'new'
      })
      .select("*, businesses(name)")
      .single();
      
    if (error) throw error;
    
    if (data) {
      const createdLead: Lead = {
        id: data.id,
        businessId: data.business_id,
        businessName: data.businesses?.name || lead.businessName || "Unknown Business",
        name: data.name,
        email: data.email,
        phone: data.phone || "",
        message: data.message || "",
        status: 'pending',
        notes: "",
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
      
      setLeads(prev => [createdLead, ...prev]);
      return data.id;
    }
  };

  const updateLeadStatus = async (leadId: string, status: LeadStatus, notes?: string) => {
    const updateData: any = {
      status: status === 'pending' ? 'new' : status
    };
    
    if (notes !== undefined) {
      // In Supabase schema, notes might be in metadata jsonb
      updateData.metadata = { notes };
    }
    
    const { error } = await supabase
      .from("leads")
      .update(updateData)
      .eq("id", leadId);
      
    if (error) throw error;
    
    setLeads(prev => prev.map(lead => {
      if (lead.id === leadId) {
        return {
          ...lead,
          status,
          ...(notes !== undefined ? { notes } : {})
        };
      }
      return lead;
    }));
  };

  const getLeadStats = () => {
    return {
      total: leads.length,
      new: leads.filter(l => l.status === 'pending').length,
      contacted: leads.filter(l => l.status === 'contacted').length,
      converted: leads.filter(l => l.status === 'converted').length
    };
  };

  return { leads, loading, error, createLead, updateLeadStatus, getLeadStats, refetch: fetchLeads };
};
