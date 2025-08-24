import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import SectionNavigation, { SectionType } from "./SectionNavigation";
import DashboardSection from "./sections/DashboardSection";
import TopicsSection from "./sections/TopicsSection";
import ConsumerGroupsSection from "./sections/ConsumerGroupsSection";
import UsersSection from "./sections/UsersSection";
import ACLsSection from "./sections/ACLsSection";


const KafkaDashboard = () => {
  const [environments, setEnvironments] = useState<string[]>([]);
  const [selectedEnv, setSelectedEnv] = useState<string>("dev");
  const [selectedCluster, setSelectedCluster] = useState<string>("hcp");
  const [availableClusters] = useState<string[]>(["hcp", "rfh", "jiobp"]);
  const [activeSection, setActiveSection] = useState<SectionType>("dashboard");

  useEffect(() => {
    const mockEnvs = ['dev', 'qas', 'prod'];
    setEnvironments(mockEnvs);
  }, []);

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardSection selectedEnv={selectedEnv} selectedCluster={selectedCluster} />;
      case "topics":
        return <TopicsSection selectedEnv={selectedEnv} selectedCluster={selectedCluster} />;
      case "consumer-groups":
        return <ConsumerGroupsSection selectedEnv={selectedEnv} selectedCluster={selectedCluster} />;
      case "users":
        return <UsersSection selectedEnv={selectedEnv} selectedCluster={selectedCluster} />;
      case "acls":
        return <ACLsSection selectedEnv={selectedEnv} selectedCluster={selectedCluster} />;
      default:
        return <DashboardSection selectedEnv={selectedEnv} selectedCluster={selectedCluster} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        environments={environments}
        selectedEnv={selectedEnv}
        onEnvChange={setSelectedEnv}
        availableClusters={availableClusters}
        selectedCluster={selectedCluster}
        onClusterChange={setSelectedCluster}
      />
      
      <SectionNavigation
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      
      <main className="p-6">
        {renderSection()}
      </main>
    </div>
  );
};

export default KafkaDashboard;