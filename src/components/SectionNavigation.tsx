import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  MessageSquare as Topic, 
  Users, 
  Shield, 
  UserCheck,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";

export type SectionType = "dashboard" | "topics" | "consumer-groups" | "users" | "acls";

interface SectionNavigationProps {
  activeSection: SectionType;
  onSectionChange: (section: SectionType) => void;
}

const sections = [
  { id: "dashboard" as const, label: "Dashboard", icon: Activity, description: "Cluster health overview" },
  { id: "topics" as const, label: "Topics", icon: Topic, description: "Kafka topic management" },
  { id: "consumer-groups" as const, label: "Consumer Groups", icon: Users, description: "Consumer group monitoring" },
  { id: "users" as const, label: "Users", icon: UserCheck, description: "User management" },
  { id: "acls" as const, label: "ACLs", icon: Shield, description: "Access control lists" }
];

const SectionNavigation = ({ activeSection, onSectionChange }: SectionNavigationProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="sticky top-16 z-40 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Navigation</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 w-6 p-0"
            >
              <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            {sections.find(s => s.id === activeSection)?.description}
          </div>
        </div>

        <div className={cn(
          "transition-all duration-300 ease-out overflow-hidden",
          isExpanded ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
        )}>
          <div className="flex items-center gap-2 flex-wrap">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              
              return (
                <Button
                  key={section.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onSectionChange(section.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 h-10 transition-all duration-300 hover-scale",
                    isActive 
                      ? "bg-gradient-primary text-white shadow-medium" 
                      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{section.label}</span>
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-primary opacity-10 rounded-md" />
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionNavigation;