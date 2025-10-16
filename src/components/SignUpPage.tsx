import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface SignUpPageProps {
  onNavigateToLogin: () => void;
  onSignupSuccess: () => void;
}

export function SignUpPage({ onNavigateToLogin, onSignupSuccess }: SignUpPageProps) {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [userType, setUserType] = useState<'student' | 'staff' | 'hod'>('student');
  const [password, setPassword] = useState('');
  const [year, setYear] = useState('');
  const [section, setSection] = useState('');
  const [department, setDepartment] = useState('');

  const handleUserSignup = () => {
    const userData = {
      name,
      role: userType,
      ...(userType === 'student' ? {
        regNo: idNumber,
        year: parseInt(year),
        section,
      } : {
        staffId: idNumber,
        department,
      }),
    };
    
    const success = signup(userData);
    if (success) {
      onSignupSuccess();
    }
  };

  // Club signup state
  const [clubName, setClubName] = useState('');
  const [clubDepartment, setClubDepartment] = useState('');
  const [coordinatorId, setCoordinatorId] = useState('');

  const handleClubSignup = () => {
    // Mock club registration
    alert(`Club "${clubName}" registered successfully!`);
    onNavigateToLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <Tabs defaultValue="user" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="user">User Sign Up</TabsTrigger>
            <TabsTrigger value="club">Club Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="user">
            <Card>
              <CardHeader>
                <CardTitle>User Sign Up</CardTitle>
                <CardDescription>Create a new account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="id-number">ID / Registration Number</Label>
                  <Input
                    id="id-number"
                    placeholder="Enter your ID or Reg No"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>User Type</Label>
                  <RadioGroup value={userType} onValueChange={(value) => setUserType(value as 'student' | 'staff' | 'hod')}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="student" id="student" />
                      <Label htmlFor="student">Student</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="staff" id="staff" />
                      <Label htmlFor="staff">Staff</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="hod" id="hod" />
                      <Label htmlFor="hod">HOD (Head of Department)</Label>
                    </div>
                  </RadioGroup>
                </div>

                {userType === 'student' && (
                  <>
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
                    <div className="space-y-2">
                      <Label htmlFor="section">Section</Label>
                      <Input
                        id="section"
                        placeholder="Enter section (e.g., A, B, C)"
                        value={section}
                        onChange={(e) => setSection(e.target.value)}
                      />
                    </div>
                  </>
                )}

                {(userType === 'staff' || userType === 'hod') && (
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      placeholder="Enter department name"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button className="w-full" onClick={handleUserSignup}>
                  Sign Up
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="club">
            <Card>
              <CardHeader>
                <CardTitle>Club Sign Up</CardTitle>
                <CardDescription>Register a new club</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="club-name">Name of Club</Label>
                  <Input
                    id="club-name"
                    placeholder="Enter club name"
                    value={clubName}
                    onChange={(e) => setClubName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="club-department">Department Name</Label>
                  <Input
                    id="club-department"
                    placeholder="Enter department name"
                    value={clubDepartment}
                    onChange={(e) => setClubDepartment(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coordinator-id">Staff ID (Coordinator)</Label>
                  <Input
                    id="coordinator-id"
                    placeholder="Enter coordinator staff ID"
                    value={coordinatorId}
                    onChange={(e) => setCoordinatorId(e.target.value)}
                  />
                </div>
                <Button className="w-full" onClick={handleClubSignup}>
                  Register Club
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <button 
              onClick={onNavigateToLogin}
              className="text-primary hover:underline"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}