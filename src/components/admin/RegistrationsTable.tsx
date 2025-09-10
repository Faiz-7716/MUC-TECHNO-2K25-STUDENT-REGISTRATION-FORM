"use client";

import { useState, useMemo, ChangeEvent, useTransition } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowUpDown, Download, Search, FileDown } from 'lucide-react';
import { format } from 'date-fns';

interface RegistrationsTableProps {
  initialData: Registration[];
}

type SortKey = keyof Registration | '';
type SortDirection = 'asc' | 'desc';

export default function RegistrationsTable({ initialData }: RegistrationsTableProps) {
  const [isPending, startTransition] = useTransition();
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
    let sortedData = [...initialData];

    if (sorting.key) {
      sortedData.sort((a, b) => {
        const aValue = a[sorting.key!];
        const bValue = b[sorting.key!];

        if (aValue === undefined || aValue === null) return 1;
        if (bValue === undefined || bValue === null) return -1;
        
        if (sorting.key === 'createdAt' && aValue?.toDate && bValue?.toDate) {
             return sorting.direction === 'asc' ? aValue.toDate().getTime() - bValue.toDate().getTime() : bValue.toDate().getTime() - aValue.toDate().getTime();
        }

        if (String(aValue).toLowerCase() < String(bValue).toLowerCase()) return sorting.direction === 'asc' ? -1 : 1;
        if (String(aValue).toLowerCase() > String(bValue).toLowerCase()) return sorting.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return sortedData.filter(reg => {
      const searchLower = searchTerm.toLowerCase();
      const searchMatch =
        reg.name.toLowerCase().includes(searchLower) ||
        reg.rollNumber.toLowerCase().includes(searchLower);
      const departmentMatch = filters.department === 'all' || reg.department === filters.department;
      const yearMatch = filters.year === 'all' || reg.year === filters.year;
      const eventMatch = filters.event === 'all' || reg.event1 === filters.event || reg.event2 === filters.event;

      return searchMatch && departmentMatch && yearMatch && eventMatch;
    });
  }, [initialData, searchTerm, filters, sorting]);
  
  const handleFilterChange = (filterType: 'department' | 'year' | 'event', value: string) => {
    startTransition(() => {
      setFilters(prev => ({ ...prev, [filterType]: value }));
    });
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    startTransition(() => {
      setSearchTerm(e.target.value);
    });
  };
  
  const downloadCSV = () => {
    const headers = ['Name', 'Roll Number', 'Department', 'Year', 'Mobile', 'Event 1', 'Event 2', 'Team Member', 'Registered At'];
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
        `"${row.createdAt ? format(row.createdAt.toDate(), 'yyyy-MM-dd HH:mm:ss') : ''}"`
      ].join(','))
    ];
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `muc_techno_2k25_registrations_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Master Registrations</CardTitle>
            <CardDescription>
                {filteredData.length} of {initialData.length} registrations showing.
            </CardDescription>
        </div>
        <Button onClick={downloadCSV} variant="outline" className="shrink-0">
          <FileDown />
          Export CSV
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or roll no..."
              defaultValue={searchTerm}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:flex-1">
            <Select value={filters.department} onValueChange={(v) => handleFilterChange('department', v)}>
              <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.year} onValueChange={(v) => handleFilterChange('year', v)}>
              <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.event} onValueChange={(v) => handleFilterChange('event', v)}>
              <SelectTrigger><SelectValue placeholder="Event" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                {events.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                    {tableHeaders.map(header => (
                        <TableHead key={header.key} className="px-2 first:px-4">
                            <Button variant="ghost" onClick={() => handleSort(header.key)} className="px-2">
                                {header.label}
                                {sorting.key === header.key && (
                                    <ArrowUpDown className="ml-2 h-4 w-4" />
                                )}
                            </Button>
                        </TableHead>
                    ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                {(isPending || filteredData.length > 0) ? (
                    filteredData.map(reg => (
                    <TableRow key={reg.id} className={isPending ? 'opacity-50' : ''}>
                        <TableCell className="font-medium px-4">{reg.name}</TableCell>
                        <TableCell className="px-2">{reg.rollNumber}</TableCell>
                        <TableCell className="px-2">{reg.department}</TableCell>
                        <TableCell className="px-2">{reg.year}</TableCell>
                        <TableCell className="px-2">
                          <div className="flex flex-col">
                            <span>{reg.event1}</span>
                            {reg.event2 && <span className="text-muted-foreground">{reg.event2}</span>}
                          </div>
                          {reg.teamMember2 && <span className="text-xs text-muted-foreground mt-1">(+ {reg.teamMember2})</span>}
                        </TableCell>
                        <TableCell className="px-2">{reg.createdAt ? format(reg.createdAt.toDate(), 'MMM d, h:mm a') : 'N/A'}</TableCell>
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
