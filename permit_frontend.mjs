import React, { useState, useEffect, useMemo } from 'react';
import apiService from './services/api';

// --- MOCK DATA ---
// In a real application, this data would come from a backend API.

const MOCK_USERS = {
  "admin@permitpro.com": { id: 1, name: "Admin User", email: "admin@permitpro.com", password: "password123", role: "Admin" },
  "user@permitpro.com": { id: 2, name: "Regular User", email: "user@permitpro.com", password: "password123", role: "User" },
};

const MOCK_PACKAGES = [
  {
    id: "PKG-001",
    customerName: "John Doe",
    propertyAddress: "123 Main St, Miami, FL 33101",
    county: "Miami-Dade",
    status: "Draft",
    createdAt: "2024-08-15T10:00:00Z",
    updatedAt: "2024-08-20T14:30:00Z",
    documents: [
      { id: 1, name: "Architectural Plans", version: 2, uploadedAt: "2024-08-16T11:00:00Z", uploader: "Admin User", url: "/docs/plans_v2.pdf" },
      { id: 2, name: "Engineering Specs", version: 1, uploadedAt: "2024-08-17T09:20:00Z", uploader: "Admin User", url: "/docs/specs_v1.pdf" },
    ],
    checklist: [
      { id: 1, item: "Site Plan", completed: true },
      { id: 2, item: "Floor Plan", completed: true },
      { id: 3, item: "Elevation Drawings", completed: false },
    ]
  },
  {
    id: "PKG-002",
    customerName: "Jane Smith",
    propertyAddress: "456 Oak Ave, Orlando, FL 32801",
    county: "Orange",
    status: "Submitted",
    createdAt: "2024-08-18T16:45:00Z",
    updatedAt: "2024-08-22T08:00:00Z",
    documents: [
      { id: 3, name: "Permit Application Form", version: 1, uploadedAt: "2024-08-18T17:00:00Z", uploader: "Regular User", url: "/docs/app_form_v1.pdf" },
    ],
    checklist: [
        { id: 1, item: "Completed Application Form", completed: true },
        { id: 2, item: "Notice of Commencement", completed: true },
        { id: 3, item: "Contractor License Copy", completed: true },
    ]
  },
  {
    id: "PKG-003",
    customerName: "Carlos Garcia",
    propertyAddress: "789 Pine Ln, Tampa, FL 33602",
    county: "Hillsborough",
    status: "Completed",
    createdAt: "2024-07-01T09:00:00Z",
    updatedAt: "2024-07-25T11:00:00Z",
    documents: [
      { id: 4, name: "Final Inspection Report", version: 1, uploadedAt: "2024-07-24T15:00:00Z", uploader: "Admin User", url: "/docs/inspection_v1.pdf" },
      { id: 5, name: "Certificate of Occupancy", version: 1, uploadedAt: "2024-07-25T10:30:00Z", uploader: "Admin User", url: "/docs/co_v1.pdf" },
    ],
    checklist: [
        { id: 1, item: "All inspections passed", completed: true },
        { id: 2, item: "Final paperwork filed", completed: true },
    ]
  },
];

const FLORIDA_COUNTIES = [
  "Alachua", "Baker", "Bay", "Bradford", "Brevard", "Broward", "Calhoun", "Charlotte", "Citrus", "Clay", "Collier", "Columbia", "DeSoto", "Dixie", "Duval", "Escambia", "Flagler", "Franklin", "Gadsden", "Gilchrist", "Glades", "Gulf", "Hamilton", "Hardee", "Hendry", "Hernando", "Highlands", "Hillsborough", "Holmes", "Indian River", "Jackson", "Jefferson", "Lafayette", "Lake", "Lee", "Leon", "Levy", "Liberty", "Madison", "Manatee", "Marion", "Martin", "Miami-Dade", "Monroe", "Nassau", "Okaloosa", "Okeechobee", "Orange", "Osceola", "Palm Beach", "Pasco", "Pinellas", "Polk", "Putnam", "Santa Rosa", "Sarasota", "Seminole", "St. Johns", "St. Lucie", "Sumter", "Suwannee", "Taylor", "Union", "Volusia", "Wakulla", "Walton", "Washington"
];


// --- ICONS (as SVG components) ---
// Using inline SVGs to avoid external dependencies.

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

// --- UI COMPONENTS (shadcn/ui style) ---

const Card = ({ children, className = '' }) => (
  <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }) => <div className={`p-6 border-b border-gray-200 ${className}`}>{children}</div>;
const CardContent = ({ children, className = '' }) => <div className={`p-6 ${className}`}>{children}</div>;
const CardTitle = ({ children, className = '' }) => <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>{children}</h3>;
const CardDescription = ({ children, className = '' }) => <p className={`text-sm text-gray-500 ${className}`}>{children}</p>;

const Button = ({ children, onClick, className = '', variant = 'default' }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const variantClasses = {
    default: "bg-gray-900 text-white hover:bg-gray-800",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    outline: "bg-transparent border border-gray-300 hover:bg-gray-100",
    ghost: "bg-transparent hover:bg-gray-100",
  };
  return (
    <button onClick={onClick} className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
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

/**
 * LoginPage Component
 * Handles user authentication. In a real app, this would involve API calls.
 */
const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await apiService.login(email, password);
      onLogin(user);
    } catch (error) {
      setError(error.message);
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
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="admin@permitpro.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="password123" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

/**
 * CreatePackageModal Component
 * A modal form for creating a new permit package.
 */
const CreatePackageModal = ({ isOpen, onClose, onPackageCreate }) => {
    const [customerName, setCustomerName] = useState('');
    const [propertyAddress, setPropertyAddress] = useState('');
    const [county, setCounty] = useState(FLORIDA_COUNTIES[0]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const newPackage = await apiService.createPackage({
                customerName,
                propertyAddress,
                county
            });
            onPackageCreate(newPackage);
            // Reset form and close
            setCustomerName('');
            setPropertyAddress('');
            setCounty(FLORIDA_COUNTIES[0]);
            onClose();
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <CardTitle>Create New Permit Package</CardTitle>
            <CardDescription>Fill in the details below to start a new package.</CardDescription>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="space-y-1">
                    <Label htmlFor="customerName">Customer Name</Label>
                    <Input id="customerName" value={customerName} onChange={e => setCustomerName(e.target.value)} required />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="propertyAddress">Property Address</Label>
                    <Input id="propertyAddress" value={propertyAddress} onChange={e => setPropertyAddress(e.target.value)} required />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="county">County</Label>
                    <Select id="county" value={county} onChange={e => setCounty(e.target.value)}>
                        {FLORIDA_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </Select>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Package'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

/**
 * UploadDocumentModal Component
 * A modal for uploading new documents to a package.
 */
const UploadDocumentModal = ({ isOpen, onClose, onDocumentUpload, packageId }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError('');

        try {
            // In a real implementation, you'd upload the file to a file storage service
            // For now, we'll simulate this with a fake URL
            const fakeUrl = `/uploads/${Date.now()}-${file.name}`;
            
            const newDocument = await apiService.uploadDocument(packageId, {
                name: file.name,
                url: fakeUrl
            });

            onDocumentUpload(packageId, newDocument);
            
            // Reset and close
            setFile(null);
            onClose();
        } catch (error) {
            setError(error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <CardTitle>Upload Document</CardTitle>
            <CardDescription>Select a file to add to package {packageId}.</CardDescription>
            <div className="mt-6 space-y-4">
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadCloudIcon className="w-10 h-10 mb-3 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-gray-500">PDF, PNG, JPG (MAX. 10MB)</p>
                        </div>
                        <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} />
                    </label>
                </div>
                {file && <p className="text-sm text-center text-gray-600">Selected file: {file.name}</p>}
                {error && <p className="text-sm text-red-500">{error}</p>}
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleUpload} disabled={!file || uploading}>
                        {uploading ? 'Uploading...' : 'Upload'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};


/**
 * Dashboard Component
 * The main view after login, displaying a list of permit packages.
 */
const Dashboard = ({ packages, onSelectPackage, onLogout, user, onPackageCreate, loading }) => {
  const [filter, setFilter] = useState('');
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  const filteredPackages = useMemo(() => {
    return packages.filter(p =>
      p.customerName.toLowerCase().includes(filter.toLowerCase()) ||
      p.propertyAddress.toLowerCase().includes(filter.toLowerCase()) ||
      p.id.toLowerCase().includes(filter.toLowerCase())
    );
  }, [packages, filter]);

  const handleLogout = () => {
    apiService.clearToken();
    onLogout();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading packages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">PermitPro Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {user.name} ({user.role})</span>
            <Button variant="ghost" onClick={handleLogout} className="p-2">
                <LogOutIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle>Permit Packages</CardTitle>
                    <CardDescription>Manage and track all residential permit packages.</CardDescription>
                </div>
                <Button onClick={() => setCreateModalOpen(true)}>
                    <PlusCircleIcon className="h-4 w-4 mr-2" />
                    New Package
                </Button>
            </div>
            <div className="mt-4">
                <Input 
                    placeholder="Search by customer, address, or ID..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Package ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>County</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPackages.map(pkg => (
                  <TableRow key={pkg.id} onClick={() => onSelectPackage(pkg)} className="cursor-pointer">
                    <TableCell className="font-medium">{pkg.id}</TableCell>
                    <TableCell>{pkg.customerName}</TableCell>
                    <TableCell>{pkg.propertyAddress}</TableCell>
                    <TableCell>{pkg.county}</TableCell>
                    <TableCell><Badge status={pkg.status}>{pkg.status}</Badge></TableCell>
                    <TableCell>{new Date(pkg.updatedAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
             {filteredPackages.length === 0 && <p className="text-center text-gray-500 py-8">No packages found.</p>}
          </CardContent>
        </Card>
      </main>
      <CreatePackageModal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} onPackageCreate={onPackageCreate} />
    </div>
  );
};

/**
 * PackageDetailView Component - Updated to use real API
 */
const PackageDetailView = ({ pkg, onBack, onDocumentUpload, onStatusUpdate }) => {
    const [isUploadModalOpen, setUploadModalOpen] = useState(false);
    const [updating, setUpdating] = useState(false);

    const handleStatusChange = async (newStatus) => {
        setUpdating(true);
        try {
            await apiService.updatePackageStatus(pkg.id, newStatus);
            onStatusUpdate(pkg.id, newStatus);
            alert(`Status updated to ${newStatus}`);
        } catch (error) {
            alert(`Error updating status: ${error.message}`);
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Button variant="outline" onClick={onBack}>&larr; Back to Dashboard</Button>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Package Details */}
                <div className="md:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>Package {pkg.id}</CardTitle>
                                    <CardDescription>{pkg.propertyAddress}</CardDescription>
                                </div>
                                <Badge status={pkg.status}>{pkg.status}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div><strong className="text-gray-600">Customer:</strong> {pkg.customerName}</div>
                            <div><strong className="text-gray-600">County:</strong> {pkg.county}</div>
                            <div><strong className="text-gray-600">Created:</strong> {new Date(pkg.createdAt).toLocaleString()}</div>
                            <div><strong className="text-gray-600">Updated:</strong> {new Date(pkg.updatedAt).toLocaleString()}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                             <div className="flex justify-between items-center">
                                <CardTitle>Documents</CardTitle>
                                <Button onClick={() => setUploadModalOpen(true)}>
                                    <UploadCloudIcon className="h-4 w-4 mr-2" />
                                    Upload Document
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Version</TableHead>
                                        <TableHead>Uploaded At</TableHead>
                                        <TableHead>Uploader</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pkg.documents.map(doc => (
                                        <TableRow key={doc.id}>
                                            <TableCell className="font-medium flex items-center gap-2">
                                                <FileIcon className="h-4 w-4 text-gray-500" />
                                                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{doc.name}</a>
                                            </TableCell>
                                            <TableCell>v{doc.version}</TableCell>
                                            <TableCell>{new Date(doc.uploadedAt).toLocaleString()}</TableCell>
                                            <TableCell>{doc.uploader}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {pkg.documents.length === 0 && <p className="text-center text-gray-500 py-8">No documents uploaded yet.</p>}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Actions & Checklist */}
                <div className="space-y-8">
                    <Card>
                        <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            <p className="text-sm text-gray-600 mb-2">Update package status:</p>
                            <Button 
                                className="w-full justify-start" 
                                variant="outline" 
                                onClick={() => handleStatusChange('Draft')} 
                                disabled={pkg.status === 'Draft' || updating}
                            >
                                Set to Draft
                            </Button>
                            <Button 
                                className="w-full justify-start" 
                                variant="outline" 
                                onClick={() => handleStatusChange('Submitted')} 
                                disabled={pkg.status === 'Submitted' || updating}
                            >
                                Set to Submitted
                            </Button>
                            <Button 
                                className="w-full justify-start" 
                                variant="outline" 
                                onClick={() => handleStatusChange('Completed')} 
                                disabled={pkg.status === 'Completed' || updating}
                            >
                                Set to Completed
                            </Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Permit Checklist</CardTitle></CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {pkg.checklist.map(item => (
                                    <li key={item.id} className="flex items-center text-sm">
                                        <input type="checkbox" checked={item.completed} readOnly className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                        <span className={`ml-2 ${item.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>{item.item}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <UploadDocumentModal 
                isOpen={isUploadModalOpen} 
                onClose={() => setUploadModalOpen(false)} 
                onDocumentUpload={onDocumentUpload}
                packageId={pkg.id}
            />
        </div>
    );
};

/**
 * Main App Component - Updated to use real backend
 */
const App = () => {
  const [user, setUser] = useState(null);
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on app load
  useEffect(() => {
    const token = localStorage.getItem('permitProToken');
    if (token) {
      // Try to load packages to verify token is still valid
      loadPackages();
    } else {
      setLoading(false);
    }
  }, []);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const packagesData = await apiService.getPackages();
      setPackages(packagesData);
      
      // If we successfully loaded packages, we have a valid user session
      if (!user) {
        // In a real app, you might want to decode the JWT to get user info
        // For now, we'll set a placeholder user
        setUser({ name: 'Current User', role: 'User' });
      }
    } catch (error) {
      console.error('Failed to load packages:', error);
      // Token might be invalid, clear it
      apiService.clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (userData) => {
    setUser(userData);
    await loadPackages();
  };

  const handleLogout = () => {
    setUser(null);
    setPackages([]);
    setSelectedPackage(null);
  };

  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg);
  };

  const handleBackToDashboard = () => {
    setSelectedPackage(null);
  };

  const handlePackageCreate = (newPackage) => {
    setPackages(prev => [newPackage, ...prev]);
  };

  const handleDocumentUpload = (packageId, newDocument) => {
    setPackages(prev => prev.map(pkg => 
      pkg.id === packageId 
        ? { ...pkg, documents: [...pkg.documents, newDocument] }
        : pkg
    ));
    
    // Update selected package if it's the one being modified
    if (selectedPackage && selectedPackage.id === packageId) {
      setSelectedPackage(prev => ({
        ...prev,
        documents: [...prev.documents, newDocument]
      }));
    }
  };

  const handleStatusUpdate = (packageId, newStatus) => {
    const now = new Date().toISOString();
    setPackages(prev => prev.map(pkg => 
      pkg.id === packageId 
        ? { ...pkg, status: newStatus, updatedAt: now }
        : pkg
    ));
    
    // Update selected package if it's the one being modified
    if (selectedPackage && selectedPackage.id === packageId) {
      setSelectedPackage(prev => ({
        ...prev,
        status: newStatus,
        updatedAt: now
      }));
    }
  };

  // Show login page if no user
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Show package detail view if a package is selected
  if (selectedPackage) {
    return (
      <PackageDetailView
        pkg={selectedPackage}
        onBack={handleBackToDashboard}
        onDocumentUpload={handleDocumentUpload}
        onStatusUpdate={handleStatusUpdate}
      />
    );
  }

  // Show dashboard
  return (
    <Dashboard
      packages={packages}
      onSelectPackage={handleSelectPackage}
      onLogout={handleLogout}
      user={user}
      onPackageCreate={handlePackageCreate}
      loading={loading}
    />
  );
};

export default App;