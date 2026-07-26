import LoginForm from "@/components/auth/LoginForm";

export default function Login() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card">
          <h1 className="text-2xl font-bold text-gray-900 mb-1 text-center">
            Welcome back
          </h1>
          <p className="text-sm text-gray-500 text-center mb-6">
            Log in to your account
          </p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
