"use client";

import { useState, useMemo, ChangeEvent } from 'react';
import type { Registration, Department, Year, EventName } from '@/lib/types';
import { departments, years, events } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpDown, Download, Search } from 'lucide-react';
import { format } from 'date-fns';

interface RegistrationsTableProps {
  initialData: Registration[];
}

type SortKey = keyof Registration | '';
type SortDirection = 'asc' | 'desc';

export default function RegistrationsTable({ initialData }: RegistrationsTableProps) {
  const [data, setData] = useState<Registration[]>(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    department: 'all',
    year: 'all',
    event: 'all',
  });
  const [sorting, setSorting] = useState<{ key: SortKey; direction: SortDirection }>({
    key: 'createdAt',
    direction: 'desc',
  });

  const handleSort = (key: SortKey) => {
    const direction = sorting.key === key && sorting.direction === 'asc' ? 'desc' : 'asc';
    setSorting({ key, direction });
  };

  const filteredData = useMemo(() => {
    let sortedData = [...data];

    if (sorting.key) {
      sortedData.sort((a, b) => {
        const aValue = a[sorting.key!];
        const bValue = b[sorting.key!];

        if (aValue === undefined || aValue === null) return 1;
        if (bValue === undefined || bValue === null) return -1;
        
        if (sorting.key === 'createdAt' && aValue.toDate && bValue.toDate) {
             return sorting.direction === 'asc' ? aValue.toDate() - bValue.toDate() : bValue.toDate() - aValue.toDate();
        }

        if (aValue < bValue) return sorting.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sorting.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return sortedData.filter(reg => {
      const searchMatch =
        reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const departmentMatch = filters.department === 'all' || reg.department === filters.department;
      const yearMatch = filters.year === 'all' || reg.year === filters.year;
      const eventMatch = filters.event === 'all' || reg.event1 === filters.event || reg.event2 === filters.event;

      return searchMatch && departmentMatch && yearMatch && eventMatch;
    });
  }, [data, searchTerm, filters, sorting]);

  const handleFilterChange = (filterType: 'department' | 'year' | 'event', value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };
  
  const downloadCSV = () => {
    const headers = ['Name', 'Roll Number', 'Department', 'Year', 'Mobile', 'Event 1', 'Event 2', 'Team Member 2', 'Registered At'];
    const csvRows = [
      headers.join(','),
      ...filteredData.map(row => [
        `"${row.name}"`,
        `"${row.rollNumber}"`,
        `"${row.department}"`,
        `"${row.year}"`,
        `"${row.mobileNumber}"`,
        `"${row.event1}"`,
        `"${row.event2 || ''}"`,
        `"${row.teamMember2 || ''}"`,
        `"${row.createdAt ? format(row.createdAt.toDate(), 'yyyy-MM-dd HH:mm') : ''}"`
      ].join(','))
    ];
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `muc_techno_2k25_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tableHeaders: { key: SortKey; label: string }[] = [
    { key: 'name', label: 'Name' },
    { key: 'rollNumber', label: 'Roll No' },
    { key: 'department', label: 'Department' },
    { key: 'year', label: 'Year' },
    { key: 'event1', label: 'Events' },
    { key: 'createdAt', label: 'Registered' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Master Registrations Table</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="relative w-full sm:w-1/3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or roll no..."
              value={searchTerm}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filters.department} onValueChange={(v) => handleFilterChange('department', v)}>
            <SelectTrigger><SelectValue placeholder="Filter by Department" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.year} onValueChange={(v) => handleFilterChange('year', v)}>
            <SelectTrigger><SelectValue placeholder="Filter by Year" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.event} onValueChange={(v) => handleFilterChange('event', v)}>
            <SelectTrigger><SelectValue placeholder="Filter by Event" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              {events.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={downloadCSV} variant="outline" className="shrink-0">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                    {tableHeaders.map(header => (
                        <TableHead key={header.key}>
                            <Button variant="ghost" onClick={() => handleSort(header.key)}>
                                {header.label}
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                        </TableHead>
                    ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                {filteredData.length > 0 ? (
                    filteredData.map(reg => (
                    <TableRow key={reg.id}>
                        <TableCell className="font-medium">{reg.name}</TableCell>
                        <TableCell>{reg.rollNumber}</TableCell>
                        <TableCell>{reg.department}</TableCell>
                        <TableCell>{reg.year}</TableCell>
                        <TableCell>
                          {reg.event1}
                          {reg.event2 && `, ${reg.event2}`}
                          {reg.teamMember2 && ` (+ ${reg.teamMember2})`}
                        </TableCell>
                        <TableCell>{reg.createdAt ? format(reg.createdAt.toDate(), 'MMM d, h:mm a') : 'N/A'}</TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        No results found.
                    </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
