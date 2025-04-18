import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useTheme } from "next-themes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Check, Palette, User } from "lucide-react";

export default function Settings() {
  const { theme, setTheme } = useTheme();

  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [confirmPassword, setConfirmPassword] = useState<string>("")
  const [oldPassword, setOldPassword] = useState<string>("")

  const [emailError, setEmailError] = useState<string>("")
  const [passwordError, setPasswordError] = useState<string>("")
  const [emailErrorVisible, setEmailErrorVisible] = useState<boolean>(false)
  const [passwordErrorVisible, setPasswordErrorVisible] = useState<boolean>(false)

  const [passwordSuccess, setPasswordSuccess] = useState<boolean>(false)
  const [emailSuccess, setEmailSuccess] = useState<boolean>(false)

  const changeEmail = async () => {
    setEmailErrorVisible(false);
    setEmailSuccess(false);
    setEmailError("");

    if (!email) {
      setEmailError("Email is required");
      setEmailErrorVisible(true);
      setTimeout(() => {
        setEmailErrorVisible(false);
        setEmailError("");
      }
      , 3000);
      return;
    }
    try {
      await axios.post('/api/auth/edit_email', {
        newEmail: email,
        jwtToken: Cookies.get('token')
      });
      setEmailSuccess(true);
      setEmail("");
      setTimeout(() => {
        setEmailSuccess(false);
      }, 3000);
    } catch (error: any) {
      setEmailError(error.response.data.error);
      setEmailErrorVisible(true);
      setTimeout(() => {
        setEmailErrorVisible(false);
        setEmailError("");
      }, 3000);      
    }
  }

  const changePassword = async () => {
    try {
      if (password !== confirmPassword) {
        setPasswordError("Passwords do not match");
        setPasswordErrorVisible(true);
        setTimeout(() => {
          setPasswordErrorVisible(false);
          setPasswordError("");
        }, 3000);
        return;
      }
      if (!oldPassword || !password || !confirmPassword) {
        setPasswordError("All fields are required");
        setPasswordErrorVisible(true);
        setTimeout(() => {
          setPasswordErrorVisible(false);
          setPasswordError("");
        }, 3000);
        return;
      }

      const response = await axios.post('/api/auth/edit_password', {
        oldPassword: oldPassword,
        newPassword: password,
        jwtToken: Cookies.get('token')
      });
      
      if (response.status === 200) {
        setPasswordSuccess(true);
        setPassword("");
        setOldPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          setPasswordSuccess(false);
        }, 3000);
      }
    } catch (error: any) {
      setPasswordErrorVisible(true);
      setPasswordError(error.response.data.error);
      setTimeout(() => {
        setPasswordErrorVisible(false);
        setPasswordError("");
      }, 3000);
    }
  }
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbPage>/</BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Settings</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="p-6">
          <div className="pb-4">
            <span className="text-3xl font-bold">Settings</span>
          </div>
          <div className="grid gap-6">
            <Card className="overflow-hidden border-2 border-muted/20 shadow-sm">
              <CardHeader className="bg-muted/10 px-6 py-4 border-b">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">User Settings</h2>
                </div>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="text-sm text-muted-foreground mb-6">
                  Manage your user settings here. You can change your email, password, and other account settings.
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="border-b pb-2">
                      <h3 className="font-semibold text-lg">Change Email</h3>
                    </div>

                    {emailErrorVisible && (
                      <Alert variant="destructive" className="animate-in fade-in-50">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{emailError}</AlertDescription>
                      </Alert>
                    )}

                    {emailSuccess && (
                      <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300 animate-in fade-in-50">
                        <Check className="h-4 w-4" />
                        <AlertTitle>Success</AlertTitle>
                        <AlertDescription>Email changed successfully.</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-3">
                      <Input
                        type="email"
                        placeholder="Enter new email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11"
                      />
                      <Button onClick={changeEmail} className="w-full h-11">
                        Change Email
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="border-b pb-2">
                      <h3 className="font-semibold text-lg">Change Password</h3>
                    </div>

                    {passwordErrorVisible && (
                      <Alert variant="destructive" className="animate-in fade-in-50">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{passwordError}</AlertDescription>
                      </Alert>
                    )}

                    {passwordSuccess && (
                      <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300 animate-in fade-in-50">
                        <Check className="h-4 w-4" />
                        <AlertTitle>Success</AlertTitle>
                        <AlertDescription>Password changed successfully.</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-3">
                      <Input
                        type="password"
                        placeholder="Enter old password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="h-11"
                      />
                      <Input
                        type="password"
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-11"
                      />
                      <Input
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-11"
                      />
                      <Button onClick={changePassword} className="w-full h-11">
                        Change Password
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-2 border-muted/20 shadow-sm">
              <CardHeader className="bg-muted/10 px-6 py-4 border-b">
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Theme Settings</h2>
                </div>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="text-sm text-muted-foreground mb-6">
                  Select a theme for the application. You can choose between light, dark, or system theme.
                </div>

                <div className="max-w-md">
                  <Select value={theme} onValueChange={(value: string) => setTheme(value)}>
                    <SelectTrigger className="w-full h-11">
                      <SelectValue>
                        {(theme ?? "system").charAt(0).toUpperCase() + (theme ?? "system").slice(1)}
                      </SelectValue>
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
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
