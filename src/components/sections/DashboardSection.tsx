import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  RefreshCw, 
  Server, 
  Activity, 
  Clock,
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

interface DashboardSectionProps {
  selectedEnv: string;
  selectedCluster: string;
}

const DashboardSection = ({ selectedEnv, selectedCluster }: DashboardSectionProps) => {
  const [cluster, setCluster] = useState<ClusterHealth | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);

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

  const refreshCluster = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const mockData = generateMockData(selectedEnv, selectedCluster);
      setCluster(mockData);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    // Generate initial mock data
    const mockData = generateMockData(selectedEnv, selectedCluster);
    setCluster(mockData);
  }, [selectedEnv, selectedCluster]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refreshCluster();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, selectedEnv, selectedCluster]);

  if (!cluster) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cluster Overview Card */}
      <Card className="bg-gradient-card shadow-strong hover:shadow-elegant transition-all duration-500 border-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-subtle opacity-50" />
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Server className="h-6 w-6 text-primary" />
                </div>
                {cluster.cluster_name.toUpperCase()} 
                <Badge variant="outline" className="text-xs font-medium bg-background/50">
                  {selectedEnv.toUpperCase()}
                </Badge>
              </CardTitle>
              <p className="text-muted-foreground">
                {cluster.cluster_description}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={cn(
                  "transition-all duration-300 hover-scale",
                  autoRefresh 
                    ? "bg-success/10 border-success/30 text-success hover:bg-success/20" 
                    : "hover:bg-muted/50"
                )}
              >
                <Clock className="h-4 w-4 mr-2" />
                Auto {autoRefresh ? 'ON' : 'OFF'}
              </Button>
              {autoRefresh && (
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-lg px-3 py-2 text-sm hover:bg-background transition-colors"
                >
                  <option value={10}>10s</option>
                  <option value={30}>30s</option>
                  <option value={60}>1m</option>
                  <option value={300}>5m</option>
                </select>
              )}
              <Button 
                onClick={refreshCluster}
                disabled={loading}
                size="sm"
                className="bg-gradient-primary shadow-medium"
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                Refresh
              </Button>
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
                      {getStatusIcon(cluster.kafka.status)}
                      <span className="font-semibold text-lg">Kafka</span>
                    </div>
                    {getStatusBadge(cluster.kafka.status)}
                    <p className="text-sm text-muted-foreground mt-2">
                      {cluster.kafka.active_brokers}/{cluster.kafka.expected_brokers} brokers active
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-background/30 backdrop-blur-sm border-border/50 hover-scale transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      {getStatusIcon(cluster.zookeeper.status)}
                      <span className="font-semibold text-lg">Zookeeper</span>
                    </div>
                    {getStatusBadge(cluster.zookeeper.status)}
                    <p className="text-sm text-muted-foreground mt-2">
                      {cluster.zookeeper.active_nodes}/{cluster.zookeeper.expected_nodes} nodes active
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
                      {cluster.kafka.certificates?.[0] && getCertificateIcon(cluster.kafka.certificates[0].status)}
                      {cluster.kafka.certificates?.[0] && getCertificateBadge(cluster.kafka.certificates[0].status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {cluster.kafka.certificates?.[0]?.expires_in_days} days until expiry
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="kafka" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-background/30 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Server className="h-5 w-5" />
                      Cluster Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cluster ID:</span>
                      <span className="font-mono text-sm">{cluster.kafka.cluster_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      {getStatusBadge(cluster.kafka.status)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expected Brokers:</span>
                      <span>{cluster.kafka.expected_brokers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Active Brokers:</span>
                      <span className={cluster.kafka.active_brokers !== cluster.kafka.expected_brokers ? "text-warning" : "text-success"}>
                        {cluster.kafka.active_brokers}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-background/30 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle>Broker Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {cluster.kafka.broker_details?.map((broker) => (
                        <div key={broker.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Broker {broker.id}</span>
                              {broker.isController && (
                                <Badge variant="outline" className="text-xs bg-primary/10 text-primary">Controller</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{broker.host}</p>
                          </div>
                          <Badge className={broker.status === "ACTIVE" ? "bg-success-light text-success border-success/20" : "bg-error-light text-error border-error/20"}>
                            {broker.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="zookeeper" className="space-y-4 mt-6">
              <Card className="bg-background/30 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle>Zookeeper Ensemble</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {cluster.zookeeper.zookeeper_details?.map((node) => (
                      <div key={node.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Node {node.id}</span>
                            <Badge variant="outline" className={cn(
                              "text-xs",
                              node.mode === "leader" ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground"
                            )}>
                              {node.mode}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{node.host}</p>
                        </div>
                        <Badge className={node.status === "ACTIVE" ? "bg-success-light text-success border-success/20" : "bg-error-light text-error border-error/20"}>
                          {node.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="certificates" className="space-y-4 mt-6">
              <Card className="bg-background/30 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    SSL Certificate Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {cluster.kafka.certificates?.map((cert, index) => (
                    <div key={index} className="p-4 bg-background/50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getCertificateIcon(cert.status)}
                          <span className="font-medium">{cert.name}</span>
                        </div>
                        {getCertificateBadge(cert.status)}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Expires in:</span>
                          <span className={cn(
                            "ml-2 font-medium",
                            cert.expires_in_days <= 10 ? "text-error" : 
                            cert.expires_in_days <= 50 ? "text-warning" : "text-success"
                          )}>
                            {cert.expires_in_days} days
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Expiry date:</span>
                          <span className="ml-2 font-mono">{cert.expiry_date}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardSection;
