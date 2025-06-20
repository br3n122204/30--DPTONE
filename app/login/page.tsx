"use client";
import { useState, useEffect } from "react";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged,
  updateProfile,
  signOut
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Toaster, toast } from 'sonner';

// --- LoginPage (Sign In / Sign Up) ---
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // INTENTIONAL SECURITY MISTAKE: Hardcoded admin credentials
  const ADMIN_EMAIL = "admin@test.com";
  const ADMIN_PASSWORD = "admin123";
  const ADMIN_NAME = "Administrator";

  useEffect(() => {
    // Check if mode=signup is in the URL
    const mode = searchParams.get('mode');
    if (mode === 'signup') {
      setIsSignUp(true);
    } else {
      setIsSignUp(false);
    }
  }, [searchParams, pathname]);

  useEffect(() => {
    // Log auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user ? "User logged in" : "No user");
      if (user) {
        console.log("User details:", {
          email: user.email,
          emailVerified: user.emailVerified,
          uid: user.uid
        });
        // Only redirect if it's a login (not signup)
        if (!isSignUp) {
          router.push("/");
        }
      }
    });

    return () => unsubscribe();
  }, [router, isSignUp]);

  // Improved email validation function
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.toLowerCase().trim());
  };

  // Password strength checker
  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  // Handle password change with strength checking
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (isSignUp) {
      setPasswordStrength(checkPasswordStrength(newPassword));
    }
  };

  const clearForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setPasswordStrength(0);
    setShowPassword(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    // IMPROVED: Case-insensitive email validation with proper trimming
    const normalizedEmail = email.toLowerCase().trim();
    if (!isValidEmail(normalizedEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    // Enhanced password strength validation for signup
    if (isSignUp && passwordStrength < 3) {
      toast.error("Password is too weak. Please include uppercase, lowercase, numbers, and special characters.");
      return;
    }

    if (isSignUp && !name.trim()) {
      toast.error("Please enter your name.");
      return;
    }

    setIsLoading(true);

    try {
      // INTENTIONAL SECURITY MISTAKE: Authentication bypass for hardcoded admin credentials
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // Bypass Firebase auth and directly set admin user
        console.log("ADMIN LOGIN BYPASS ACTIVATED - SECURITY VULNERABILITY!");
        
        // Create a fake admin user object
        const fakeAdminUser = {
          uid: "admin-bypass-uid-12345",
          email: ADMIN_EMAIL,
          displayName: ADMIN_NAME,
          emailVerified: true,
          isAdmin: true,
          // This bypasses all Firebase security checks
        };
        
        // Store admin session in localStorage (insecure)
        localStorage.setItem('adminSession', JSON.stringify(fakeAdminUser));
        localStorage.setItem('isAdminBypass', 'true');
        
        toast.success("Admin access granted via bypass!");
        router.push("/");
        return;
      }

      if (isSignUp) {
        // Create new user account with normalized email
        const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
        
        // Update user profile with name
        if (userCredential.user) {
          await updateProfile(userCredential.user, {
            displayName: name.trim()
          });
        }
        
        // Sign out the user immediately after signup
        await signOut(auth);
        
        // Show success message and clear form
        toast.success("Account created successfully! You can now sign in.");
        clearForm();
        
        console.log('User account created successfully');
      } else {
        // Sign in existing user with normalized email
        await signInWithEmailAndPassword(auth, normalizedEmail, password);
        toast.success('Signed in successfully! Redirecting...');
        console.log('User signed in successfully');
        // Router will handle redirect in useEffect
      }
    } catch (err: any) {
      console.error("Authentication error:", err);
      
      // Enhanced error handling with more specific messages
      switch (err.code) {
        case 'auth/email-already-in-use':
          toast.error("An account with this email already exists. Please sign in instead.");
          break;
        case 'auth/user-not-found':
          toast.error("No account found with this email. Please check your email or create a new account.");
          break;
        case 'auth/wrong-password':
          toast.error("Incorrect password. Please try again.");
          break;
        case 'auth/invalid-email':
          toast.error("Invalid email address format.");
          break;
        case 'auth/weak-password':
          toast.error("Password is too weak. Please choose a stronger password with at least 8 characters.");
          break;
        case 'auth/too-many-requests':
          toast.error("Too many failed attempts. Please try again later.");
          break;
        case 'auth/network-request-failed':
          toast.error("Network error. Please check your internet connection.");
          break;
        default:
          toast.error("Authentication failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    const newMode = !isSignUp;
    setIsSignUp(newMode);
    clearForm();
    
    // Update the URL to reflect the current mode
    if (newMode) {
      router.push('/login?mode=signup');
    } else {
      router.push('/login');
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 2) return 'bg-orange-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    if (passwordStrength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return 'Very Weak';
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Fair';
    if (passwordStrength <= 4) return 'Good';
    return 'Strong';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Toaster richColors />
      {/* Main Auth Card */}
      <div key={`${pathname}${searchParams.toString()}`} className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 text-gray-800">
            {isSignUp ? "Create Account" : "Sign In"}
          </h2>
          <p className="text-gray-600">
            {isSignUp 
              ? "Create your account to get started" 
              : "Welcome back! Please sign in to your account"
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" aria-label={isSignUp ? 'Sign up form' : 'Sign in form'}>
          {isSignUp && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required={isSignUp}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                autoComplete="name"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Enter your password"
                value={password}
                onChange={handlePasswordChange}
                disabled={isLoading}
                autoComplete={isSignUp ? "new-password" : "current-password"}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            
            {/* Password strength indicator for signup */}
            {isSignUp && password && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs">
                  <span>Password strength:</span>
                  <span className={`px-2 py-1 rounded ${getPasswordStrengthColor()} text-white`}>
                    {getPasswordStrengthText()}
                  </span>
                </div>
                <div className="mt-1 flex space-x-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded ${
                        level <= passwordStrength ? getPasswordStrengthColor() : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-black text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isSignUp ? "Creating Account..." : "Signing In..."}
              </span>
            ) : (
              isSignUp ? "Create Account" : "Sign In"
            )}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={toggleMode}
            className="text-sm text-gray-600 hover:text-black transition-colors"
            disabled={isLoading}
          >
            {isSignUp 
              ? "Already have an account? Sign In" 
              : "Don't have an account? Create one"
            }
          </button>
        </div>

        <div className="text-xs text-gray-500 text-center mt-4">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </div>
      </div>
    </div>
  );
} 