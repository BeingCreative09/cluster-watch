import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Globe, Server, User, Settings, LogOut, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface NavbarProps {
  environments: string[];
  selectedEnv: string;
  onEnvChange: (env: string) => void;
  availableClusters: string[];
  selectedCluster: string;
  onClusterChange: (cluster: string) => void;
}

const Navbar = ({
  environments,
  selectedEnv,
  onEnvChange,
  availableClusters,
  selectedCluster,
  onClusterChange
}: NavbarProps) => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left side - Logo and title */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-primary rounded-lg shadow-medium">
              <Server className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Kafka Monitor
              </h1>
              <p className="text-xs text-muted-foreground -mt-1">
                Production Control Center
              </p>
            </div>
          </div>
        </div>

        {/* Center - Environment and Cluster Selection */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm rounded-lg px-3 py-2 border border-border/50">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <select 
              value={selectedEnv} 
              onChange={(e) => onEnvChange(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-medium cursor-pointer"
            >
              {environments.map(env => (
                <option key={env} value={env}>{env.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div className="h-4 w-px bg-border" />

          <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm rounded-lg px-3 py-2 border border-border/50">
            <Server className="h-4 w-4 text-muted-foreground" />
            <select 
              value={selectedCluster} 
              onChange={(e) => onClusterChange(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-medium cursor-pointer"
            >
              {availableClusters.map(cluster => (
                <option key={cluster} value={cluster}>{cluster.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Right side - User profile and actions */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-error text-white">
              3
            </Badge>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full hover-scale">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/avatars/01.png" alt="User" />
                  <AvatarFallback className="bg-gradient-primary text-white">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-background/95 backdrop-blur-md border-border/50" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">John Doe</p>
                  <p className="w-[200px] truncate text-sm text-muted-foreground">
                    john.doe@company.com
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-error focus:text-error">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;