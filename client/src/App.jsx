import React, { useState, useEffect, useMemo } from 'react';
import apiService from './services/api';

// --- MOCK DATA ---
const MOCK_USERS = {
  "admin@permitpro.com": { id: 1, name: "Admin User", email: "admin@permitpro.com", password: "password123", role: "Admin" },
  "user@permitpro.com": { id: 2, name: "Regular User", email: "user@permitpro.com", password: "password123", role: "User" },
};

const FLORIDA_COUNTIES = [
  "Alachua", "Baker", "Bay", "Bradford", "Brevard", "Broward", "Calhoun", "Charlotte", "Citrus", "Clay", "Collier", "Columbia", "DeSoto", "Dixie", "Duval", "Escambia", "Flagler", "Franklin", "Gadsden", "Gilchrist", "Glades", "Gulf", "Hamilton", "Hardee", "Hendry", "Hernando", "Highlands", "Hillsborough", "Holmes", "Indian River", "Jackson", "Jefferson", "Lafayette", "Lake", "Lee", "Leon", "Levy", "Liberty", "Madison", "Manatee", "Marion", "Martin", "Miami-Dade", "Monroe", "Nassau", "Okaloosa", "Okeechobee", "Orange", "Osceola", "Palm Beach", "Pasco", "Pinellas", "Polk", "Putnam", "Santa Rosa", "Sarasota", "Seminole", "St. Johns", "St. Lucie", "Sumter", "Suwannee", "Taylor", "Union", "Volusia", "Wakulla", "Walton", "Washington"
];

// --- ICONS ---
const FileIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const PlusCircleIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const LogOutIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const UploadCloudIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
    <path d="M12 12v9" />
    <path d="m16 16-4-4-4 4" />
  </svg>
);

const XIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

// --- UI COMPONENTS ---
const Card = ({ children, className = '' }) => (
  <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }) => <div className={`p-6 border-b border-gray-200 ${className}`}>{children}</div>;
const CardContent = ({ children, className = '' }) => <div className={`p-6 ${className}`}>{children}</div>;
const CardTitle = ({ children, className = '' }) => <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>{children}</h3>;
const CardDescription = ({ children, className = '' }) => <p className={`text-sm text-gray-500 ${className}`}>{children}</p>;

const Button = ({ children, onClick, className = '', variant = 'default', disabled = false, type = 'button' }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none px-4 py-2";
  const variantClasses = {
    default: "bg-gray-900 text-white hover:bg-gray-800",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    outline: "bg-transparent border border-gray-300 hover:bg-gray-100",
    ghost: "bg-transparent hover:bg-gray-100",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </button>
  );
};

const Input = ({ className = '', ...props }) => (
  <input
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

const Select = ({ children, className = '', ...props }) => (
  <select
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  >
    {children}
  </select>
);

const Label = ({ children, htmlFor, className = '' }) => (
  <label htmlFor={htmlFor} className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}>
    {children}
  </label>
);

const Table = ({ children, className = '' }) => <div className={`w-full overflow-auto ${className}`}><table className="w-full caption-bottom text-sm">{children}</table></div>;
const TableHeader = ({ children, className = '' }) => <thead className={`[&_tr]:border-b ${className}`}>{children}</thead>;
const TableBody = ({ children, className = '' }) => <tbody className={`[&_tr:last-child]:border-0 ${className}`}>{children}</tbody>;
const TableRow = ({ children, className = '', ...props }) => <tr className={`border-b transition-colors hover:bg-gray-50 ${className}`} {...props}>{children}</tr>;
const TableHead = ({ children, className = '' }) => <th className={`h-12 px-4 text-left align-middle font-medium text-gray-500 ${className}`}>{children}</th>;
const TableCell = ({ children, className = '' }) => <td className={`p-4 align-middle ${className}`}>{children}</td>;

const Badge = ({ children, status }) => {
  const statusClasses = {
    Draft: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Submitted: "bg-blue-100 text-blue-800 border-blue-200",
    Completed: "bg-green-100 text-green-800 border-green-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusClasses[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
      {children}
    </span>
  );
};

const Modal = ({ children, isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          {children}
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <XIcon className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

// --- APPLICATION COMPONENTS ---
const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('admin@permitpro.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiService.login({ email, password });
      onLogin(response.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to PermitPro</CardTitle>
            <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
            <div className="mt-4 text-sm text-gray-600">
              <p>Demo credentials:</p>
              <p>Email: admin@permitpro.com</p>
              <p>Password: password123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

/**
 * Dashboard Component
 */
const Dashboard = ({ user, onLogout, onSelectPackage }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const data = await apiService.getPackages();
        setPackages(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const filteredPackages = useMemo(() => {
    return packages.filter(pkg =>
      pkg.customerName?.toLowerCase().includes(filter.toLowerCase()) ||
      pkg.propertyAddress?.toLowerCase().includes(filter.toLowerCase()) ||
      pkg.id?.toString().toLowerCase().includes(filter.toLowerCase())
    );
  }, [packages, filter]);

  const handleCreatePackage = async (packageData) => {
    try {
      const newPackage = await apiService.createPackage(packageData);
      setPackages([newPackage, ...packages]);
      setShowCreateModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-4">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">PermitPro Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, {user?.name}</span>
            <Button onClick={onLogout} variant="ghost">
              <LogOutIcon className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Permit Packages</h2>
          <Button onClick={() => setShowCreateModal(true)}>
            <PlusCircleIcon className="mr-2 h-4 w-4" />
            New Permit
          </Button>
        </div>

        <div className="mb-4">
          <Input
            placeholder="Search by customer, address, or ID..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Package ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>County</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPackages.map((pkg) => (
              <TableRow key={pkg.id}>
                <TableCell className="font-medium">{pkg.id}</TableCell>
                <TableCell>{pkg.customerName}</TableCell>
                <TableCell>{pkg.propertyAddress}</TableCell>
                <TableCell>{pkg.county}</TableCell>
                <TableCell>
                  <Badge status={pkg.status}>{pkg.status}</Badge>
                </TableCell>
                <TableCell>{new Date(pkg.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onSelectPackage(pkg)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredPackages.length === 0 && (
          <p className="text-center text-gray-500 py-8">No packages found.</p>
        )}
      </main>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <CreatePackageForm onSubmit={handleCreatePackage} onCancel={() => setShowCreateModal(false)} />
      </Modal>
    </div>
  );
};

/**
 * CreatePackageForm Component
 */
const CreatePackageForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    propertyAddress: '',
    county: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.customerName.trim()) newErrors.customerName = 'Customer name is required';
    if (!formData.propertyAddress.trim()) newErrors.propertyAddress = 'Property address is required';
    if (!formData.county) newErrors.county = 'County is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <div>
      <CardHeader>
        <CardTitle>Create New Permit Package</CardTitle>
        <CardDescription>Fill in the details for your new permit package.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="customerName">Customer Name</Label>
            <Input
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
            />
            {errors.customerName && <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>}
          </div>
          
          <div>
            <Label htmlFor="propertyAddress">Property Address</Label>
            <Input
              id="propertyAddress"
              name="propertyAddress"
              value={formData.propertyAddress}
              onChange={handleChange}
            />
            {errors.propertyAddress && <p className="text-red-500 text-sm mt-1">{errors.propertyAddress}</p>}
          </div>
          
          <div>
            <Label htmlFor="county">County</Label>
            <Select
              id="county"
              name="county"
              value={formData.county}
              onChange={handleChange}
            >
              <option value="">Select a county</option>
              {FLORIDA_COUNTIES.map(county => (
                <option key={county} value={county}>{county}</option>
              ))}
            </Select>
            {errors.county && <p className="text-red-500 text-sm mt-1">{errors.county}</p>}
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit">Create Permit</Button>
          </div>
        </form>
      </CardContent>
    </div>
  );
};

/**
 * PackageDetailView Component
 */
const PackageDetailView = ({ pkg, onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Permit Details</h1>
            <Button onClick={onBack} variant="outline">Back to Dashboard</Button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>{pkg.name}</CardTitle>
            <CardDescription>Details for permit package</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Package Information</h3>
                <p><strong>County:</strong> {pkg.county}</p>
                <p><strong>Status:</strong> <Badge status={pkg.status}>{pkg.status}</Badge></p>
                <p><strong>Created:</strong> {new Date(pkg.createdAt).toLocaleDateString()}</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p>{pkg.description}</p>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Documents</h3>
              <div className="space-y-2">
                {pkg.documents && pkg.documents.length > 0 ? (
                  pkg.documents.map((doc, index) => (
                    <div key={index} className="flex items-center p-2 border rounded">
                      <FileIcon className="h-4 w-4 mr-2" />
                      {doc.name}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No documents uploaded yet.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

/**
 * Main App Component
 */
const App = () => {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedPackage, setSelectedPackage] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('login');
    setSelectedPackage(null);
  };

  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg);
    setCurrentView('packageDetail');
  };

  const handleBackToDashboard = () => {
    setSelectedPackage(null);
    setCurrentView('dashboard');
  };

  const renderCurrentView = () => {
    if (!user) {
      return <LoginPage onLogin={handleLogin} />;
    }

    switch (currentView) {
      case 'packageDetail':
        return (
          <PackageDetailView 
            pkg={selectedPackage} 
            onBack={handleBackToDashboard} 
          />
        );
      case 'dashboard':
      default:
        return (
          <Dashboard 
            user={user} 
            onLogout={handleLogout} 
            onSelectPackage={handleSelectPackage} 
          />
        );
    }
  };

  return (
    <div className="App">
      {renderCurrentView()}
    </div>
  );
};

export default App;
