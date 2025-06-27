// import { useState, type FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, User, Loader2 } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
// import OAuthButtons from "../components/auth/OAuthButtons";
import { z } from 'zod';
import useForm from '../hooks/useForm';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signup } = useAuthStore();
  
  const {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit: submitForm,
  } = useForm<SignupFormData>(
    { name: '', email: '', password: '', confirmPassword: '' },
    signupSchema
  );

  const handleSignup = async (formData: SignupFormData) => {
    try {
      await signup(formData);
      const from = (location.state as { from?: Location })?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const onSubmit = () => submitForm(handleSignup);

  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-indigo-900">Create your account</h2>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className="sr-only">Full Name</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <User className="h-5 w-5 text-indigo-500" />
              </div>
              <input
                id="name"
                type="text"
                required
                value={values.name}
                onChange={(e) => handleChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                  touched.name && errors.name ? 'border-red-500' : 'border-gray-300'
                } rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200`}
                placeholder="Full Name"
              />
            </div>
            {touched.name && errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="sr-only">Email address</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <Mail className="h-5 w-5 text-indigo-500" />
              </div>
              <input
                id="email"
                type="email"
                required
                value={values.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                  touched.email && errors.email ? 'border-red-500' : 'border-gray-300'
                } rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200`}
                placeholder="Email address"
                autoComplete="email"
              />
            </div>
            {touched.email && errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <Lock className="h-5 w-5 text-indigo-500" />
              </div>
              <input
                id="password"
                type="password"
                required
                value={values.password}
                onChange={(e) => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                  touched.password && errors.password ? 'border-red-500' : 'border-gray-300'
                } rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200`}
                placeholder="Password"
              />
            </div>
            {touched.password && errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <Lock className="h-5 w-5 text-indigo-500" />
              </div>
              <input
                id="confirmPassword"
                type="password"
                required
                value={values.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
                className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                  touched.confirmPassword && errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                } rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200`}
                placeholder="Confirm Password"
              />
            </div>
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !isValid}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isSubmitting || !isValid
                ? 'bg-purple-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              'Sign up'
            )}
          </button>
        </form>

        {/* <OAuthButtons /> */}

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link 
            to="/login" 
            className="font-medium text-purple-600 hover:text-purple-500"
            state={{ from: location.state?.from }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;