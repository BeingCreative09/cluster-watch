import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  RefreshCw, 
  Server, 
  Database, 
  Settings, 
  Activity, 
  Clock,
  Globe,
  AlertTriangle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BrokerDetail {
  id: number;
  host: string;
  isController: boolean;
  status: string;
}

interface ZookeeperDetail {
  id: number;
  host: string;
  mode: string;
  status: string;
}

interface HealthStatus {
  status: "HEALTHY" | "UNHEALTHY" | "UNREACHABLE";
  expected_brokers?: number;
  active_brokers?: number;
  expected_nodes?: number;
  active_nodes?: number;
  cluster_id?: string;
  broker_details?: BrokerDetail[];
  zookeeper_details?: ZookeeperDetail[];
  error_message?: string | null;
}

interface ClusterHealth {
  timestamp: string;
  environment: string;
  cluster_name: string;
  cluster_description: string;
  kafka: HealthStatus;
  zookeeper: HealthStatus;
}

const KafkaDashboard = () => {
  const [clusters, setClusters] = useState<ClusterHealth[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiUrl, setApiUrl] = useState("http://localhost:8080");
  const [autoRefresh, setAutoRefresh] = useState<Record<string, boolean>>({});
  const [refreshInterval, setRefreshInterval] = useState<Record<string, number>>({});
  const [environments, setEnvironments] = useState<string[]>([]);
  const [selectedEnv, setSelectedEnv] = useState<string>("dev");

  // Mock data for demonstration
  const mockClusters: ClusterHealth[] = [
    {
      timestamp: new Date().toISOString(),
      environment: "dev",
      cluster_name: "hcp",
      cluster_description: "Development HCP Kafka Cluster",
      kafka: {
        status: "HEALTHY",
        expected_brokers: 3,
        active_brokers: 3,
        cluster_id: "4YYgtjE_RKiJ_rDWp5MDbw",
        broker_details: [
          { id: 0, host: "devkafka1.ril.com:9093", isController: true, status: "ACTIVE" },
          { id: 1, host: "devkafka2.ril.com:9093", isController: false, status: "ACTIVE" },
          { id: 2, host: "devkafka3.ril.com:9093", isController: false, status: "ACTIVE" }
        ],
        error_message: null
      },
      zookeeper: {
        status: "HEALTHY",
        expected_nodes: 3,
        active_nodes: 3,
        zookeeper_details: [
          { id: 1, host: "devzk1.ril.com:2181", mode: "leader", status: "ACTIVE" },
          { id: 2, host: "devzk2.ril.com:2181", mode: "follower", status: "ACTIVE" },
          { id: 3, host: "devzk3.ril.com:2181", mode: "follower", status: "ACTIVE" }
        ],
        error_message: null
      }
    },
    {
      timestamp: new Date().toISOString(),
      environment: "qas",
      cluster_name: "hcp",
      cluster_description: "QA HCP Kafka Cluster",
      kafka: {
        status: "UNHEALTHY",
        expected_brokers: 3,
        active_brokers: 2,
        cluster_id: "5ZZgtjE_RKiJ_rDWp5MDbx",
        broker_details: [
          { id: 0, host: "qakafka1.ril.com:9093", isController: true, status: "ACTIVE" },
          { id: 1, host: "qakafka2.ril.com:9093", isController: false, status: "ACTIVE" },
          { id: 2, host: "qakafka3.ril.com:9093", isController: false, status: "DOWN" }
        ],
        error_message: "Broker 2 is not responding"
      },
      zookeeper: {
        status: "HEALTHY",
        expected_nodes: 3,
        active_nodes: 3,
        zookeeper_details: [
          { id: 1, host: "qazk1.ril.com:2181", mode: "leader", status: "ACTIVE" },
          { id: 2, host: "qazk2.ril.com:2181", mode: "follower", status: "ACTIVE" },
          { id: 3, host: "qazk3.ril.com:2181", mode: "follower", status: "ACTIVE" }
        ],
        error_message: null
      }
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "HEALTHY":
        return <CheckCircle className="h-5 w-5 text-success" />;
      case "UNHEALTHY":
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case "UNREACHABLE":
        return <XCircle className="h-5 w-5 text-error" />;
      default:
        return <Activity className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "font-semibold";
    switch (status) {
      case "HEALTHY":
        return <Badge className={cn(baseClasses, "bg-success-light text-success border-success/20")}>{status}</Badge>;
      case "UNHEALTHY":
        return <Badge className={cn(baseClasses, "bg-warning-light text-warning border-warning/20")}>{status}</Badge>;
      case "UNREACHABLE":
        return <Badge className={cn(baseClasses, "bg-error-light text-error border-error/20")}>{status}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const toggleAutoRefresh = (clusterKey: string) => {
    setAutoRefresh(prev => ({
      ...prev,
      [clusterKey]: !prev[clusterKey]
    }));
  };

  const updateRefreshInterval = (clusterKey: string, interval: number) => {
    setRefreshInterval(prev => ({
      ...prev,
      [clusterKey]: interval
    }));
  };

  const refreshCluster = async (env: string, cluster: string) => {
    setLoading(true);
    try {
      // In real implementation, make API call here
      // const response = await fetch(`${apiUrl}/api/health/${env}/${cluster}`);
      // const data = await response.json();
      console.log(`Refreshing ${env}/${cluster}`);
    } catch (error) {
      console.error("Failed to refresh cluster:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load mock data
    setClusters(mockClusters);
    setEnvironments(["dev", "qas", "prod"]);
    
    // Initialize auto-refresh settings
    const initialAutoRefresh: Record<string, boolean> = {};
    const initialInterval: Record<string, number> = {};
    
    mockClusters.forEach(cluster => {
      const key = `${cluster.environment}-${cluster.cluster_name}`;
      initialAutoRefresh[key] = true; // Auto-refresh enabled by default
      initialInterval[key] = 30; // 30 seconds default
    });
    
    setAutoRefresh(initialAutoRefresh);
    setRefreshInterval(initialInterval);
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    const intervals: Record<string, NodeJS.Timeout> = {};

    Object.entries(autoRefresh).forEach(([clusterKey, enabled]) => {
      if (enabled) {
        const interval = refreshInterval[clusterKey] || 30;
        const [env, cluster] = clusterKey.split('-');
        
        intervals[clusterKey] = setInterval(() => {
          refreshCluster(env, cluster);
        }, interval * 1000);
      }
    });

    return () => {
      Object.values(intervals).forEach(clearInterval);
    };
  }, [autoRefresh, refreshInterval, apiUrl]);

  const filteredClusters = clusters.filter(cluster => cluster.environment === selectedEnv);

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Kafka Health Monitor
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time monitoring for Kafka and Zookeeper clusters
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <select 
              value={selectedEnv} 
              onChange={(e) => setSelectedEnv(e.target.value)}
              className="bg-card border border-border rounded-md px-3 py-1 text-sm"
            >
              {environments.map(env => (
                <option key={env} value={env}>{env.toUpperCase()}</option>
              ))}
            </select>
          </div>
          
          <Button 
            onClick={() => filteredClusters.forEach(cluster => 
              refreshCluster(cluster.environment, cluster.cluster_name)
            )}
            disabled={loading}
            size="sm"
            className="bg-gradient-primary shadow-medium"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Refresh All
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      <Card className="bg-gradient-card shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5" />
            Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="api-url">Backend API URL</Label>
              <Input
                id="api-url"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="http://localhost:8080"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter your Kafka Health Check API endpoint
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clusters Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredClusters.map((cluster) => {
          const clusterKey = `${cluster.environment}-${cluster.cluster_name}`;
          const isAutoRefreshEnabled = autoRefresh[clusterKey];
          const currentInterval = refreshInterval[clusterKey] || 30;

          return (
            <Card key={clusterKey} className="bg-gradient-card shadow-medium hover:shadow-strong transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Server className="h-5 w-5 text-primary" />
                      {cluster.cluster_name.toUpperCase()}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {cluster.cluster_description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAutoRefresh(clusterKey)}
                      className={cn(
                        "transition-colors",
                        isAutoRefreshEnabled && "bg-success-light border-success text-success"
                      )}
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      Auto {isAutoRefreshEnabled ? 'ON' : 'OFF'}
                    </Button>
                    {isAutoRefreshEnabled && (
                      <select
                        value={currentInterval}
                        onChange={(e) => updateRefreshInterval(clusterKey, Number(e.target.value))}
                        className="bg-card border border-border rounded px-2 py-1 text-xs"
                      >
                        <option value={10}>10s</option>
                        <option value={30}>30s</option>
                        <option value={60}>1m</option>
                        <option value={300}>5m</option>
                      </select>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="kafka">Kafka</TabsTrigger>
                    <TabsTrigger value="zookeeper">Zookeeper</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(cluster.kafka.status)}
                          <span className="font-medium">Kafka</span>
                        </div>
                        {getStatusBadge(cluster.kafka.status)}
                        <p className="text-xs text-muted-foreground">
                          {cluster.kafka.active_brokers}/{cluster.kafka.expected_brokers} brokers active
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(cluster.zookeeper.status)}
                          <span className="font-medium">Zookeeper</span>
                        </div>
                        {getStatusBadge(cluster.zookeeper.status)}
                        <p className="text-xs text-muted-foreground">
                          {cluster.zookeeper.active_nodes}/{cluster.zookeeper.expected_nodes} nodes active
                        </p>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        Last updated: {new Date(cluster.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="kafka" className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        Brokers Status
                      </h4>
                      {getStatusBadge(cluster.kafka.status)}
                    </div>
                    
                    <div className="space-y-2">
                      {cluster.kafka.broker_details?.map((broker) => (
                        <div key={broker.id} className="flex items-center justify-between p-2 bg-secondary/50 rounded-md">
                          <div>
                            <p className="text-sm font-medium">Broker {broker.id}</p>
                            <p className="text-xs text-muted-foreground">{broker.host}</p>
                          </div>
                          <div className="text-right">
                            <Badge 
                              variant={broker.status === "ACTIVE" ? "default" : "destructive"}
                              className="text-xs"
                            >
                              {broker.status}
                            </Badge>
                            {broker.isController && (
                              <p className="text-xs text-success mt-1">Controller</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {cluster.kafka.error_message && (
                      <div className="p-2 bg-error-light rounded-md border border-error/20">
                        <p className="text-xs text-error">{cluster.kafka.error_message}</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="zookeeper" className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        Ensemble Status
                      </h4>
                      {getStatusBadge(cluster.zookeeper.status)}
                    </div>
                    
                    <div className="space-y-2">
                      {cluster.zookeeper.zookeeper_details?.map((node) => (
                        <div key={node.id} className="flex items-center justify-between p-2 bg-secondary/50 rounded-md">
                          <div>
                            <p className="text-sm font-medium">Node {node.id}</p>
                            <p className="text-xs text-muted-foreground">{node.host}</p>
                          </div>
                          <div className="text-right">
                            <Badge 
                              variant={node.status === "ACTIVE" ? "default" : "destructive"}
                              className="text-xs"
                            >
                              {node.status}
                            </Badge>
                            <p className="text-xs text-primary mt-1 capitalize">{node.mode}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {cluster.zookeeper.error_message && (
                      <div className="p-2 bg-error-light rounded-md border border-error/20">
                        <p className="text-xs text-error">{cluster.zookeeper.error_message}</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredClusters.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Server className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No clusters found</h3>
            <p className="text-muted-foreground">
              No Kafka clusters are available for the selected environment.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default KafkaDashboard;