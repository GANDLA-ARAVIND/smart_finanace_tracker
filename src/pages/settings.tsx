import React, { useState } from 'react';
import { User, Mail, Lock, Bell, Globe, Palette, Shield, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/auth-context';
import { useCurrency } from '@/contexts/currency-context';
import { useTheme } from '@/components/theme-provider';
import { toast } from 'sonner';

export default function Settings() {
  const { user, updateProfile, logout } = useAuth();
  const { currentCurrency, currencies, setCurrency } = useCurrency();
  const { theme, setTheme } = useTheme();
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState({
    budgetAlerts: true,
    weeklyReports: true,
    monthlyReports: true,
    transactionReminders: false,
  });

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(profileData);
    toast.success('Profile updated successfully');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    // In a real app, you would validate the current password and update it
    toast.success('Password updated successfully');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handleExportData = () => {
    // In a real app, you would export user data
    toast.info('Data export feature coming soon');
  };

  const handleDeleteAccount = () => {
    // In a real app, you would show a confirmation dialog
    toast.error('Account deletion requires confirmation');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Settings
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Manage your account preferences and application settings
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Settings */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information and profile details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="text-lg">
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    Change Photo
                  </Button>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    JPG, PNG or GIF. Max size 2MB.
                  </p>
                </div>
              </div>

              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    />
                  </div>
                </div>
                <Button type="submit">Update Profile</Button>
              </form>
            </CardContent>
          </Card>

          {/* Password Settings */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    />
                  </div>
                </div>
                <Button type="submit">Update Password</Button>
              </form>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="budgetAlerts">Budget Alerts</Label>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Get notified when you're approaching budget limits
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="budgetAlerts"
                      checked={notifications.budgetAlerts}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, budgetAlerts: checked })
                      }
                      className="data-[state=checked]:bg-blue-600"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="weeklyReports">Weekly Reports</Label>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Receive weekly spending summaries
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="weeklyReports"
                      checked={notifications.weeklyReports}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, weeklyReports: checked })
                      }
                      className="data-[state=checked]:bg-blue-600"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="monthlyReports">Monthly Reports</Label>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Get detailed monthly financial reports
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="monthlyReports"
                      checked={notifications.monthlyReports}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, monthlyReports: checked })
                      }
                      className="data-[state=checked]:bg-blue-600"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="transactionReminders">Transaction Reminders</Label>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Reminders to log transactions
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="transactionReminders"
                      checked={notifications.transactionReminders}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, transactionReminders: checked })
                      }
                      className="data-[state=checked]:bg-blue-600"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* App Settings Sidebar */}
        <div className="space-y-6">
          {/* Appearance */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select value={theme} onValueChange={(value: any) => setTheme(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Currency */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Currency
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Default Currency</Label>
                <Select 
                  value={currentCurrency.code} 
                  onValueChange={(value) => {
                    const currency = currencies.find(c => c.code === value);
                    if (currency) setCurrency(currency);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.name} ({currency.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Data & Privacy */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Data & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full" onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              
              <Separator />
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-red-600">Danger Zone</h4>
                <Button 
                  variant="destructive" 
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium shadow-lg" 
                  onClick={handleDeleteAccount}
                >
                  Delete Account
                </Button>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  This action cannot be undone. All your data will be permanently deleted.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-600 dark:hover:border-slate-500 dark:hover:bg-slate-800 font-medium shadow-sm" 
                onClick={logout}
              >
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}