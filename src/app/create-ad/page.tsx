'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { FiInfo, FiLink, FiDollarSign, FiTarget, FiGlobe, FiXCircle, FiKey, FiUser, FiFileText, FiToggleLeft, FiToggleRight } from 'react-icons/fi';

const CreateAdPage = () => {
  const [formData, setFormData] = useState({
    productName: '',
    customerId: '',
    websiteUrl: '',
    affiliateLink: '',
    campaignCount: '',
    dailyBudget: '',
    maxBiddingPrice: '',
    keywords: '',
    targetCountries: '',
    excludedCountries: '',
    proxy: '',
    useTracker: 'No',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [clientId, setClientId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [jobRunning, setJobRunning] = useState<boolean>(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [processingMessages, setProcessingMessages] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');
  
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPongRef = useRef<number>(0);
  const isUnmountingRef = useRef(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const urlRegex = /^(https?:\/\/[^\s$.?#].[^\s]*)$/i;

    if (!formData.productName) newErrors.productName = 'Product Name is required';
    if (!formData.customerId) newErrors.customerId = 'Customer ID is required';
    if (!formData.websiteUrl) {
      newErrors.websiteUrl = 'Website URL is required';
    } else if (!urlRegex.test(formData.websiteUrl)) {
      newErrors.websiteUrl = 'Please enter a valid URL';
    }
    if (!formData.affiliateLink) {
      newErrors.affiliateLink = 'Affiliate Link is required';
    } else if (!urlRegex.test(formData.affiliateLink)) {
      newErrors.affiliateLink = 'Please enter a valid URL';
    }
    if (!formData.proxy) newErrors.proxy = 'Proxy is required';
    if (!formData.keywords) newErrors.keywords = 'Keywords are required';

    if (formData.campaignCount && !/^[1-9]\d*$/.test(formData.campaignCount)) {
      newErrors.campaignCount = 'Campaign Count must be an integer greater than 0';
    }

    if (formData.dailyBudget && parseFloat(formData.dailyBudget) <= 0) {
      newErrors.dailyBudget = 'Daily Budget must be greater than 0';
    }

    if (formData.maxBiddingPrice && parseFloat(formData.maxBiddingPrice) <= 0) {
      newErrors.maxBiddingPrice = 'Max Bidding Price must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || connectionStatus !== 'connected') {
      if (connectionStatus !== 'connected') {
        setNotificationMessage('WebSocket is not connected. Please wait.');
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
      }
      return;
    }

    setIsSubmitting(true);
    setJobRunning(true);
    setProcessingMessages(['Processing, please wait...']);

    try {
      const payload = {
        product_name: formData.productName,
        website_url: formData.websiteUrl,
        affiliate_link: formData.affiliateLink,
        target_countries: formData.targetCountries.split(',').map(s => s.trim()).filter(s => s),
        excluded_countries: formData.excludedCountries.split(',').map(s => s.trim()).filter(s => s),
        proxy: formData.proxy,
        customer_id: formData.customerId,
        campaigns_count: formData.campaignCount ? parseInt(formData.campaignCount, 10) : undefined,
        daily_budget: formData.dailyBudget ? parseFloat(formData.dailyBudget) : undefined,
        max_bidding_price: formData.maxBiddingPrice ? parseFloat(formData.maxBiddingPrice) : undefined,
        keywords: formData.keywords.replace(/\n/g, ',').split(',').map(s => s.trim()).filter(s => s),
        use_tracker: formData.useTracker === 'Yes',
        client_id: clientId,
      };

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/job/create-ads`, payload);

      if (response.data.data === 'Job Published') {
        setNotificationMessage('Job submitted successfully! Waiting for results...');
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 2000);
      }
    } catch (error) {
      console.error('Submission failed:', error);
      const errorMessage = axios.isAxiosError(error) && error.response ? JSON.stringify(error.response.data) : 'An unexpected error occurred.';
      setNotificationMessage(`Error: ${errorMessage}`);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000);
      setJobRunning(false);
      setIsSubmitting(false); // Re-enable on error
    }
  };

  const cleanupConnection = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.onopen = null;
      socketRef.current.onmessage = null;
      socketRef.current.onclose = null;
      socketRef.current.onerror = null;
      if (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING) {
        socketRef.current.close(1000, 'Cleanup connection');
      }
      socketRef.current = null;
    }
    if (connectionTimeoutRef.current) clearTimeout(connectionTimeoutRef.current);
    if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
  }, []);

  useEffect(() => {
    const createWebSocketConnection = () => {
        cleanupConnection();
        setConnectionStatus('connecting');

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || window.location.origin;
        const urlObj = new URL(apiUrl);
        const wsProtocol = urlObj.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${wsProtocol}//${urlObj.host}/ws`;
        
        const attemptReconnect = () => {
            if (isUnmountingRef.current || reconnectAttemptsRef.current >= 5) {
              if (reconnectAttemptsRef.current >= 5) {
                console.error('Max reconnection attempts reached. Please refresh the page.');
                setNotificationMessage('Failed to connect to server. Please refresh the page.');
                setShowNotification(true);
              }
              return;
            }

            reconnectAttemptsRef.current += 1;
            const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);

            reconnectTimerRef.current = setTimeout(() => {
              if (!isUnmountingRef.current) {
                createWebSocketConnection();
              }
            }, delay);
        };

        try {
          const newSocket = new WebSocket(wsUrl);
          socketRef.current = newSocket;
          lastPongRef.current = Date.now();

          connectionTimeoutRef.current = setTimeout(() => {
            if (newSocket.readyState !== WebSocket.OPEN) {
              setConnectionStatus('error');
              newSocket.close();
            }
          }, 10000);

          newSocket.onopen = () => {
            if (connectionTimeoutRef.current) clearTimeout(connectionTimeoutRef.current);
            reconnectAttemptsRef.current = 0;
            setConnectionStatus('connected');
            const storedClientId = localStorage.getItem('ws_client_id');
            if (storedClientId) {
              setClientId(storedClientId);
              newSocket.send(JSON.stringify({ type: 'SYNC_CLIENT_ID', client_id: storedClientId }));
            }

            pingIntervalRef.current = setInterval(() => {
              if (Date.now() - lastPongRef.current > 30000) {
                newSocket.close(4008, 'Heartbeat timeout');
                return;
              }
              if (newSocket.readyState === WebSocket.OPEN) {
                newSocket.send(JSON.stringify({ type: 'PING' }));
              }
            }, 15000);
          };

          newSocket.onmessage = (event: MessageEvent) => {
            try {
            
              const data = JSON.parse(event.data);
             

              if (data.type === 'PONG') {
                lastPongRef.current = Date.now();
                return;
              }
              if (data.type === 'SET_CLIENT_ID') {
                setClientId(data.payload);
                localStorage.setItem('ws_client_id', data.payload);
              } else if (data.type === 'Create-Ads-Result') {
                if(data.data.includes("Successfully created") || data.data.includes("<CreateAdsJob.Handle>")){
                  setIsSubmitting(false);
                }
                setProcessingMessages(prev => [...prev, data.data]);
              } else if (data.type === 'PROCESSING') {
                setProcessingMessages(prev => [...prev, data.data]);
              }
            } catch (error) {
              console.error('Error processing WebSocket message:', error, 'Raw data:', event.data);
            }
          };

          newSocket.onclose = (event: CloseEvent) => {
            cleanupConnection();
            setConnectionStatus('disconnected');
            if (!isUnmountingRef.current && event.code !== 1000) {
              attemptReconnect();
            }
          };

          newSocket.onerror = () => {
            setConnectionStatus('error');
          };

        } catch (error) {
          setConnectionStatus('error');
          attemptReconnect();
        }
    };

    isUnmountingRef.current = false;
    createWebSocketConnection();

    return () => {
      isUnmountingRef.current = true;
      cleanupConnection();
    };
  }, [cleanupConnection]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto bg-gray-800 p-8 rounded-2xl shadow-2xl shadow-primary/20 border border-gray-700">
        {showNotification && (
          <div className="fixed top-4 right-4 bg-primary text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
            {notificationMessage}
          </div>
        )}
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white">Create a New Ad Campaign</h2>
            <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full transition-colors ${
                    connectionStatus === 'connected' ? 'bg-green-500' :
                    connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                    'bg-red-500'
                }`}></div>
                <span className="text-sm text-gray-400 capitalize">{connectionStatus}</span>
            </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            
            <div className="space-y-6">
              <InputField icon={<FiFileText />} label="Product Name" name="productName" value={formData.productName} onChange={handleInputChange} placeholder="e.g., Awesome Gadget" error={errors.productName} required />

              <InputField icon={<FiLink />} label="Website URL" name="websiteUrl" type="url" value={formData.websiteUrl} onChange={handleInputChange} placeholder="https://yourproduct.com" error={errors.websiteUrl} required />

              <InputField icon={<FiTarget />} label="Campaign Count" name="campaignCount" type="number" value={formData.campaignCount} onChange={handleInputChange} placeholder="e.g., 10" error={errors.campaignCount} />

              <InputField icon={<FiDollarSign />} label="Daily Budget" name="dailyBudget" type="number" value={formData.dailyBudget} onChange={handleInputChange} placeholder="e.g., 50.00" error={errors.dailyBudget} />

              <TextareaField icon={<FiGlobe />} label="Target Countries" name="targetCountries" value={formData.targetCountries} onChange={handleInputChange} placeholder="US, CA, GB" />

              <TextareaField icon={<FiInfo />} label="Keywords" name="keywords" value={formData.keywords} onChange={handleInputChange} placeholder="gadget, tech, cool stuff" error={errors.keywords} required />

            
            
              
            
            </div>

            <div className="space-y-6">
              <InputField icon={<FiUser />} label="Customer ID" name="customerId" value={formData.customerId} onChange={handleInputChange} placeholder="e.g., 123-456-7890" error={errors.customerId} required />

              <InputField icon={<FiLink />} label="Affiliate Link" name="affiliateLink" type="url" value={formData.affiliateLink} onChange={handleInputChange} placeholder="https://aff.link/yourid" error={errors.affiliateLink} required />

              <InputField icon={<FiKey />} label="Proxy" name="proxy" value={formData.proxy} onChange={handleInputChange} placeholder="host:port:user:pass" disabled={formData.useTracker === 'Yes'} error={errors.proxy} required />

              <InputField icon={<FiDollarSign />} label="Max Bidding Price" name="maxBiddingPrice" type="number" value={formData.maxBiddingPrice} onChange={handleInputChange} placeholder="e.g., 0.75" error={errors.maxBiddingPrice} />             
              
              <TextareaField icon={<FiXCircle />} label="Excluded Countries" name="excludedCountries" value={formData.excludedCountries} onChange={handleInputChange} placeholder="US, FR, DE" />
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Use Tracker</label>
                <div className="flex items-center">
                  <label htmlFor="useTrackerToggle" className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      id="useTrackerToggle" 
                      className="sr-only peer" 
                      checked={formData.useTracker === 'Yes'}
                      onChange={() => setFormData(prev => ({ ...prev, useTracker: prev.useTracker === 'Yes' ? 'No' : 'Yes' }))}
                    />
                    <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-primary/50 peer-checked:bg-primary"></div>
                    <div className="absolute left-1 top-1 bg-white border-gray-300 border rounded-full h-4 w-4 transition-all peer-checked:translate-x-full peer-checked:border-white"></div>
                  </label>
                  <span className="ml-3 text-sm font-medium text-gray-300">{formData.useTracker}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button type="submit" className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary/90 disabled:bg-gray-500 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-primary/30" disabled={isSubmitting || connectionStatus !== 'connected'}> {isSubmitting ? 'Submitting...' : 'Launch Campaign'}</button>
          </div>
        </form>

        {jobRunning && (
          <div className="mt-8 bg-gray-900 rounded-xl p-6 border border-gray-700">
            <h2 className="text-lg font-medium text-gray-300 mb-4">Processing Results</h2>
            <div className="min-h-[100px] max-h-[300px] overflow-y-auto border border-gray-700 rounded-lg p-4 bg-dark text-sm text-gray-300 space-y-2 font-mono">
              {processingMessages.length > 0 ? (
                processingMessages.map((msg, index) => (
                  <div key={index} className="py-1 border-b border-gray-800 last:border-0 flex items-start">
                    <span className="flex-1 whitespace-pre-wrap">{msg}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 animate-pulse">Waiting for backend processing...</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const InputField = ({ icon, label, error, required, ...props }: { icon: React.ReactNode, label: string, error?: string, required?: boolean, [key: string]: any }) => (
  <div>
    <label htmlFor={props.name} className="block text-sm font-medium text-gray-300 mb-2">{label} {required && <span className="text-red-500">*</span>}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
        {icon}
      </div>
      <input {...props} id={props.name} className={`w-full bg-gray-700 border rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-primary'}`} />
    </div>
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
);

const TextareaField = ({ icon, label, error, required, ...props }: { icon: React.ReactNode, label: string, error?: string, required?: boolean, [key: string]: any }) => (
  <div>
    <label htmlFor={props.name} className="block text-sm font-medium text-gray-300 mb-2">{label} {required && <span className="text-red-500">*</span>}</label>
    <div className="relative">
      <div className="absolute top-3.5 left-3 text-gray-400">
        {icon}
      </div>
      <textarea {...props} id={props.name} rows={3} className={`w-full bg-gray-700 border rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-primary'}`}></textarea>
    </div>
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
);

export default CreateAdPage;
