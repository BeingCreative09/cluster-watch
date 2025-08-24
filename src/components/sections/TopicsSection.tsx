import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MessageSquare as Topic, Search, Plus, Settings, Trash2 } from "lucide-react";

interface TopicData {
  name: string;
  partitions: number;
  replicas: number;
  size: string;
  messages: number;
  retention: string;
  status: "ACTIVE" | "INACTIVE";
}

interface TopicsSectionProps {
  selectedEnv: string;
  selectedCluster: string;
}

const TopicsSection = ({ selectedEnv, selectedCluster }: TopicsSectionProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for topics
  const mockTopics: TopicData[] = [
    {
      name: "user-events",
      partitions: 12,
      replicas: 3,
      size: "2.4 GB",
      messages: 1245678,
      retention: "7 days",
      status: "ACTIVE"
    },
    {
      name: "payment-transactions",
      partitions: 24,
      replicas: 3,
      size: "5.2 GB",
      messages: 892341,
      retention: "30 days",
      status: "ACTIVE"
    },
    {
      name: "system-logs",
      partitions: 6,
      replicas: 2,
      size: "1.8 GB",
      messages: 567234,
      retention: "3 days",
      status: "ACTIVE"
    },
    {
      name: "notification-queue",
      partitions: 8,
      replicas: 2,
      size: "0.9 GB",
      messages: 234567,
      retention: "1 day",
      status: "INACTIVE"
    }
  ];

  const filteredTopics = mockTopics.filter(topic =>
    topic.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <Card className="bg-gradient-card shadow-medium border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Topic className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Kafka Topics</CardTitle>
                <p className="text-muted-foreground">
                  {selectedCluster.toUpperCase()} • {selectedEnv.toUpperCase()}
                </p>
              </div>
            </div>
            <Button className="bg-gradient-primary shadow-medium hover-scale">
              <Plus className="h-4 w-4 mr-2" />
              Create Topic
            </Button>
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
                placeholder="Search topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background"
              />
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              {filteredTopics.length} topics
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTopics.map((topic) => (
          <Card key={topic.name} className="bg-background/30 backdrop-blur-sm border-border/50 hover-scale transition-all duration-300 hover:shadow-medium">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Topic className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg truncate" title={topic.name}>
                    {topic.name}
                  </CardTitle>
                </div>
                <Badge className={topic.status === "ACTIVE" ? "bg-success-light text-success border-success/20" : "bg-muted text-muted-foreground"}>
                  {topic.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Partitions:</span>
                  <span className="ml-2 font-medium">{topic.partitions}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Replicas:</span>
                  <span className="ml-2 font-medium">{topic.replicas}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Size:</span>
                  <span className="ml-2 font-medium">{topic.size}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Messages:</span>
                  <span className="ml-2 font-medium">{topic.messages.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="text-sm">
                <span className="text-muted-foreground">Retention:</span>
                <span className="ml-2 font-medium">{topic.retention}</span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1 hover-scale">
                  <Settings className="h-4 w-4 mr-1" />
                  Configure
                </Button>
                <Button variant="outline" size="sm" className="text-error hover:text-error hover:bg-error/10">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTopics.length === 0 && (
        <Card className="bg-background/30 backdrop-blur-sm border-border/50">
          <CardContent className="p-12 text-center">
            <Topic className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No topics found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? "Try adjusting your search terms" : "Create your first topic to get started"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TopicsSection;