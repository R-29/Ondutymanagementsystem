import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { LogOut, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface StudentDashboardProps {
  onLogout: () => void;
  onViewGeneral: () => void;
}

export function StudentDashboard({ onLogout, onViewGeneral }: StudentDashboardProps) {
  const { user, logout } = useAuth();
  const [year, setYear] = useState('');
  const [section, setSection] = useState('');
  const [odType, setOdType] = useState<'internal' | 'external'>('internal');
  const [clubName, setClubName] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [role, setRole] = useState('');
  const [eventName, setEventName] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const handleSubmit = () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }

    if (endDate < startDate) {
      alert('End date cannot be before start date');
      return;
    }

    const application = {
      studentName: user?.name,
      studentRegNo: user?.regNo,
      year,
      section,
      odType,
      clubName: odType === 'internal' ? clubName : undefined,
      collegeName: odType === 'external' ? collegeName : undefined,
      role,
      eventName,
      startDate,
      endDate,
      status: 'pending',
      submittedAt: new Date(),
    };
    
    console.log('OD Application submitted:', application);
    alert('OD Application submitted successfully!');
    
    // Reset form
    setYear('');
    setSection('');
    setClubName('');
    setCollegeName('');
    setRole('');
    setEventName('');
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const handleLogout = () => {
    logout();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1>Student Dashboard</h1>
            <p className="text-muted-foreground">Welcome, {user?.name}</p>
            <p className="text-sm text-muted-foreground">Reg No: {user?.regNo}</p>
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
            <CardTitle>Apply for On Duty (OD)</CardTitle>
            <CardDescription>Fill in the details to submit your OD application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student-name">Name</Label>
                <Input
                  id="student-name"
                  value={user?.name || ''}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1st Year</SelectItem>
                    <SelectItem value="2">2nd Year</SelectItem>
                    <SelectItem value="3">3rd Year</SelectItem>
                    <SelectItem value="4">4th Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="section">Section</Label>
                <Select value={section} onValueChange={setSection}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Section A</SelectItem>
                    <SelectItem value="B">Section B</SelectItem>
                    <SelectItem value="C">Section C</SelectItem>
                    <SelectItem value="D">Section D</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>OD Type</Label>
                <RadioGroup value={odType} onValueChange={(value) => setOdType(value as 'internal' | 'external')}>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="internal" id="internal" />
                      <Label htmlFor="internal">Internal</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="external" id="external" />
                      <Label htmlFor="external">External</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {odType === 'internal' && (
              <div className="space-y-2">
                <Label htmlFor="club-name">Club Name</Label>
                <Select value={clubName} onValueChange={setClubName}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select club" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="coding-club">Coding Club</SelectItem>
                    <SelectItem value="music-club">Music Club</SelectItem>
                    <SelectItem value="sports-club">Sports Club</SelectItem>
                    <SelectItem value="art-club">Art Club</SelectItem>
                    <SelectItem value="drama-club">Drama Club</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {odType === 'external' && (
              <div className="space-y-2">
                <Label htmlFor="college-name">College Name</Label>
                <Input
                  id="college-name"
                  placeholder="Enter college name"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="participant">Participant</SelectItem>
                  <SelectItem value="coordinator">Coordinator</SelectItem>
                  <SelectItem value="volunteer">Volunteer</SelectItem>
                  <SelectItem value="organizer">Organizer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-name">Event Name</Label>
              <Select value={eventName} onValueChange={setEventName}>
                <SelectTrigger>
                  <SelectValue placeholder="Select event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hackathon">Hackathon</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="seminar">Seminar</SelectItem>
                  <SelectItem value="sports-event">Sports Event</SelectItem>
                  <SelectItem value="cultural-fest">Cultural Fest</SelectItem>
                  <SelectItem value="technical-fest">Technical Fest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>OD Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>OD End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      disabled={(date) => {
                        const today = new Date(new Date().setHours(0, 0, 0, 0));
                        if (date < today) return true;
                        if (startDate && date < startDate) return true;
                        return false;
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <Button className="w-full" onClick={handleSubmit}>
              Apply for OD
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}