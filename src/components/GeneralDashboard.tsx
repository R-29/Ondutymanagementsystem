import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { LogOut, CalendarIcon, Download, Filter } from 'lucide-react';
import { ODApplication } from '../types';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

interface GeneralDashboardProps {
  onLogout: () => void;
  onBackToRoleDashboard: () => void;
}

// Mock approved OD applications
const mockApprovedApplications: ODApplication[] = [
  {
    id: '1',
    studentRegNo: 'REG001',
    studentName: 'Alice Johnson',
    year: 3,
    section: 'A',
    odType: 'internal',
    clubName: 'Coding Club',
    role: 'Participant',
    eventName: 'Hackathon',
    startDate: new Date('2025-10-16'),
    endDate: new Date('2025-10-16'),
    facultyApproved: true,
    hodApproved: true,
    status: 'approved',
    submittedAt: new Date('2025-09-28'),
  },
  {
    id: '2',
    studentRegNo: 'REG002',
    studentName: 'Bob Smith',
    year: 2,
    section: 'B',
    odType: 'external',
    collegeName: 'ABC College',
    role: 'Volunteer',
    eventName: 'Technical Fest',
    startDate: new Date('2025-10-16'),
    endDate: new Date('2025-10-18'),
    facultyApproved: true,
    hodApproved: true,
    status: 'approved',
    submittedAt: new Date('2025-09-29'),
  },
  {
    id: '3',
    studentRegNo: 'REG003',
    studentName: 'Carol Davis',
    year: 4,
    section: 'A',
    odType: 'internal',
    clubName: 'Music Club',
    role: 'Coordinator',
    eventName: 'Cultural Fest',
    startDate: new Date('2025-10-15'),
    endDate: new Date('2025-10-17'),
    facultyApproved: true,
    hodApproved: true,
    status: 'approved',
    submittedAt: new Date('2025-09-30'),
  },
  {
    id: '4',
    studentRegNo: 'REG004',
    studentName: 'David Wilson',
    year: 3,
    section: 'B',
    odType: 'external',
    collegeName: 'XYZ University',
    role: 'Speaker',
    eventName: 'Tech Conference',
    startDate: new Date('2025-10-16'),
    endDate: new Date('2025-10-16'),
    facultyApproved: true,
    hodApproved: true,
    status: 'approved',
    submittedAt: new Date('2025-10-01'),
  },
  {
    id: '5',
    studentRegNo: 'REG005',
    studentName: 'Emma Brown',
    year: 1,
    section: 'C',
    odType: 'internal',
    clubName: 'Drama Club',
    role: 'Participant',
    eventName: 'Annual Day',
    startDate: new Date('2025-10-16'),
    endDate: new Date('2025-10-16'),
    facultyApproved: true,
    hodApproved: true,
    status: 'approved',
    submittedAt: new Date('2025-10-02'),
  },
];

export function GeneralDashboard({ onLogout, onBackToRoleDashboard }: GeneralDashboardProps) {
  const { user, logout } = useAuth();
  const [applications] = useState(mockApprovedApplications);
  
  // Filter states
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [odTypeFilter, setOdTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('approved');

  // Get unique values for filters
  const years = ['all', ...Array.from(new Set(applications.map(app => app.year.toString())))];
  const sections = ['all', ...Array.from(new Set(applications.map(app => app.section)))];

  // Filter applications
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      // Date filter - check if selected date is within the OD period
      const dateMatch = isWithinInterval(selectedDate, {
        start: startOfDay(new Date(app.startDate)),
        end: endOfDay(new Date(app.endDate))
      });

      // Year filter
      const yearMatch = yearFilter === 'all' || app.year.toString() === yearFilter;

      // Section filter
      const sectionMatch = sectionFilter === 'all' || app.section === sectionFilter;

      // OD Type filter
      const odTypeMatch = odTypeFilter === 'all' || app.odType === odTypeFilter;

      // Status filter
      const statusMatch = statusFilter === 'all' || app.status === statusFilter;

      return dateMatch && yearMatch && sectionMatch && odTypeMatch && statusMatch;
    });
  }, [applications, selectedDate, yearFilter, sectionFilter, odTypeFilter, statusFilter]);

  const handleLogout = () => {
    logout();
    onLogout();
  };

  const handleExport = () => {
    // Generate CSV content
    const headers = ['Reg No', 'Name', 'Year', 'Section', 'OD Type', 'Club/College', 'Event', 'Role', 'Start Date', 'End Date', 'Status'];
    const rows = filteredApplications.map(app => [
      app.studentRegNo,
      app.studentName,
      app.year,
      app.section,
      app.odType,
      app.clubName || app.collegeName || '',
      app.eventName,
      app.role,
      format(new Date(app.startDate), 'yyyy-MM-dd'),
      format(new Date(app.endDate), 'yyyy-MM-dd'),
      app.status
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `od-approved-${format(selectedDate, 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetFilters = () => {
    setSelectedDate(new Date());
    setYearFilter('all');
    setSectionFilter('all');
    setOdTypeFilter('all');
    setStatusFilter('approved');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl">General Dashboard</h1>
            <p className="text-muted-foreground">View all approved OD applications</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onBackToRoleDashboard}>
              Back to My Dashboard
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Filters Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
                <CardDescription>Filter OD applications by various attributes</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Reset Filters
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Date Filter */}
              <div className="space-y-2">
                <label className="text-sm">Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(selectedDate, 'PPP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Year Filter */}
              <div className="space-y-2">
                <label className="text-sm">Year</label>
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {years.filter(y => y !== 'all').map(year => (
                      <SelectItem key={year} value={year}>
                        Year {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Section Filter */}
              <div className="space-y-2">
                <label className="text-sm">Section</label>
                <Select value={sectionFilter} onValueChange={setSectionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sections</SelectItem>
                    {sections.filter(s => s !== 'all').map(section => (
                      <SelectItem key={section} value={section}>
                        Section {section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* OD Type Filter */}
              <div className="space-y-2">
                <label className="text-sm">OD Type</label>
                <Select value={odTypeFilter} onValueChange={setOdTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select OD type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="internal">Internal</SelectItem>
                    <SelectItem value="external">External</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  Approved OD for {format(selectedDate, 'MMMM dd, yyyy')}
                </CardTitle>
                <CardDescription>
                  {filteredApplications.length} student{filteredApplications.length !== 1 ? 's' : ''} on duty
                </CardDescription>
              </div>
              <Button variant="outline" onClick={handleExport} disabled={filteredApplications.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {filteredApplications.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No approved OD applications found for the selected filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reg No</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>OD Type</TableHead>
                      <TableHead>Club/College</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell>{app.studentRegNo}</TableCell>
                        <TableCell>{app.studentName}</TableCell>
                        <TableCell>Year {app.year}</TableCell>
                        <TableCell>Section {app.section}</TableCell>
                        <TableCell>
                          <Badge variant={app.odType === 'internal' ? 'secondary' : 'outline'}>
                            {app.odType}
                          </Badge>
                        </TableCell>
                        <TableCell>{app.clubName || app.collegeName}</TableCell>
                        <TableCell>{app.eventName}</TableCell>
                        <TableCell>{app.role}</TableCell>
                        <TableCell>{format(new Date(app.startDate), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{format(new Date(app.endDate), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>
                          {app.status === 'approved' && (
                            <Badge className="bg-green-500">Approved</Badge>
                          )}
                          {app.status === 'pending' && (
                            <Badge variant="outline">Pending</Badge>
                          )}
                          {app.status === 'rejected' && (
                            <Badge variant="destructive">Rejected</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
