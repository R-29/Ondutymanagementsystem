import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { UserRole } from '../types';

interface LoginPageProps {
  onNavigateToSignup: () => void;
  onLoginSuccess: () => void;
}

export function LoginPage({ onNavigateToSignup, onLoginSuccess }: LoginPageProps) {
  const { login } = useAuth();
  const [staffId, setStaffId] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [regNo, setRegNo] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [isHOD, setIsHOD] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (role: UserRole, id: string, password: string) => {
    setError('');
    const success = login(role, id, password);
    if (success) {
      onLoginSuccess();
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <Tabs defaultValue="staff" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="staff">Staff/HOD</TabsTrigger>
            <TabsTrigger value="student">Student</TabsTrigger>
          </TabsList>

          <TabsContent value="staff">
            <Card>
              <CardHeader>
                <CardTitle>{isHOD ? 'HOD' : 'Staff'} Portal Login</CardTitle>
                <CardDescription>
                  {isHOD ? 'Login for final OD approvals' : 'Login to manage OD applications'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="role-toggle" className="text-sm">
                      Login as {isHOD ? 'HOD' : 'Staff'}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {isHOD ? 'Head of Department' : 'Faculty Member'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm ${!isHOD ? 'font-semibold' : 'text-muted-foreground'}`}>
                      Staff
                    </span>
                    <Switch
                      id="role-toggle"
                      checked={isHOD}
                      onCheckedChange={setIsHOD}
                    />
                    <span className={`text-sm ${isHOD ? 'font-semibold' : 'text-muted-foreground'}`}>
                      HOD
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="staff-id">Staff ID</Label>
                  <Input
                    id="staff-id"
                    placeholder="Enter your staff ID"
                    value={staffId}
                    onChange={(e) => setStaffId(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleLogin(isHOD ? 'hod' : 'staff', staffId, staffPassword);
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staff-password">Password</Label>
                  <Input
                    id="staff-password"
                    type="password"
                    placeholder="Enter your password"
                    value={staffPassword}
                    onChange={(e) => setStaffPassword(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleLogin(isHOD ? 'hod' : 'staff', staffId, staffPassword);
                      }
                    }}
                  />
                </div>
                {error && <p className="text-destructive text-sm">{error}</p>}
                <Button 
                  className="w-full" 
                  onClick={() => handleLogin(isHOD ? 'hod' : 'staff', staffId, staffPassword)}
                >
                  Login as {isHOD ? 'HOD' : 'Staff'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="student">
            <Card>
              <CardHeader>
                <CardTitle>Student Portal Login</CardTitle>
                <CardDescription>Login to apply for on duty</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-no">Registration Number</Label>
                  <Input
                    id="reg-no"
                    placeholder="Enter your registration number"
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleLogin('student', regNo, studentPassword);
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-password">Password</Label>
                  <Input
                    id="student-password"
                    type="password"
                    placeholder="Enter your password"
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleLogin('student', regNo, studentPassword);
                      }
                    }}
                  />
                </div>
                {error && <p className="text-destructive text-sm">{error}</p>}
                <Button 
                  className="w-full" 
                  onClick={() => handleLogin('student', regNo, studentPassword)}
                >
                  Login
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <button 
              onClick={onNavigateToSignup}
              className="text-primary hover:underline"
            >
              Sign up here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}