import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, Search, AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface ConsumerGroup {
  name: string;
  members: number;
  status: "STABLE" | "REBALANCING" | "EMPTY";
  coordinator: string;
  lag: number;
  topics: string[];
  protocol: string;
}

interface ConsumerGroupsSectionProps {
  selectedEnv: string;
  selectedCluster: string;
}

const ConsumerGroupsSection = ({ selectedEnv, selectedCluster }: ConsumerGroupsSectionProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for consumer groups
  const mockConsumerGroups: ConsumerGroup[] = [
    {
      name: "user-analytics-service",
      members: 3,
      status: "STABLE",
      coordinator: "kafka-1:9092",
      lag: 125,
      topics: ["user-events", "user-profiles"],
      protocol: "range"
    },
    {
      name: "payment-processor",
      members: 5,
      status: "STABLE",
      coordinator: "kafka-2:9092",
      lag: 0,
      topics: ["payment-transactions"],
      protocol: "range"
    },
    {
      name: "notification-handler",
      members: 2,
      status: "REBALANCING",
      coordinator: "kafka-3:9092",
      lag: 2456,
      topics: ["notification-queue", "email-events"],
      protocol: "round-robin"
    },
    {
      name: "log-aggregator",
      members: 0,
      status: "EMPTY",
      coordinator: "kafka-1:9092",
      lag: 0,
      topics: ["system-logs"],
      protocol: "range"
    },
    {
      name: "ml-data-pipeline",
      members: 4,
      status: "STABLE",
      coordinator: "kafka-2:9092",
      lag: 45,
      topics: ["user-events", "system-logs", "payment-transactions"],
      protocol: "cooperative-sticky"
    }
  ];

  const filteredGroups = mockConsumerGroups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "STABLE":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "REBALANCING":
        return <Clock className="h-4 w-4 text-warning" />;
      case "EMPTY":
        return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Users className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "STABLE":
        return <Badge className="bg-success-light text-success border-success/20">{status}</Badge>;
      case "REBALANCING":
        return <Badge className="bg-warning-light text-warning border-warning/20">{status}</Badge>;
      case "EMPTY":
        return <Badge className="bg-muted text-muted-foreground">{status}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getLagBadge = (lag: number) => {
    if (lag === 0) {
      return <Badge className="bg-success-light text-success border-success/20">No Lag</Badge>;
    } else if (lag < 100) {
      return <Badge className="bg-warning-light text-warning border-warning/20">{lag}</Badge>;
    } else {
      return <Badge className="bg-error-light text-error border-error/20">{lag}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <Card className="bg-gradient-card shadow-medium border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Consumer Groups</CardTitle>
                <p className="text-muted-foreground">
                  {selectedCluster.toUpperCase()} • {selectedEnv.toUpperCase()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right text-sm">
                <div className="text-muted-foreground">Active Groups</div>
                <div className="font-bold text-xl">
                  {mockConsumerGroups.filter(g => g.status === "STABLE").length}
                </div>
              </div>
              <div className="text-right text-sm">
                <div className="text-muted-foreground">Total Lag</div>
                <div className="font-bold text-xl">
                  {mockConsumerGroups.reduce((sum, g) => sum + g.lag, 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Search and Filters */}
      <Card className="bg-background/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search consumer groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background"
              />
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              {filteredGroups.length} groups
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Consumer Groups List */}
      <div className="space-y-4">
        {filteredGroups.map((group) => (
          <Card key={group.name} className="bg-background/30 backdrop-blur-sm border-border/50 hover-scale transition-all duration-300 hover:shadow-medium">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(group.status)}
                  <div>
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">Protocol: {group.protocol}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(group.status)}
                  {getLagBadge(group.lag)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Members:</span>
                  <span className="ml-2 font-medium">{group.members}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Coordinator:</span>
                  <span className="ml-2 font-mono text-xs">{group.coordinator}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Lag:</span>
                  <span className={`ml-2 font-medium ${group.lag > 100 ? 'text-error' : group.lag > 0 ? 'text-warning' : 'text-success'}`}>
                    {group.lag.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Topics:</span>
                  <span className="ml-2 font-medium">{group.topics.length}</span>
                </div>
              </div>
              
              <div>
                <span className="text-muted-foreground text-sm">Subscribed Topics:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {group.topics.map((topic) => (
                    <Badge key={topic} variant="outline" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button variant="outline" size="sm" className="hover-scale">
                  View Details
                </Button>
                <Button variant="outline" size="sm" className="hover-scale">
                  Reset Offsets
                </Button>
                {group.status === "REBALANCING" && (
                  <Button variant="outline" size="sm" className="text-warning hover:text-warning hover:bg-warning/10">
                    Force Rebalance
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredGroups.length === 0 && (
        <Card className="bg-background/30 backdrop-blur-sm border-border/50">
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No consumer groups found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? "Try adjusting your search terms" : "No consumer groups are currently active"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ConsumerGroupsSection;