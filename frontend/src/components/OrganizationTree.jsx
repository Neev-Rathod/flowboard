import { ChevronDown, ChevronRight, KanbanSquare, Mail } from "lucide-react";
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
    <div className="space-y-3">
      <Card className="border-white/10 bg-slate-950/70">
        <CardHeader className="flex flex-row items-start justify-between gap-4 p-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base">{node.username}</CardTitle>
              <Badge variant={node.role === "admin" ? "success" : "outline"}>
                {node.role}
              </Badge>
            </div>
            <CardDescription className="flex items-center gap-2 text-sm">
              <KanbanSquare className="h-4 w-4" />
              {node.job_title}
            </CardDescription>
            <CardDescription className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4" />
              {node.email}
            </CardDescription>
          </div>
          {hasChildren ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen((value) => !value)}
            >
              {open ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          ) : null}
        </CardHeader>
      </Card>

      {open && hasChildren ? (
        <div className="relative pl-6">
          <div className="absolute left-2 top-0 h-full w-px bg-white/10" />
          <div className="space-y-4">
            {node.children.map((child) => (
              <div key={child.id} className="relative">
                <div className="absolute -left-5 top-7 h-px w-5 bg-white/10" />
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
      <Card className="border-white/10 bg-slate-950/55">
        <CardContent className="p-6 text-sm text-slate-300">
          No hierarchy has been created yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {tree.map((node) => (
        <TreeNode key={node.id} node={node} />
      ))}
    </div>
  );
}
