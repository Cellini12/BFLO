
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  DollarSign, 
  Calendar, 
  ArrowRight,
  Info
} from "lucide-react";
import { format } from "date-fns";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  sent: "bg-blue-100 text-blue-800",
  viewed: "bg-purple-100 text-purple-800"
};

export default function RecentQuotes({ quotes, isLoading }) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1,2].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Recent Quotes</CardTitle>
        <Link to={createPageUrl("Quotes")}>
          <Button variant="outline" size="sm">
            View All
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {quotes.length === 0 ? (
          <div className="text-center py-8">
            <Info className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No pending quotes found.</p>
            <Link to={createPageUrl("Quotes?action=request")}>
              <Button>
                Request A Quote
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {quotes.slice(0, 3).map((quote) => (
               <Link to={createPageUrl(`Quotes?id=${quote.id}`)} key={quote.id} className="block">
                  <div className="p-4 border rounded-xl hover:bg-muted/50 hover:border-primary/50 transition-colors duration-200">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground">{quote.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{quote.description}</p>
                      </div>
                      <Badge className={`${statusColors[quote.status]}`} variant="secondary">
                        {quote.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1 font-semibold text-green-600">
                          <DollarSign className="w-4 h-4" />
                          {quote.amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        {quote.valid_until && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Valid until {format(new Date(quote.valid_until), "MMM d, yyyy")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
