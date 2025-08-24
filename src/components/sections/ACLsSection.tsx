import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Shield, Search, Plus, Edit, Trash2, Lock } from "lucide-react";

interface ACLRule {
  id: string;
  resourceType: "TOPIC" | "GROUP" | "CLUSTER";
  resourceName: string;
  principal: string;
  operation: "READ" | "WRITE" | "CREATE" | "DELETE" | "ALTER" | "DESCRIBE" | "ALL";
  permission: "ALLOW" | "DENY";
  host: string;
  createdAt: string;
}

interface ACLsSectionProps {
  selectedEnv: string;
  selectedCluster: string;
}

const ACLsSection = ({ selectedEnv, selectedCluster }: ACLsSectionProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for ACL rules
  const mockACLs: ACLRule[] = [
    {
      id: "acl-001",
      resourceType: "TOPIC",
      resourceName: "user-events",
      principal: "User:analytics-service",
      operation: "READ",
      permission: "ALLOW",
      host: "*",
      createdAt: "2024-01-15"
    },
    {
      id: "acl-002",
      resourceType: "TOPIC",
      resourceName: "payment-transactions",
      principal: "User:payment-processor",
      operation: "READ",
      permission: "ALLOW",
      host: "10.0.1.*",
      createdAt: "2024-01-10"
    },
    {
      id: "acl-003",
      resourceType: "TOPIC",
      resourceName: "payment-events",
      principal: "User:payment-processor",
      operation: "WRITE",
      permission: "ALLOW",
      host: "10.0.1.*",
      createdAt: "2024-01-10"
    },
    {
      id: "acl-004",
      resourceType: "GROUP",
      resourceName: "analytics-group",
      principal: "User:analytics-service",
      operation: "READ",
      permission: "ALLOW",
      host: "*",
      createdAt: "2024-01-15"
    },
    {
      id: "acl-005",
      resourceType: "TOPIC",
      resourceName: "sensitive-data",
      principal: "User:unauthorized-service",
      operation: "ALL",
      permission: "DENY",
      host: "*",
      createdAt: "2024-01-12"
    },
    {
      id: "acl-006",
      resourceType: "CLUSTER",
      resourceName: "kafka-cluster",
      principal: "User:john.doe",
      operation: "DESCRIBE",
      permission: "ALLOW",
      host: "*",
      createdAt: "2024-01-05"
    },
    {
      id: "acl-007",
      resourceType: "TOPIC",
      resourceName: "test-*",
      principal: "User:john.doe",
      operation: "ALL",
      permission: "ALLOW",
      host: "*",
      createdAt: "2024-01-05"
    }
  ];

  const filteredACLs = mockACLs.filter(acl =>
    acl.resourceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acl.principal.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acl.operation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getResourceTypeBadge = (type: string) => {
    switch (type) {
      case "TOPIC":
        return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Topic</Badge>;
      case "GROUP":
        return <Badge variant="outline" className="bg-secondary/10 text-secondary-foreground border-secondary/20">Group</Badge>;
      case "CLUSTER":
        return <Badge variant="outline" className="bg-accent/10 text-accent-foreground border-accent/20">Cluster</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const getPermissionBadge = (permission: string) => {
    switch (permission) {
      case "ALLOW":
        return <Badge className="bg-success-light text-success border-success/20">{permission}</Badge>;
      case "DENY":
        return <Badge className="bg-error-light text-error border-error/20">{permission}</Badge>;
      default:
        return <Badge variant="secondary">{permission}</Badge>;
    }
  };

  const getOperationBadge = (operation: string) => {
    const colors = {
      READ: "bg-blue-100 text-blue-700 border-blue-200",
      write: "bg-green-100 text-green-700 border-green-200",
      create: "bg-purple-100 text-purple-700 border-purple-200",
      delete: "bg-red-100 text-red-700 border-red-200",
      alter: "bg-orange-100 text-orange-700 border-orange-200",
      describe: "bg-gray-100 text-gray-700 border-gray-200",
      all: "bg-indigo-100 text-indigo-700 border-indigo-200"
    };
    
    const colorClass = colors[operation.toLowerCase() as keyof typeof colors] || "bg-gray-100 text-gray-700 border-gray-200";
    
    return <Badge className={`${colorClass} text-xs`}>{operation}</Badge>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <Card className="bg-gradient-card shadow-medium border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Access Control Lists (ACLs)</CardTitle>
                <p className="text-muted-foreground">
                  {selectedCluster.toUpperCase()} • {selectedEnv.toUpperCase()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right text-sm">
                <div className="text-muted-foreground">Total Rules</div>
                <div className="font-bold text-xl">{mockACLs.length}</div>
              </div>
              <div className="text-right text-sm">
                <div className="text-muted-foreground">Allow Rules</div>
                <div className="font-bold text-xl text-success">
                  {mockACLs.filter(acl => acl.permission === "ALLOW").length}
                </div>
              </div>
              <Button className="bg-gradient-primary shadow-medium hover-scale">
                <Plus className="h-4 w-4 mr-2" />
                Create ACL
              </Button>
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
                placeholder="Search ACL rules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background"
              />
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              {filteredACLs.length} rules
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* ACL Rules List */}
      <div className="space-y-4">
        {filteredACLs.map((acl) => (
          <Card key={acl.id} className="bg-background/30 backdrop-blur-sm border-border/50 hover-scale transition-all duration-300 hover:shadow-medium">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Lock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{acl.resourceName}</CardTitle>
                    <p className="text-sm text-muted-foreground">{acl.principal}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getResourceTypeBadge(acl.resourceType)}
                  {getOperationBadge(acl.operation)}
                  {getPermissionBadge(acl.permission)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Resource Type:</span>
                  <span className="ml-2 font-medium">{acl.resourceType}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Operation:</span>
                  <span className="ml-2 font-medium">{acl.operation}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Host:</span>
                  <span className="ml-2 font-mono text-xs">{acl.host}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <span className="ml-2 font-medium">{new Date(acl.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Resource Name:</span>
                  <span className="ml-2 font-mono text-xs bg-muted/50 px-2 py-1 rounded">
                    {acl.resourceName}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Principal:</span>
                  <span className="ml-2 font-mono text-xs bg-muted/50 px-2 py-1 rounded">
                    {acl.principal}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button variant="outline" size="sm" className="hover-scale">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="hover-scale">
                  View Details
                </Button>
                <Button variant="outline" size="sm" className="text-error hover:text-error hover:bg-error/10">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredACLs.length === 0 && (
        <Card className="bg-background/30 backdrop-blur-sm border-border/50">
          <CardContent className="p-12 text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No ACL rules found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? "Try adjusting your search terms" : "Create your first ACL rule to get started"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ACLsSection;