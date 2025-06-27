import { useAuthStore } from "../store/useAuthStore";

const HomePage: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-indigo-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Welcome to DevHub
          </h1>

          {user ? (
            <>
              <p className="mt-6 max-w-lg mx-auto text-xl text-indigo-600">
                Hello, <span className="font-semibold text-purple-600">{user.name}</span>! You're now logged in.
              </p>
              <div className="mt-8 bg-white rounded-lg shadow-lg overflow-hidden w-full max-w-2xl mx-auto">
                <div className="px-6 py-5 sm:px-8 sm:py-7">
                  <h3 className="text-xl font-semibold text-indigo-900">Your Profile</h3>
                  <div className="mt-4 space-y-3 text-base text-indigo-700">
                    <div className="flex items-start">
                      <span className="font-medium w-16 flex-shrink-0">Email:</span>
                      <span className="break-all">{user.email}</span>
                    </div>
                    <div className="flex items-start">
                      <span className="font-medium w-16 flex-shrink-0">Role:</span>
                      <span className="capitalize">{user.role.toLowerCase()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="mt-6 max-w-lg mx-auto text-xl text-indigo-600">
                Join our developer community to collaborate on projects, share knowledge, and grow together.
              </p>
              <div className="mt-10 flex justify-center gap-4">
                <div className="rounded-md shadow">
                  <a
                    href="/signup"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 md:py-4 md:text-lg md:px-10 transition-colors duration-200"
                  >
                    Get Started
                  </a>
                </div>
                <div className="rounded-md shadow">
                  <a
                    href="/login"
                    className="w-full flex items-center justify-center px-8 py-3 border border-indigo-200 text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 md:py-4 md:text-lg md:px-10 transition-colors duration-200"
                  >
                    Sign in
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;