"use client";

import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, differenceInMinutes, differenceInHours } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import type { ArtworkLog, JobMaster } from "@/lib/schemas";

// Helper function to calculate time spent (reused from ArtworkLog.tsx)
const calculateTimeSpent = (startDate: Date, endDate: Date | null): string => {
  if (!endDate) return "N/A";
  const minutes = differenceInMinutes(endDate, startDate);
  if (minutes < 60) {
    return `${minutes} min`;
  } else {
    const hours = differenceInHours(endDate, startDate);
    const remainingMinutes = minutes % 60;
    return `${hours} hr ${remainingMinutes} min`;
  }
};

// Helper function to get total minutes spent
const getTotalMinutesSpent = (startDate: Date, endDate: Date | null): number => {
  if (!endDate) return 0;
  return differenceInMinutes(endDate, startDate);
};

// 1. Total Job Count (group by category)
const fetchJobCountsByCategory = async () => {
  const { data, error } = await supabase.from("job_master").select("Category");
  if (error) throw new Error(error.message);

  const counts = data.reduce((acc, job) => {
    const category = job.Category || "Uncategorized";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(counts).map(([category, count]) => ({
    category,
    count,
  }));
};

// 2. Total Artwork Count (all categories)
const fetchTotalArtworkCount = async () => {
  const { count, error } = await supabase
    .from("artwork_log")
    .select("*", { count: "exact", head: true });
  if (error) throw new Error(error.message);
  return count || 0;
};

// 3. Average Artwork Time Spent (from artwork_log)
const fetchAverageArtworkTimeSpent = async () => {
  const { data, error } = await supabase
    .from("artwork_log")
    .select("StartDate, EndDate")
    .not("EndDate", "is", null); // Only consider completed artworks
  if (error) throw new Error(error.message);

  const totalMinutes = data.reduce((sum, log) => {
    const startDate = new Date(log.StartDate);
    const endDate = log.EndDate ? new Date(log.EndDate) : null;
    return sum + getTotalMinutesSpent(startDate, endDate);
  }, 0);

  const averageMinutes = data.length > 0 ? totalMinutes / data.length : 0;

  if (averageMinutes < 60) {
    return `${Math.round(averageMinutes)} min`;
  } else {
    const hours = Math.floor(averageMinutes / 60);
    const remainingMinutes = Math.round(averageMinutes % 60);
    return `${hours} hr ${remainingMinutes} min`;
  }
};

// 4. Productivity by Designer
const fetchProductivityByDesigner = async () => {
  const { data, error } = await supabase
    .from("artwork_log")
    .select("Designer, StartDate, EndDate")
    .not("Designer", "is", null);
  if (error) throw new Error(error.message);

  const productivity = data.reduce((acc, log) => {
    const designer = log.Designer || "Unassigned";
    if (!acc[designer]) {
      acc[designer] = { designer, artworkCount: 0, totalMinutesSpent: 0 };
    }
    acc[designer].artworkCount += 1;

    const startDate = new Date(log.StartDate);
    const endDate = log.EndDate ? new Date(log.EndDate) : null;
    acc[designer].totalMinutesSpent += getTotalMinutesSpent(startDate, endDate);

    return acc;
  }, {} as Record<string, { designer: string; artworkCount: number; totalMinutesSpent: number }>);

  return Object.values(productivity).map(item => ({
    ...item,
    totalTimeSpentDisplay: calculateTimeSpent(new Date(0), new Date(item.totalMinutesSpent * 60 * 1000)) // Convert minutes back to display format
  }));
};

// 5. Recent 10 artworks
const fetchRecentArtworks = async (): Promise<ArtworkLog[]> => {
  const { data, error } = await supabase
    .from("artwork_log")
    .select("*")
    .order("created_at", { ascending: false }) // Assuming 'created_at' exists and is suitable for recency
    .limit(10);
  if (error) throw new Error(error.message);
  return data.map((log) => ({
    ...log,
    StartDate: new Date(log.StartDate),
    EndDate: log.EndDate ? new Date(log.EndDate) : null,
  }));
};

const Dashboard = () => {
  const {
    data: jobCounts,
    isLoading: isLoadingJobCounts,
    isError: isErrorJobCounts,
    error: jobCountsError,
  } = useQuery({
    queryKey: ["jobCountsByCategory"],
    queryFn: fetchJobCountsByCategory,
  });

  const {
    data: totalArtworkCount,
    isLoading: isLoadingTotalArtworkCount,
    isError: isErrorTotalArtworkCount,
    error: totalArtworkCountError,
  } = useQuery({
    queryKey: ["totalArtworkCount"],
    queryFn: fetchTotalArtworkCount,
  });

  const {
    data: averageArtworkTimeSpent,
    isLoading: isLoadingAverageArtworkTimeSpent,
    isError: isErrorAverageArtworkTimeSpent,
    error: averageArtworkTimeSpentError,
  } = useQuery({
    queryKey: ["averageArtworkTimeSpent"],
    queryFn: fetchAverageArtworkTimeSpent,
  });

  const {
    data: productivityByDesigner,
    isLoading: isLoadingProductivityByDesigner,
    isError: isErrorProductivityByDesigner,
    error: productivityByDesignerError,
  } = useQuery({
    queryKey: ["productivityByDesigner"],
    queryFn: fetchProductivityByDesigner,
  });

  const {
    data: recentArtworks,
    isLoading: isLoadingRecentArtworks,
    isError: isErrorRecentArtworks,
    error: recentArtworksError,
  } = useQuery({
    queryKey: ["recentArtworks"],
    queryFn: fetchRecentArtworks,
  });

  const renderLoading = () => (
    <div className="flex-1 p-8 flex items-center justify-center">
      <p>Loading dashboard data...</p>
    </div>
  );

  const renderError = (error: Error | null) => (
    <div className="flex-1 p-8 flex items-center justify-center text-red-500">
      <p>Error loading data: {error?.message}</p>
    </div>
  );

  if (
    isLoadingJobCounts ||
    isLoadingTotalArtworkCount ||
    isLoadingAverageArtworkTimeSpent ||
    isLoadingProductivityByDesigner ||
    isLoadingRecentArtworks
  ) {
    return renderLoading();
  }

  if (
    isErrorJobCounts ||
    isErrorTotalArtworkCount ||
    isErrorAverageArtworkTimeSpent ||
    isErrorProductivityByDesigner ||
    isErrorRecentArtworks
  ) {
    return renderError(
      jobCountsError ||
        totalArtworkCountError ||
        averageArtworkTimeSpentError ||
        productivityByDesignerError ||
        recentArtworksError
    );
  }

  return (
    <div className="flex-1 p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Artwork Count</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalArtworkCount}</div>
            <p className="text-xs text-muted-foreground">Across all categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Artwork Time Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageArtworkTimeSpent}</div>
            <p className="text-xs text-muted-foreground">For completed artworks</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Job Count by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={jobCounts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" name="Jobs" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Productivity by Designer</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productivityByDesigner}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="designer" />
                <YAxis />
                <Tooltip formatter={(value, name) => {
                  if (name === 'artworkCount') return [`${value} Artworks`, 'Artwork Count'];
                  if (name === 'totalMinutesSpent') {
                    const hours = Math.floor(Number(value) / 60);
                    const minutes = Number(value) % 60;
                    return [`${hours}h ${minutes}m`, 'Total Time Spent'];
                  }
                  return [value, name];
                }} />
                <Legend />
                <Bar dataKey="artworkCount" fill="#82ca9d" name="Artwork Count" />
                <Bar dataKey="totalMinutesSpent" fill="#ffc658" name="Total Time Spent (min)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Recent 10 Artworks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Artwork ID</TableHead>
                  <TableHead>Job ID</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Artwork Title</TableHead>
                  <TableHead>Designer</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Time Spent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentArtworks?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No recent artworks found.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentArtworks?.map((log) => (
                    <TableRow key={log.ArtworkID}>
                      <TableCell className="font-medium">{log.ArtworkID}</TableCell>
                      <TableCell>{log.JobID}</TableCell>
                      <TableCell>{log.Category}</TableCell>
                      <TableCell>{log.ArtworkTitle}</TableCell>
                      <TableCell>{log.Designer}</TableCell>
                      <TableCell>
                        {log.StartDate ? format(log.StartDate, "PPP") : "N/A"}
                      </TableCell>
                      <TableCell>
                        {log.EndDate ? format(log.EndDate, "PPP") : "N/A"}
                      </TableCell>
                      <TableCell>
                        {log.StartDate && log.EndDate
                          ? calculateTimeSpent(log.StartDate, log.EndDate)
                          : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;