import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { LogOut } from 'lucide-react';
import { ODApplication } from '../types';

interface HODDashboardProps {
  onLogout: () => void;
  onViewGeneral: () => void;
}

// Mock OD applications that are faculty approved
const mockFacultyApprovedApplications: ODApplication[] = [
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
    startDate: new Date('2025-10-20'),
    endDate: new Date('2025-10-22'),
    facultyApproved: true,
    hodApproved: false,
    status: 'pending',
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
    startDate: new Date('2025-10-25'),
    endDate: new Date('2025-10-27'),
    facultyApproved: true,
    hodApproved: false,
    status: 'pending',
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
    startDate: new Date('2025-11-01'),
    endDate: new Date('2025-11-07'),
    facultyApproved: true,
    hodApproved: false,
    status: 'pending',
    submittedAt: new Date('2025-09-30'),
  },
];

export function HODDashboard({ onLogout, onViewGeneral }: HODDashboardProps) {
  const { user, logout } = useAuth();
  const [applications, setApplications] = useState(mockFacultyApprovedApplications);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleCheckboxChange = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(applications.filter(app => !app.hodApproved).map(app => app.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleApprove = () => {
    setApplications(applications.map(app => 
      selectedIds.includes(app.id) 
        ? { ...app, hodApproved: true, status: 'approved' as const }
        : app
    ));
    alert(`${selectedIds.length} application(s) approved successfully!`);
    setSelectedIds([]);
  };

  const handleLogout = () => {
    logout();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1>HOD Dashboard</h1>
            <p className="text-muted-foreground">Welcome, {user?.name}</p>
            <p className="text-sm text-muted-foreground">Department: {user?.department}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onViewGeneral}>
              View General Dashboard
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>OD Applications - Final Approval</CardTitle>
            <CardDescription>Review faculty-approved applications for final approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selectedIds.length > 0 && 
                          selectedIds.length === applications.filter(app => !app.hodApproved).length
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Reg No</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Faculty Approval</TableHead>
                    <TableHead>HOD Approval</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(app.id)}
                          onCheckedChange={(checked) => handleCheckboxChange(app.id, checked as boolean)}
                          disabled={app.hodApproved}
                        />
                      </TableCell>
                      <TableCell>{app.studentRegNo}</TableCell>
                      <TableCell>Year {app.year}</TableCell>
                      <TableCell>{app.studentName}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          ✓ Approved
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {app.hodApproved ? (
                          <Badge className="bg-green-600">
                            ✓ Approved
                          </Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {selectedIds.length} application(s) selected
              </p>
              <Button 
                onClick={handleApprove} 
                disabled={selectedIds.length === 0}
              >
                Approve Selected
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}