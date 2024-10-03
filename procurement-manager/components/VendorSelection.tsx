import React, {useState, useEffect} from 'react';

interface Vendor{
    id: string;
    name: string;
    url: string;
    email?: string;
}

const VendorSelection: React.FC = () =>{
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [showOtherFields, setShowOtherFields] = useState(false);
    const [newVendor, setNewVendor] = useState({
        vendorName:'',
        vendorURL:'',
        vendorEmail:'',
    });

    useEffect(() => {
        async function fetchVendors() {
            try {
                const response = await fetch('/api/vendors');
                if(!response.ok){
                    throw new Error('Failed to fetch vendors');
                }
                const data = await response.json();
                setVendors(data);
            } catch (error){
                console.error('Error fetching vendors:', error);
            }
        }
        fetchVendors();
    }, []);

    const handleVendorChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        if(event.target.value === 'other'){
            setShowOtherFields(true);
        } else {
            setShowOtherFields(false);
        }
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewVendor({...newVendor, [event.target.name]: event.target.value});
    };
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            const response = await fetch('api/vendors/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newVendor),
            });
            if(!response.ok){
                throw new Error('Failed to submit new vendor');
            }

            setNewVendor({ vendorName: '', vendorURL: '', vendorEmail: ''});
            setShowOtherFields(false);
        } catch(error){
            console.error('Error submitting new vendor:', error);
        }
    };
    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label htmlFor='vendor'>Choose a vendor:</label>
                <select id='vendor' onChange={handleVendorChange} defaultValue="">
                    <option value="" disabled>
                        Select a vendor
                    </option>
                    {vendors.map((vendor) => (
                        <option key={vendor.id} value={vendor.id}>
                            {vendor.name}
                        </option>
                    ))}
                    <option value="other">Other</option>
                </select>

                {showOtherFields && (
          <div>
            <input
              name="vendorName"
              value={newVendor.vendorName}
              onChange={handleInputChange}
              placeholder="Vendor Name"
              required
            />
            <input
              name="vendorURL"
              value={newVendor.vendorURL}
              onChange={handleInputChange}
              placeholder="Vendor URL"
              type="url"
              required
            />
            <input
              name="vendorEmail"
              value={newVendor.vendorEmail}
              onChange={handleInputChange}
              placeholder="Vendor Email"
              type="email"
            />
            <button type="submit">Submit New Vendor</button>
          </div>
        )}
      </form>
    </div>
  );
};

export default VendorSelection;