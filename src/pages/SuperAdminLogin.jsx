import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { Card, CardHeader, CardBody, Input, Button, Divider } from '@nextui-org/react';

export default function SuperAdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check for super admin claim
      const idTokenResult = await userCredential.user.getIdTokenResult();
      
      if (idTokenResult.claims.superAdmin) {
        // Redirect to super admin dashboard
        navigate('/super-admin/dashboard');
      } else {
        // Not a super admin
        setError('Access denied. You do not have super admin privileges.');
        await auth.signOut();
      }
    } catch (err) {
      console.error('Login error:', err);
      
      switch (err.code) {
        case 'auth/invalid-email':
          setError('Invalid email address.');
          break;
        case 'auth/user-disabled':
          setError('This account has been disabled.');
          break;
        case 'auth/user-not-found':
          setError('No account found with this email.');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password.');
          break;
        case 'auth/invalid-credential':
          setError('Invalid email or password.');
          break;
        default:
          setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-2 px-6 pt-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">🔒</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Super Admin Login
            </h1>
          </div>
          <p className="text-sm text-gray-600">
            Access the platform management dashboard
          </p>
        </CardHeader>
        
        <Divider />
        
        <CardBody className="px-6 py-6">
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <Input
              type="email"
              label="Email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              isRequired
              variant="bordered"
              autoComplete="email"
            />
            
            <Input
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              isRequired
              variant="bordered"
              autoComplete="current-password"
            />
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <Button
              type="submit"
              color="secondary"
              size="lg"
              isLoading={loading}
              className="w-full font-semibold"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
            
            <div className="text-center">
              <Button
                variant="light"
                size="sm"
                onPress={() => navigate('/')}
              >
                ← Back to Home
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
      
      <div className="fixed bottom-4 right-4 text-xs text-gray-500 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm">
        Super Admin Access Only
      </div>
    </div>
  );
}
