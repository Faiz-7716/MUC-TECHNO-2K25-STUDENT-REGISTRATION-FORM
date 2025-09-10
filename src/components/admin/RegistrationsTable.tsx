"use client";

import { useState, useMemo, ChangeEvent, useTransition, useEffect } from 'react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowUpDown, FileDown, Search, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface RegistrationsTableProps {
  initialData: Registration[];
  onDelete: (id: string) => Promise<void>;
  onDeleteMultiple: (ids: string[]) => Promise<void>;
}

type SortKey = keyof Registration | '';
type SortDirection = 'asc' | 'desc';

export default function RegistrationsTable({ initialData, onDelete, onDeleteMultiple }: RegistrationsTableProps) {
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    department: 'all',
    year: 'all',
    event: 'all',
  });
  const [sorting, setSorting] = useState<{ key: SortKey; direction: SortDirection }>({
    key: 'createdAt',
    direction: 'desc',
  });
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

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
  
  useEffect(() => {
    setSelectedRowIds([]);
  }, [searchTerm, filters]);

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

  const handleDelete = async (id: string) => {
    try {
      await onDelete(id);
      toast({
        title: "Success",
        description: "Registration deleted successfully.",
        variant: "default",
      });
    } catch (error) {
       toast({
        title: "Error",
        description: "Failed to delete registration.",
        variant: "destructive",
      });
    }
  }

  const handleBulkDelete = async () => {
    try {
      await onDeleteMultiple(selectedRowIds);
      toast({
        title: "Bulk Delete Successful",
        description: `${selectedRowIds.length} registrations have been deleted.`,
      });
      setSelectedRowIds([]);
    } catch (error) {
      toast({
        title: "Bulk Delete Failed",
        description: "An error occurred while deleting the registrations.",
        variant: "destructive",
      });
    }
  };

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if(checked === true) {
      setSelectedRowIds(filteredData.map(row => row.id));
    } else {
      setSelectedRowIds([]);
    }
  };

  const handleRowSelect = (id: string) => {
    setSelectedRowIds(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
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
        `"${row.event2 || 'N/A'}"`,
        `"${row.teamMember2 || 'N/A'}"`,
        `"${row.createdAt ? format(row.createdAt.toDate(), 'yyyy-MM-dd HH:mm:ss') : 'N/A'}"`
      ].join(','))
    ];
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MUC_TECHNO_2K25_Registrations_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
     toast({
      title: "Export Successful",
      description: "The registration data has been exported to CSV.",
    });
  };

  const tableHeaders: { key: SortKey; label: string, hideSort?: boolean }[] = [
    { key: 'name', label: 'Name' },
    { key: 'rollNumber', label: 'Roll No' },
    { key: 'department', label: 'Department' },
    { key: 'year', label: 'Year' },
    { key: 'event1', label: 'Events' },
    { key: 'createdAt', label: 'Registered' },
    { key: '', label: 'Actions', hideSort: true },
  ];

  const isAllSelected = selectedRowIds.length > 0 && selectedRowIds.length === filteredData.length;
  const isSomeSelected = selectedRowIds.length > 0 && selectedRowIds.length < filteredData.length;

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
        <div>
            <CardTitle>Master Registrations</CardTitle>
            <CardDescription>
                {filteredData.length} of {initialData.length} registrations showing. {selectedRowIds.length > 0 && `(${selectedRowIds.length} selected)`}
            </CardDescription>
        </div>
        <div className="flex flex-col-reverse sm:flex-row gap-2 w-full sm:w-auto">
          {selectedRowIds.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full sm:w-auto">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete ({selectedRowIds.length})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the selected {selectedRowIds.length} registrations.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive hover:bg-destructive/90">
                    Yes, delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button onClick={downloadCSV} variant="outline" className="shrink-0 w-full sm:w-auto">
            <FileDown />
            Export as CSV
          </Button>
        </div>
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
                    <TableHead className="px-2" style={{width: '40px'}}>
                        <Checkbox 
                          checked={isAllSelected || (isSomeSelected && 'indeterminate')}
                          onCheckedChange={handleSelectAll}
                          aria-label="Select all rows"
                        />
                    </TableHead>
                    {tableHeaders.map(header => (
                        <TableHead key={header.key || 'actions'} className="px-2 first:px-4">
                           {header.hideSort ? (
                             <span className="px-2">{header.label}</span>
                           ) : (
                            <Button variant="ghost" onClick={() => handleSort(header.key)} className="px-2">
                                {header.label}
                                {sorting.key === header.key ? (
                                    <ArrowUpDown className="ml-2 h-4 w-4" />
                                ) : <div className="w-4 h-4 ml-2"/> }
                            </Button>
                           )}
                        </TableHead>
                    ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                {(isPending || filteredData.length > 0) ? (
                    filteredData.map(reg => (
                    <TableRow key={reg.id} className={isPending ? 'opacity-50' : ''} data-state={selectedRowIds.includes(reg.id) && "selected"}>
                        <TableCell className="px-2">
                           <Checkbox
                                checked={selectedRowIds.includes(reg.id)}
                                onCheckedChange={() => handleRowSelect(reg.id)}
                                aria-label={`Select row for ${reg.name}`}
                            />
                        </TableCell>
                        <TableCell className="font-medium px-4">{reg.name}</TableCell>
                        <TableCell className="px-2">{reg.rollNumber}</TableCell>
                        <TableCell className="px-2">{reg.department}</TableCell>
                        <TableCell className="px-2">{reg.year}</TableCell>
                        <TableCell className="px-2">
                          <div className="flex flex-col">
                            <span>{reg.event1}</span>
                            {reg.event2 && <span className="text-muted-foreground">{reg.event2}</span>}
                          </div>
                          {reg.teamMember2 && <span className="text-xs text-muted-foreground mt-1">(with {reg.teamMember2})</span>}
                        </TableCell>
                        <TableCell className="px-2">{reg.createdAt ? format(reg.createdAt.toDate(), 'MMM d, h:mm a') : 'N/A'}</TableCell>
                        <TableCell className="px-2">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the registration for <span className="font-semibold">{reg.name}</span>.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(reg.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                    <TableCell colSpan={tableHeaders.length + 1} className="h-24 text-center">
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
