"use client";

import { Briefcase, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export default function PositionsPage() {
  // Mock positions data - will be replaced with actual data from API
  const [positions] = useState([
    {
      id: "1",
      title: "Full Stack Developer",
      department: "Engineering",
      openings: 3,
      status: "Active",
      created: "2 days ago",
    },
    {
      id: "2",
      title: "Product Manager",
      department: "Product",
      openings: 1,
      status: "Draft",
      created: "1 week ago",
    },
  ]);

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Positions</h2>
        <Link href="/dashboard/positions/new">
          <Button className="bg-verbo-purple hover:bg-verbo-purple/90">
            <Plus className="mr-2 h-4 w-4" />
            New Position
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Position</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Openings</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map((position) => (
                <TableRow key={position.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Briefcase className="mr-2 h-4 w-4 text-verbo-dark" />
                      {position.title}
                    </div>
                  </TableCell>
                  <TableCell>{position.department}</TableCell>
                  <TableCell>{position.openings}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        position.status === "Active"
                          ? "bg-verbo-green/20 text-verbo-green"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {position.status}
                    </span>
                  </TableCell>
                  <TableCell>{position.created}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Total Positions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Total Openings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
