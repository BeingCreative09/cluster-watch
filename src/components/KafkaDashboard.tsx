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
  XCircle,
  Shield
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

interface CertificateInfo {
  name: string;
  expires_in_days: number;
  expiry_date: string;
  status: "CRITICAL" | "WARNING" | "HEALTHY";
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
  certificates?: CertificateInfo[];
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
  const [selectedCluster, setSelectedCluster] = useState<string>("hcp");
  const [availableClusters] = useState<string[]>(["hcp", "rfh", "jiobp"]);


  const generateMockData = (env: string, clusterName: string): ClusterHealth => {
    const daysToExpiry = Math.floor(Math.random() * 200);
    return {
      timestamp: new Date().toISOString(),
      environment: env,
      cluster_name: clusterName,
      cluster_description: `${clusterName.toUpperCase()} Kafka Cluster - ${env.toUpperCase()} Environment`,
      kafka: {
        status: Math.random() > 0.8 ? "UNHEALTHY" : "HEALTHY" as const,
        expected_brokers: 3,
        active_brokers: Math.random() > 0.8 ? 2 : 3,
        cluster_id: `kafka-${clusterName}-${env}`,
        broker_details: [
          { id: 1, host: `kafka-${clusterName}-1.${env}.company.com:9092`, isController: true, status: "ACTIVE" },
          { id: 2, host: `kafka-${clusterName}-2.${env}.company.com:9092`, isController: false, status: "ACTIVE" },
          { id: 3, host: `kafka-${clusterName}-3.${env}.company.com:9092`, isController: false, status: Math.random() > 0.8 ? "INACTIVE" : "ACTIVE" }
        ],
        certificates: [{
          name: "Kafka Server SSL Certificate",
          expires_in_days: daysToExpiry,
          expiry_date: new Date(Date.now() + daysToExpiry * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: daysToExpiry <= 10 ? "CRITICAL" : daysToExpiry <= 50 ? "WARNING" : "HEALTHY" as const
        }]
      },
      zookeeper: {
        status: Math.random() > 0.9 ? "UNHEALTHY" : "HEALTHY" as const,
        expected_nodes: 3,
        active_nodes: 3,
        zookeeper_details: [
          { id: 1, host: `zk-${clusterName}-1.${env}.company.com:2181`, mode: "leader", status: "ACTIVE" },
          { id: 2, host: `zk-${clusterName}-2.${env}.company.com:2181`, mode: "follower", status: "ACTIVE" },
          { id: 3, host: `zk-${clusterName}-3.${env}.company.com:2181`, mode: "follower", status: "ACTIVE" }
        ]
      }
    };
  };

  const getCertificateIcon = (status: string) => {
    switch (status) {
      case "HEALTHY":
        return <Shield className="h-4 w-4 text-success" />;
      case "WARNING":
        return <Shield className="h-4 w-4 text-warning" />;
      case "CRITICAL":
        return <Shield className="h-4 w-4 text-error" />;
      default:
        return <Shield className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getCertificateBadge = (status: string) => {
    switch (status) {
      case "HEALTHY":
        return <Badge className="bg-success-light text-success border-success/20 text-xs">Valid</Badge>;
      case "WARNING":
        return <Badge className="bg-warning-light text-warning border-warning/20 text-xs">Expiring Soon</Badge>;
      case "CRITICAL":
        return <Badge className="bg-error-light text-error border-error/20 text-xs">Expires Soon</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">Unknown</Badge>;
    }
  };
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
    // Use mock data for now
    const mockEnvs = ['dev', 'qas', 'prod'];
    setEnvironments(mockEnvs);
    
    // Generate mock data for the selected environment and cluster
    const mockData = generateMockData(selectedEnv, selectedCluster);
    setClusters([mockData]);
    
    // Initialize auto-refresh settings
    const key = `${selectedEnv}-${selectedCluster}`;
    setAutoRefresh({ [key]: true });
    setRefreshInterval({ [key]: 30 });
  }, [selectedEnv, selectedCluster]);

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

  const currentCluster = clusters.find(cluster => 
    cluster.environment === selectedEnv && cluster.cluster_name === selectedCluster
  );

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

          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-muted-foreground" />
            <select 
              value={selectedCluster} 
              onChange={(e) => setSelectedCluster(e.target.value)}
              className="bg-card border border-border rounded-md px-3 py-1 text-sm"
            >
              {availableClusters.map(cluster => (
                <option key={cluster} value={cluster}>{cluster.toUpperCase()}</option>
              ))}
            </select>
          </div>
          
          <Button 
            onClick={() => refreshCluster(selectedEnv, selectedCluster)}
            disabled={loading}
            size="sm"
            className="bg-gradient-primary shadow-medium"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Single Cluster Card */}
      {currentCluster ? (
        <div className="max-w-6xl mx-auto animate-fade-in">
          <Card className="bg-gradient-card shadow-strong hover:shadow-elegant transition-all duration-500 border-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-subtle opacity-50" />
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Server className="h-6 w-6 text-primary" />
                    </div>
                    {currentCluster.cluster_name.toUpperCase()} 
                    <Badge variant="outline" className="text-xs font-medium bg-background/50">
                      {selectedEnv.toUpperCase()}
                    </Badge>
                  </CardTitle>
                  <p className="text-muted-foreground">
                    {currentCluster.cluster_description}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleAutoRefresh(`${selectedEnv}-${selectedCluster}`)}
                    className={cn(
                      "transition-all duration-300 hover-scale",
                      autoRefresh[`${selectedEnv}-${selectedCluster}`] 
                        ? "bg-success/10 border-success/30 text-success hover:bg-success/20" 
                        : "hover:bg-muted/50"
                    )}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Auto {autoRefresh[`${selectedEnv}-${selectedCluster}`] ? 'ON' : 'OFF'}
                  </Button>
                  {autoRefresh[`${selectedEnv}-${selectedCluster}`] && (
                    <select
                      value={refreshInterval[`${selectedEnv}-${selectedCluster}`] || 30}
                      onChange={(e) => updateRefreshInterval(`${selectedEnv}-${selectedCluster}`, Number(e.target.value))}
                      className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-lg px-3 py-2 text-sm hover:bg-background transition-colors"
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
            <CardContent className="relative space-y-6">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-background/50 backdrop-blur-sm">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="kafka" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Kafka
                  </TabsTrigger>
                  <TabsTrigger value="zookeeper" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Zookeeper
                  </TabsTrigger>
                  <TabsTrigger value="certificates" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    SSL Certificate
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-background/30 backdrop-blur-sm border-border/50 hover-scale transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          {getStatusIcon(currentCluster.kafka.status)}
                          <span className="font-semibold text-lg">Kafka</span>
                        </div>
                        {getStatusBadge(currentCluster.kafka.status)}
                        <p className="text-sm text-muted-foreground mt-2">
                          {currentCluster.kafka.active_brokers}/{currentCluster.kafka.expected_brokers} brokers active
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-background/30 backdrop-blur-sm border-border/50 hover-scale transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          {getStatusIcon(currentCluster.zookeeper.status)}
                          <span className="font-semibold text-lg">Zookeeper</span>
                        </div>
                        {getStatusBadge(currentCluster.zookeeper.status)}
                        <p className="text-sm text-muted-foreground mt-2">
                          {currentCluster.zookeeper.active_nodes}/{currentCluster.zookeeper.expected_nodes} nodes active
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-background/30 backdrop-blur-sm border-border/50 hover-scale transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <Shield className="h-6 w-6 text-muted-foreground" />
                          <span className="font-semibold text-lg">SSL Certificate</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          {currentCluster.kafka.certificates?.[0] && getCertificateIcon(currentCluster.kafka.certificates[0].status)}
                          {currentCluster.kafka.certificates?.[0] && getCertificateBadge(currentCluster.kafka.certificates[0].status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {currentCluster.kafka.certificates?.[0]?.expires_in_days} days until expiry
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card className="bg-background/20 backdrop-blur-sm border-border/30">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 bg-success rounded-full pulse" />
                          <span className="text-sm font-medium">Last updated</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(currentCluster.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="kafka" className="space-y-4 mt-6">
                  <Card className="bg-background/30 backdrop-blur-sm border-border/50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Database className="h-5 w-5 text-primary" />
                          Brokers Status
                        </h4>
                        {getStatusBadge(currentCluster.kafka.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {currentCluster.kafka.broker_details?.map((broker) => (
                          <div key={broker.id} className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border/30 hover:bg-background/70 transition-colors">
                            <div className="space-y-1">
                              <p className="font-medium">Broker {broker.id}</p>
                              <p className="text-sm text-muted-foreground font-mono">{broker.host}</p>
                            </div>
                            <div className="text-right space-y-1">
                              <Badge 
                                variant={broker.status === "ACTIVE" ? "default" : "destructive"}
                                className="text-xs"
                              >
                                {broker.status}
                              </Badge>
                              {broker.isController && (
                                <p className="text-xs text-primary font-semibold">Controller</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {currentCluster.kafka.error_message && (
                    <Card className="bg-error/5 border-error/20">
                      <CardContent className="p-4">
                        <p className="text-sm text-error">{currentCluster.kafka.error_message}</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="zookeeper" className="space-y-4 mt-6">
                  <Card className="bg-background/30 backdrop-blur-sm border-border/50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Database className="h-5 w-5 text-primary" />
                          Ensemble Status
                        </h4>
                        {getStatusBadge(currentCluster.zookeeper.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {currentCluster.zookeeper.zookeeper_details?.map((node) => (
                          <div key={node.id} className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border/30 hover:bg-background/70 transition-colors">
                            <div className="space-y-1">
                              <p className="font-medium">Node {node.id}</p>
                              <p className="text-sm text-muted-foreground font-mono">{node.host}</p>
                            </div>
                            <div className="text-right space-y-1">
                              <Badge 
                                variant={node.status === "ACTIVE" ? "default" : "destructive"}
                                className="text-xs"
                              >
                                {node.status}
                              </Badge>
                              <p className="text-xs text-primary font-semibold capitalize">{node.mode}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {currentCluster.zookeeper.error_message && (
                    <Card className="bg-error/5 border-error/20">
                      <CardContent className="p-4">
                        <p className="text-sm text-error">{currentCluster.zookeeper.error_message}</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="certificates" className="space-y-4 mt-6">
                  <Card className="bg-background/30 backdrop-blur-sm border-border/50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Shield className="h-5 w-5 text-primary" />
                          Kafka Server SSL Certificate
                        </h4>
                        {currentCluster.kafka.certificates?.[0] && getCertificateBadge(currentCluster.kafka.certificates[0].status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {currentCluster.kafka.certificates?.[0] && (
                        <div className="p-6 bg-gradient-subtle rounded-lg border-l-4 border-l-primary">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-primary/10 rounded-full">
                                {getCertificateIcon(currentCluster.kafka.certificates[0].status)}
                              </div>
                              <div>
                                <h5 className="font-semibold text-lg">{currentCluster.kafka.certificates[0].name}</h5>
                                <p className="text-sm text-muted-foreground">
                                  Expires: {currentCluster.kafka.certificates[0].expiry_date}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={cn(
                                "text-3xl font-bold",
                                currentCluster.kafka.certificates[0].expires_in_days <= 10 && "text-error",
                                currentCluster.kafka.certificates[0].expires_in_days <= 50 && currentCluster.kafka.certificates[0].expires_in_days > 10 && "text-warning",
                                currentCluster.kafka.certificates[0].expires_in_days > 50 && "text-success"
                              )}>
                                {currentCluster.kafka.certificates[0].expires_in_days}
                              </p>
                              <p className="text-sm text-muted-foreground">days left</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/30">
                            <div>
                              <p className="text-sm text-muted-foreground">Status</p>
                              <p className={cn(
                                "font-semibold",
                                currentCluster.kafka.certificates[0].status === "HEALTHY" && "text-success",
                                currentCluster.kafka.certificates[0].status === "WARNING" && "text-warning",
                                currentCluster.kafka.certificates[0].status === "CRITICAL" && "text-error"
                              )}>
                                {currentCluster.kafka.certificates[0].status === "HEALTHY" && "✓ Certificate Valid"}
                                {currentCluster.kafka.certificates[0].status === "WARNING" && "⚠ Expiring Soon"}
                                {currentCluster.kafka.certificates[0].status === "CRITICAL" && "🚨 Critical Alert"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Environment</p>
                              <p className="font-semibold">{selectedEnv.toUpperCase()}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="text-center py-16 animate-fade-in">
          <CardContent>
            <div className="p-4 bg-muted/20 rounded-full w-fit mx-auto mb-6">
              <Server className="h-16 w-16 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No cluster data available</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Unable to load data for {selectedCluster.toUpperCase()} in {selectedEnv.toUpperCase()} environment.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default KafkaDashboard;