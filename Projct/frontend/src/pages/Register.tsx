import RegisterForm from "@/components/auth/RegisterForm";

export default function Register() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="card">
          <h1 className="text-2xl font-bold text-gray-900 mb-1 text-center">
            Create your account
          </h1>
          <p className="text-sm text-gray-500 text-center mb-6">
            Join as a job seeker or employer
          </p>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
