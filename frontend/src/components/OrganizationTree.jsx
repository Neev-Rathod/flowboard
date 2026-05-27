import { ChevronDown, ChevronRight, Briefcase, Mail, ShieldAlert } from "lucide-react";
import { useState } from "react";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

function TreeNode({ node }) {
  const [open, setOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="space-y-2">
      <Card className="border border-white/10 bg-slate-950/40 hover:bg-slate-950/70 hover:border-sky-500/20 transition-all duration-300 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between gap-4 p-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base font-bold text-white tracking-tight">
                {node.username}
              </CardTitle>
              <Badge 
                variant={node.role === "admin" ? "success" : "outline"}
                className={`text-[10px] uppercase font-semibold px-2 py-0.5 ${
                  node.role === "admin" 
                    ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" 
                    : node.role === "manager"
                      ? "bg-sky-500/10 text-sky-300 border-sky-500/20"
                      : "bg-white/5 text-slate-300 border-white/10"
                }`}
              >
                {node.role}
              </Badge>
            </div>
            
            <div className="flex flex-col gap-1">
              <CardDescription className="flex items-center gap-2 text-xs text-slate-300">
                <Briefcase className="h-3.5 w-3.5 text-sky-400" />
                <span>{node.job_title}</span>
              </CardDescription>
              <CardDescription className="flex items-center gap-2 text-[11px] text-slate-400">
                <Mail className="h-3.5 w-3.5 text-indigo-400" />
                <span>{node.email}</span>
              </CardDescription>
            </div>
          </div>

          {hasChildren && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300"
              onClick={() => setOpen((value) => !value)}
            >
              {open ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
        </CardHeader>
      </Card>

      {open && hasChildren ? (
        <div className="relative pl-6 sm:pl-8">
          {/* Vertical Connection Line */}
          <div className="absolute left-2.5 sm:left-4 top-0 h-full w-px bg-gradient-to-b from-sky-500/20 to-indigo-500/5" />
          <div className="space-y-3 pt-2">
            {node.children.map((child) => (
              <div key={child.id} className="relative">
                {/* Horizontal Connection Line */}
                <div className="absolute -left-3.5 sm:-left-4 top-6 h-px w-3.5 sm:w-4 bg-sky-500/20" />
                <TreeNode node={child} />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function OrganizationTree({ tree }) {
  if (!tree?.length) {
    return (
      <Card className="border border-white/5 bg-slate-950/20 backdrop-blur-sm">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-3">
          <div className="rounded-full bg-amber-400/10 p-3 text-amber-400">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-200">No hierarchy tree available</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Ensure you have seeded the organization data or have permissions to view this directory.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {tree.map((node) => (
        <TreeNode key={node.id} node={node} />
      ))}
    </div>
  );
}
