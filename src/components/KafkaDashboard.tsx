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

  // Mock data for demonstration - Multiple cluster types per environment
  const mockClusters: ClusterHealth[] = [
    // DEV Environment Clusters
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
          { id: 0, host: "devhcp1.ril.com:9093", isController: true, status: "ACTIVE" },
          { id: 1, host: "devhcp2.ril.com:9093", isController: false, status: "ACTIVE" },
          { id: 2, host: "devhcp3.ril.com:9093", isController: false, status: "ACTIVE" }
        ],
        error_message: null
      },
      zookeeper: {
        status: "HEALTHY",
        expected_nodes: 3,
        active_nodes: 3,
        zookeeper_details: [
          { id: 1, host: "devhcp-zk1.ril.com:2181", mode: "leader", status: "ACTIVE" },
          { id: 2, host: "devhcp-zk2.ril.com:2181", mode: "follower", status: "ACTIVE" },
          { id: 3, host: "devhcp-zk3.ril.com:2181", mode: "follower", status: "ACTIVE" }
        ],
        error_message: null
      }
    },
    {
      timestamp: new Date().toISOString(),
      environment: "dev",
      cluster_name: "rfh",
      cluster_description: "Development RFH Kafka Cluster",
      kafka: {
        status: "HEALTHY",
        expected_brokers: 2,
        active_brokers: 2,
        cluster_id: "3XXgtjE_RKiJ_rDWp5MDbr",
        broker_details: [
          { id: 0, host: "devrfh1.ril.com:9093", isController: true, status: "ACTIVE" },
          { id: 1, host: "devrfh2.ril.com:9093", isController: false, status: "ACTIVE" }
        ],
        error_message: null
      },
      zookeeper: {
        status: "HEALTHY",
        expected_nodes: 2,
        active_nodes: 2,
        zookeeper_details: [
          { id: 1, host: "devrfh-zk1.ril.com:2181", mode: "leader", status: "ACTIVE" },
          { id: 2, host: "devrfh-zk2.ril.com:2181", mode: "follower", status: "ACTIVE" }
        ],
        error_message: null
      }
    },
    {
      timestamp: new Date().toISOString(),
      environment: "dev",
      cluster_name: "jiobp",
      cluster_description: "Development JIOBP Kafka Cluster",
      kafka: {
        status: "UNHEALTHY",
        expected_brokers: 3,
        active_brokers: 2,
        cluster_id: "6WWgtjE_RKiJ_rDWp5MDbj",
        broker_details: [
          { id: 0, host: "devjiobp1.ril.com:9093", isController: true, status: "ACTIVE" },
          { id: 1, host: "devjiobp2.ril.com:9093", isController: false, status: "ACTIVE" },
          { id: 2, host: "devjiobp3.ril.com:9093", isController: false, status: "DOWN" }
        ],
        error_message: "Broker 2 connection timeout"
      },
      zookeeper: {
        status: "HEALTHY",
        expected_nodes: 3,
        active_nodes: 3,
        zookeeper_details: [
          { id: 1, host: "devjiobp-zk1.ril.com:2181", mode: "leader", status: "ACTIVE" },
          { id: 2, host: "devjiobp-zk2.ril.com:2181", mode: "follower", status: "ACTIVE" },
          { id: 3, host: "devjiobp-zk3.ril.com:2181", mode: "follower", status: "ACTIVE" }
        ],
        error_message: null
      }
    },
    // QAS Environment Clusters
    {
      timestamp: new Date().toISOString(),
      environment: "qas",
      cluster_name: "hcp",
      cluster_description: "QA HCP Kafka Cluster",
      kafka: {
        status: "HEALTHY",
        expected_brokers: 3,
        active_brokers: 3,
        cluster_id: "5ZZgtjE_RKiJ_rDWp5MDbx",
        broker_details: [
          { id: 0, host: "qahcp1.ril.com:9093", isController: true, status: "ACTIVE" },
          { id: 1, host: "qahcp2.ril.com:9093", isController: false, status: "ACTIVE" },
          { id: 2, host: "qahcp3.ril.com:9093", isController: false, status: "ACTIVE" }
        ],
        error_message: null
      },
      zookeeper: {
        status: "HEALTHY",
        expected_nodes: 3,
        active_nodes: 3,
        zookeeper_details: [
          { id: 1, host: "qahcp-zk1.ril.com:2181", mode: "leader", status: "ACTIVE" },
          { id: 2, host: "qahcp-zk2.ril.com:2181", mode: "follower", status: "ACTIVE" },
          { id: 3, host: "qahcp-zk3.ril.com:2181", mode: "follower", status: "ACTIVE" }
        ],
        error_message: null
      }
    },
    {
      timestamp: new Date().toISOString(),
      environment: "qas",
      cluster_name: "rfh",
      cluster_description: "QA RFH Kafka Cluster",
      kafka: {
        status: "UNREACHABLE",
        expected_brokers: 3,
        active_brokers: 0,
        cluster_id: null,
        broker_details: [],
        error_message: "Unable to connect to cluster - network timeout"
      },
      zookeeper: {
        status: "UNREACHABLE",
        expected_nodes: 3,
        active_nodes: 0,
        zookeeper_details: [],
        error_message: "Connection refused to all Zookeeper nodes"
      }
    },
    // PROD Environment Clusters
    {
      timestamp: new Date().toISOString(),
      environment: "prod",
      cluster_name: "hcp",
      cluster_description: "Production HCP Kafka Cluster",
      kafka: {
        status: "HEALTHY",
        expected_brokers: 5,
        active_brokers: 5,
        cluster_id: "7AAgtjE_RKiJ_rDWp5MDbp",
        broker_details: [
          { id: 0, host: "prodhcp1.ril.com:9093", isController: false, status: "ACTIVE" },
          { id: 1, host: "prodhcp2.ril.com:9093", isController: true, status: "ACTIVE" },
          { id: 2, host: "prodhcp3.ril.com:9093", isController: false, status: "ACTIVE" },
          { id: 3, host: "prodhcp4.ril.com:9093", isController: false, status: "ACTIVE" },
          { id: 4, host: "prodhcp5.ril.com:9093", isController: false, status: "ACTIVE" }
        ],
        error_message: null
      },
      zookeeper: {
        status: "HEALTHY",
        expected_nodes: 5,
        active_nodes: 5,
        zookeeper_details: [
          { id: 1, host: "prodhcp-zk1.ril.com:2181", mode: "follower", status: "ACTIVE" },
          { id: 2, host: "prodhcp-zk2.ril.com:2181", mode: "leader", status: "ACTIVE" },
          { id: 3, host: "prodhcp-zk3.ril.com:2181", mode: "follower", status: "ACTIVE" },
          { id: 4, host: "prodhcp-zk4.ril.com:2181", mode: "follower", status: "ACTIVE" },
          { id: 5, host: "prodhcp-zk5.ril.com:2181", mode: "follower", status: "ACTIVE" }
        ],
        error_message: null
      }
    },
    {
      timestamp: new Date().toISOString(),
      environment: "prod",
      cluster_name: "rfh",
      cluster_description: "Production RFH Kafka Cluster",
      kafka: {
        status: "HEALTHY",
        expected_brokers: 4,
        active_brokers: 4,
        cluster_id: "8BBgtjE_RKiJ_rDWp5MDbq",
        broker_details: [
          { id: 0, host: "prodrfh1.ril.com:9093", isController: true, status: "ACTIVE" },
          { id: 1, host: "prodrfh2.ril.com:9093", isController: false, status: "ACTIVE" },
          { id: 2, host: "prodrfh3.ril.com:9093", isController: false, status: "ACTIVE" },
          { id: 3, host: "prodrfh4.ril.com:9093", isController: false, status: "ACTIVE" }
        ],
        error_message: null
      },
      zookeeper: {
        status: "HEALTHY",
        expected_nodes: 3,
        active_nodes: 3,
        zookeeper_details: [
          { id: 1, host: "prodrfh-zk1.ril.com:2181", mode: "leader", status: "ACTIVE" },
          { id: 2, host: "prodrfh-zk2.ril.com:2181", mode: "follower", status: "ACTIVE" },
          { id: 3, host: "prodrfh-zk3.ril.com:2181", mode: "follower", status: "ACTIVE" }
        ],
        error_message: null
      }
    },
    {
      timestamp: new Date().toISOString(),
      environment: "prod",
      cluster_name: "jiobp",
      cluster_description: "Production JIOBP Kafka Cluster",
      kafka: {
        status: "HEALTHY",
        expected_brokers: 6,
        active_brokers: 6,
        cluster_id: "9CCgtjE_RKiJ_rDWp5MDbz",
        broker_details: [
          { id: 0, host: "prodjiobp1.ril.com:9093", isController: false, status: "ACTIVE" },
          { id: 1, host: "prodjiobp2.ril.com:9093", isController: false, status: "ACTIVE" },
          { id: 2, host: "prodjiobp3.ril.com:9093", isController: true, status: "ACTIVE" },
          { id: 3, host: "prodjiobp4.ril.com:9093", isController: false, status: "ACTIVE" },
          { id: 4, host: "prodjiobp5.ril.com:9093", isController: false, status: "ACTIVE" },
          { id: 5, host: "prodjiobp6.ril.com:9093", isController: false, status: "ACTIVE" }
        ],
        error_message: null
      },
      zookeeper: {
        status: "HEALTHY",
        expected_nodes: 5,
        active_nodes: 5,
        zookeeper_details: [
          { id: 1, host: "prodjiobp-zk1.ril.com:2181", mode: "follower", status: "ACTIVE" },
          { id: 2, host: "prodjiobp-zk2.ril.com:2181", mode: "follower", status: "ACTIVE" },
          { id: 3, host: "prodjiobp-zk3.ril.com:2181", mode: "leader", status: "ACTIVE" },
          { id: 4, host: "prodjiobp-zk4.ril.com:2181", mode: "follower", status: "ACTIVE" },
          { id: 5, host: "prodjiobp-zk5.ril.com:2181", mode: "follower", status: "ACTIVE" }
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
      // Real API call to your backend
      const response = await fetch(`${apiUrl}/api/health/${env}/${cluster}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: ClusterHealth = await response.json();
      
      // Update the specific cluster in the state
      setClusters(prevClusters => 
        prevClusters.map(c => 
          c.environment === env && c.cluster_name === cluster ? data : c
        )
      );
      
      console.log(`Successfully refreshed ${env}/${cluster}`);
    } catch (error) {
      console.error(`Failed to refresh cluster ${env}/${cluster}:`, error);
      // Optionally update cluster status to show error
      setClusters(prevClusters => 
        prevClusters.map(c => {
          if (c.environment === env && c.cluster_name === cluster) {
            return {
              ...c,
              kafka: { ...c.kafka, status: "UNREACHABLE" as const, error_message: "API connection failed" },
              zookeeper: { ...c.zookeeper, status: "UNREACHABLE" as const, error_message: "API connection failed" }
            };
          }
          return c;
        })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        // Fetch available environments from API
        const envResponse = await fetch(`${apiUrl}/api/environments`);
        if (envResponse.ok) {
          const envData = await envResponse.json();
          setEnvironments(envData);
        } else {
          // Fallback to mock environments if API fails
          setEnvironments(["dev", "qas", "prod"]);
        }
        
        // Load all cluster data
        const clusterPromises: Promise<ClusterHealth>[] = [];
        const environments = ["dev", "qas", "prod"]; // You can get this from API too
        const clusterTypes = ["hcp", "rfh", "jiobp"]; // You can get this from API too
        
        environments.forEach(env => {
          clusterTypes.forEach(cluster => {
            clusterPromises.push(
              fetch(`${apiUrl}/api/health/${env}/${cluster}`)
                .then(response => {
                  if (!response.ok) throw new Error(`Failed to fetch ${env}/${cluster}`);
                  return response.json();
                })
                .catch(error => {
                  console.error(`Error loading ${env}/${cluster}:`, error);
                  // Return mock data as fallback for this specific cluster
                  const mockCluster = mockClusters.find(c => c.environment === env && c.cluster_name === cluster);
                  return mockCluster || {
                    timestamp: new Date().toISOString(),
                    environment: env,
                    cluster_name: cluster,
                    cluster_description: `${env.toUpperCase()} ${cluster.toUpperCase()} Kafka Cluster`,
                    kafka: { status: "UNREACHABLE" as const, error_message: "Failed to connect to API" },
                    zookeeper: { status: "UNREACHABLE" as const, error_message: "Failed to connect to API" }
                  };
                })
            );
          });
        });
        
        const clusterData = await Promise.all(clusterPromises);
        setClusters(clusterData.filter(Boolean));
        
        // Initialize auto-refresh settings
        const initialAutoRefresh: Record<string, boolean> = {};
        const initialInterval: Record<string, number> = {};
        
        clusterData.forEach(cluster => {
          const key = `${cluster.environment}-${cluster.cluster_name}`;
          initialAutoRefresh[key] = true; // Auto-refresh enabled by default
          initialInterval[key] = 30; // 30 seconds default
        });
        
        setAutoRefresh(initialAutoRefresh);
        setRefreshInterval(initialInterval);
        
      } catch (error) {
        console.error("Failed to load initial data:", error);
        // Fallback to mock data if everything fails
        setClusters(mockClusters);
        setEnvironments(["dev", "qas", "prod"]);
        
        const initialAutoRefresh: Record<string, boolean> = {};
        const initialInterval: Record<string, number> = {};
        
        mockClusters.forEach(cluster => {
          const key = `${cluster.environment}-${cluster.cluster_name}`;
          initialAutoRefresh[key] = true;
          initialInterval[key] = 30;
        });
        
        setAutoRefresh(initialAutoRefresh);
        setRefreshInterval(initialInterval);
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, [apiUrl]);

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