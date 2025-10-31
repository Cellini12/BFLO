import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Invoice } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, DollarSign, Calendar, Printer, Download } from 'lucide-react';
import { format } from 'date-fns';

const statusColors = {
  paid: 'bg-green-100 text-green-800 border-green-200',
  sent: 'bg-blue-100 text-blue-800 border-blue-200',
  overdue: 'bg-red-100 text-red-800 border-red-200',
  draft: 'bg-gray-100 text-gray-800 border-gray-200',
};

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
    checkUrlParams();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      const userInvoices = await Invoice.filter({ customer_id: user.id }, '-issue_date');
      setInvoices(userInvoices);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const checkUrlParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const invoiceId = urlParams.get('id');
    if (invoiceId) {
      handleSelectInvoice(invoiceId);
    }
  };

  const handleSelectInvoice = async (invoiceId) => {
      if (invoices.length > 0) {
        const foundInvoice = invoices.find(inv => inv.id === invoiceId);
        setSelectedInvoice(foundInvoice);
      } else {
          // If invoices aren't loaded yet, fetch just the one
          const foundInvoice = await Invoice.get(invoiceId);
          setSelectedInvoice(foundInvoice);
      }
  };

  if (isLoading) {
    return <div className="p-8">Loading invoices...</div>;
  }

  return (
    <div className="p-4 lg:p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600">Review your billing history and payment status.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-white/60 backdrop-blur border-0 shadow-lg">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow 
                        key={invoice.id} 
                        onClick={() => setSelectedInvoice(invoice)}
                        className="cursor-pointer hover:bg-gray-50"
                      >
                        <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                        <TableCell>{format(new Date(invoice.issue_date), 'MMM d, yyyy')}</TableCell>
                        <TableCell>{format(new Date(invoice.due_date), 'MMM d, yyyy')}</TableCell>
                        <TableCell>${invoice.total_amount.toFixed(2)}</TableCell>
                        <TableCell><Badge className={statusColors[invoice.status]}>{invoice.status}</Badge></TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">View</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {invoices.length === 0 && (
                  <div className="text-center p-12">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No invoices found.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            {selectedInvoice ? (
              <Card className="bg-white/60 backdrop-blur border-0 shadow-lg sticky top-6">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Invoice {selectedInvoice.invoice_number}</CardTitle>
                      <p className="text-gray-500 text-sm">Issued: {format(new Date(selectedInvoice.issue_date), 'MMM d, yyyy')}</p>
                    </div>
                    <Badge className={statusColors[selectedInvoice.status]}>{selectedInvoice.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {selectedInvoice.line_items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.description}</span>
                        <span className="font-medium">${item.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${selectedInvoice.total_amount.toFixed(2)}</span>
                  </div>
                  {selectedInvoice.status === 'sent' && (
                    <Button className="w-full">
                      <DollarSign className="w-4 h-4 mr-2" /> Pay Now
                    </Button>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" className="w-full">
                      <Download className="w-4 h-4 mr-2" /> Download PDF
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Printer className="w-4 h-4 mr-2" /> Print
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white/60 backdrop-blur border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">Select an invoice to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}