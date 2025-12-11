import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import { Eye, EyeOff, Package, Mail, Lock, Loader2, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/components/ui/toast-notification"

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, verify2FA } = useAuth()
  const { success, error: showError } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [requires2FA, setRequires2FA] = useState(false)
  const [twoFactorMethod, setTwoFactorMethod] = useState(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
    twoFactorCode: "",
  })
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (requires2FA) {
      // Handle 2FA verification
      if (!formData.twoFactorCode || formData.twoFactorCode.length !== 6) {
        setErrors({ twoFactorCode: "Please enter a valid 6-digit code" })
        return
      }

      setIsLoading(true)
      try {
        await verify2FA(formData.email, formData.twoFactorCode)
        success("Login successful!")
        navigate("/profile")
      } catch (err) {
        showError(err.message || "Invalid 2FA code. Please try again.")
        setErrors({ twoFactorCode: err.message || "Invalid code" })
      } finally {
        setIsLoading(false)
      }
      return
    }

    // Regular login
    if (!validateForm()) return

    setIsLoading(true)
    setErrors({}) // Clear previous errors
    try {
      const result = await login(formData.email, formData.password)
      
      console.log("Login result:", result) // Debug log
      
      // Check if 2FA is required
      if (result && result.requiresTwoFactor) {
        console.log("2FA required, showing OTP input") // Debug log
        setRequires2FA(true)
        setTwoFactorMethod(result.twoFactorMethod || "email")
        setFormData({ ...formData, twoFactorCode: "" }) // Clear OTP field
        success(`2FA code sent to your ${result.twoFactorMethod || "email"}. Please check your email.`)
      } else if (result && result.success) {
        success("Login successful!")
        navigate("/profile")
      } else {
        // If no clear success, try to get user data
        success("Login successful!")
        navigate("/profile")
      }
    } catch (err) {
      console.error("Login error:", err) // Debug log
      showError(err.message || "Login failed. Please check your credentials.")
      setErrors({ general: err.message || "Login failed" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Login - BuyPoint</title>
        <meta name="description" content="Sign in to your BuyPoint account" />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center justify-center gap-2 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Package className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">BuyPoint</span>
          </Link>

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                {requires2FA ? "Two-Factor Authentication" : "Welcome Back"}
              </CardTitle>
              <CardDescription>
                {requires2FA 
                  ? `Enter the 6-digit code sent to your ${twoFactorMethod || "email"}`
                  : "Sign in to your account to continue shopping"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {requires2FA && (
                <div className="mb-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <p className="text-sm font-medium text-primary">
                      Two-Factor Authentication Required
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    We've sent a 6-digit verification code to your {twoFactorMethod || "email"}. 
                    Please enter it below to complete your login.
                  </p>
                </div>
              )}
              
              {errors.general && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{errors.general}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!requires2FA ? (
                  <>
                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          className="pl-9"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          disabled={isLoading}
                        />
                      </div>
                      {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link to="#" className="text-xs text-primary hover:underline">
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="pl-9 pr-10"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                        </button>
                      </div>
                      {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                    </div>
                  </>
                ) : (
                  /* 2FA Code */
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="twoFactorCode" className="text-base font-medium">
                        Enter Verification Code
                      </Label>
                      <Input
                        id="twoFactorCode"
                        type="text"
                        inputMode="numeric"
                        placeholder="000000"
                        maxLength={6}
                        className="text-center text-3xl tracking-[0.5em] font-mono h-16"
                        value={formData.twoFactorCode}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                          setFormData({ ...formData, twoFactorCode: value })
                          setErrors({ ...errors, twoFactorCode: null })
                        }}
                        disabled={isLoading}
                        autoFocus
                      />
                      {errors.twoFactorCode && (
                        <p className="text-xs text-destructive mt-1">{errors.twoFactorCode}</p>
                      )}
                      <p className="text-xs text-muted-foreground text-center">
                        Enter the 6-digit code sent to your {twoFactorMethod || "email"}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full text-sm"
                      onClick={() => {
                        setRequires2FA(false)
                        setFormData({ ...formData, twoFactorCode: "" })
                        setErrors({})
                      }}
                      disabled={isLoading}
                    >
                      ← Back to login
                    </Button>
                  </div>
                )}

                {!requires2FA && (
                  <>
                    {/* Remember Me */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={formData.rememberMe}
                        onCheckedChange={(checked) => setFormData({ ...formData, rememberMe: checked })}
                        disabled={isLoading}
                      />
                      <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                        Remember me for 30 days
                      </Label>
                    </div>
                  </>
                )}

                {/* Submit */}
                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {requires2FA ? "Verifying..." : "Signing in..."}
                    </>
                  ) : (
                    requires2FA ? "Verify Code" : "Sign In"
                  )}
                </Button>
              </form>

              {!requires2FA && (
                <>
                  {/* Divider */}
                  <div className="relative my-6">
                    <Separator />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                      OR
                    </span>
                  </div>

                  {/* Social Login */}
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full bg-transparent" type="button">
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Continue with Google
                    </Button>
                    <Button variant="outline" className="w-full bg-transparent" type="button">
                      <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      Continue with Facebook
                    </Button>
                  </div>
                </>
              )}

              {/* Sign Up Link */}
              <p className="mt-6 text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/register" className="text-primary font-medium hover:underline">
                  Sign up
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

