import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Users, Mail, Phone, Calendar, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

interface AdminLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: string;
  created_at: string;
  business_name: string;
}

const AdminLeadsPage = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const { data, error } = await supabase
          .from("leads")
          .select("*, businesses(name)")
          .order("created_at", { ascending: false });

        if (error) throw error;
        
        if (data) {
          const formattedLeads = data.map((d: any) => ({
            id: d.id,
            name: d.name,
            email: d.email,
            phone: d.phone || "N/A",
            message: d.message || "N/A",
            status: d.status,
            created_at: d.created_at,
            business_name: d.businesses?.name || "Unknown Business"
          }));
          setLeads(formattedLeads);
        }
      } catch (error) {
        console.error("Error fetching leads:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, []);

  return (
    <>
      <Helmet>
        <title>Lead Management | Admin | d4desi</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            Lead Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Oversee platform-wide leads and inquiries
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading leads...</div>
          ) : leads.length === 0 ? (
            <div className="p-16 text-center">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-semibold mb-2">No Leads Found</h2>
              <p className="text-muted-foreground">There are currently no leads in the system.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Business</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <p className="font-medium">{lead.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Mail className="h-3 w-3" /> {lead.email}
                      </div>
                      {lead.phone !== "N/A" && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Phone className="h-3 w-3" /> {lead.phone}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{lead.business_name}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[250px] truncate">
                      {lead.message}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        lead.status === 'new' ? 'default' :
                        lead.status === 'contacted' ? 'secondary' :
                        lead.status === 'converted' ? 'outline' : 'default'
                      } className={lead.status === 'new' ? 'bg-amber-100 text-amber-700' : ''}>
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {new Date(lead.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default AdminLeadsPage;
