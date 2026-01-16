/**
 * Influencers list page
 */

"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Influencer {
  id: string
  name: string
  email: string | null
  status: "active" | "inactive"
  referral_code: string
  created_at: string
}

interface InfluencersResponse {
  influencers: Influencer[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function InfluencersPage() {
  const [influencers, setInfluencers] = useState<Influencer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")

  useEffect(() => {
    loadInfluencers()
  }, [statusFilter, search])

  async function loadInfluencers() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (search) params.set("search", search)

      const response = await fetch(`/api/admin/influencers?${params.toString()}`)
      if (!response.ok) throw new Error("Failed to load influencers")

      const data: InfluencersResponse = await response.json()
      setInfluencers(data.influencers)
    } catch (error) {
      console.error("Error loading influencers:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Influencers</h1>
          <p className="text-muted-foreground mt-2">
            Manage influencers and their referral links
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/influencers/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Influencer
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Influencers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or handle..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : influencers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No influencers found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Referral Code</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {influencers.map((influencer) => (
                  <TableRow key={influencer.id}>
                    <TableCell className="font-medium">{influencer.name}</TableCell>
                    <TableCell>{influencer.email || "-"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={influencer.status === "active" ? "default" : "secondary"}
                      >
                        {influencer.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {influencer.referral_code}
                    </TableCell>
                    <TableCell>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/influencers/${influencer.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
