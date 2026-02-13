import { SignUpForm } from "@/components/auth/sign-up";
import { AuthRedirect } from "@/components/shared/auth-redirect";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <AuthRedirect requireAuth={false} redirectTo="/dashboard">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo Section */}
          <div className="text-center mb-8">
            <div className="inline-block">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Taskly
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Create your account
              </p>
            </div>
          </div>
          
          {/* Sign Up Form */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6">
            <SignUpForm />
          </div>
          
          {/* Bottom Links */}
          <div className="text-center space-y-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link 
                href="/sign-in" 
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AuthRedirect>
  );
}
