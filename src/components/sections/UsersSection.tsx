import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { UserCheck, Search, Plus, Edit, Shield, Trash2 } from "lucide-react";

interface KafkaUser {
  username: string;
  type: "SERVICE_ACCOUNT" | "USER";
  status: "ACTIVE" | "INACTIVE";
  permissions: string[];
  createdAt: string;
  lastActive: string;
  description?: string;
}

interface UsersSectionProps {
  selectedEnv: string;
  selectedCluster: string;
}

const UsersSection = ({ selectedEnv, selectedCluster }: UsersSectionProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for Kafka users
  const mockUsers: KafkaUser[] = [
    {
      username: "analytics-service",
      type: "SERVICE_ACCOUNT",
      status: "ACTIVE",
      permissions: ["READ:user-events", "READ:user-profiles"],
      createdAt: "2024-01-15",
      lastActive: "2024-01-20",
      description: "Analytics microservice consumer"
    },
    {
      username: "payment-processor",
      type: "SERVICE_ACCOUNT",
      status: "ACTIVE",
      permissions: ["READ:payment-transactions", "WRITE:payment-events"],
      createdAt: "2024-01-10",
      lastActive: "2024-01-20",
      description: "Payment processing service"
    },
    {
      username: "john.doe",
      type: "USER",
      status: "ACTIVE",
      permissions: ["READ:*", "WRITE:test-*"],
      createdAt: "2024-01-05",
      lastActive: "2024-01-19",
      description: "Senior Developer"
    },
    {
      username: "log-shipper",
      type: "SERVICE_ACCOUNT",
      status: "INACTIVE",
      permissions: ["WRITE:system-logs"],
      createdAt: "2023-12-20",
      lastActive: "2024-01-15",
      description: "Log aggregation service"
    },
    {
      username: "notification-service",
      type: "SERVICE_ACCOUNT",
      status: "ACTIVE",
      permissions: ["READ:notification-queue", "WRITE:email-events"],
      createdAt: "2024-01-12",
      lastActive: "2024-01-20",
      description: "Notification processing service"
    }
  ];

  const filteredUsers = mockUsers.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-success-light text-success border-success/20">{status}</Badge>;
      case "INACTIVE":
        return <Badge className="bg-muted text-muted-foreground">{status}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "SERVICE_ACCOUNT":
        return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Service Account</Badge>;
      case "USER":
        return <Badge variant="outline" className="bg-secondary/10 text-secondary-foreground border-secondary/20">User</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
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
                <UserCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Kafka Users</CardTitle>
                <p className="text-muted-foreground">
                  {selectedCluster.toUpperCase()} • {selectedEnv.toUpperCase()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right text-sm">
                <div className="text-muted-foreground">Active Users</div>
                <div className="font-bold text-xl">
                  {mockUsers.filter(u => u.status === "ACTIVE").length}
                </div>
              </div>
              <Button className="bg-gradient-primary shadow-medium hover-scale">
                <Plus className="h-4 w-4 mr-2" />
                Create User
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
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background"
              />
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              {filteredUsers.length} users
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <Card key={user.username} className="bg-background/30 backdrop-blur-sm border-border/50 hover-scale transition-all duration-300 hover:shadow-medium">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <UserCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{user.username}</CardTitle>
                    {user.description && (
                      <p className="text-sm text-muted-foreground">{user.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getTypeBadge(user.type)}
                  {getStatusBadge(user.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <span className="ml-2 font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Active:</span>
                  <span className="ml-2 font-medium">{new Date(user.lastActive).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Permissions:</span>
                  <span className="ml-2 font-medium">{user.permissions.length}</span>
                </div>
              </div>
              
              <div>
                <span className="text-muted-foreground text-sm">Permissions:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {user.permissions.slice(0, 3).map((permission, index) => (
                    <Badge key={index} variant="outline" className="text-xs font-mono">
                      {permission}
                    </Badge>
                  ))}
                  {user.permissions.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{user.permissions.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button variant="outline" size="sm" className="hover-scale">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="hover-scale">
                  <Shield className="h-4 w-4 mr-1" />
                  Permissions
                </Button>
                <Button variant="outline" size="sm" className="text-error hover:text-error hover:bg-error/10">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <Card className="bg-background/30 backdrop-blur-sm border-border/50">
          <CardContent className="p-12 text-center">
            <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No users found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? "Try adjusting your search terms" : "Create your first user to get started"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UsersSection;