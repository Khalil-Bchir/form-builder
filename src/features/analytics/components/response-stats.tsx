"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import type { ResponseStats as ResponseStatsType } from "../types/analytics"

interface ResponseStatsProps {
  stats: ResponseStatsType
}

const COLORS = ["#3b82f6", "#10b981"]

export function ResponseStats({ stats }: ResponseStatsProps) {
  const sourceData = [
    { name: "QR Code", value: stats.qr },
    { name: "Web Link", value: stats.web },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground mt-1">
            All time submissions
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">QR Code</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.qr}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.total > 0
              ? `${Math.round((stats.qr / stats.total) * 100)}% of total`
              : "0% of total"}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Web Link</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.web}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.total > 0
              ? `${Math.round((stats.web / stats.total) * 100)}% of total`
              : "0% of total"}
          </p>
        </CardContent>
      </Card>
      {stats.total > 0 && (
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Source Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
