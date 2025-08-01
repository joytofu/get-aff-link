'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import Modal from './components/Modal'; // 引入Modal组件

const SuffixTogglePage = ({
  automaticFormData,
  handleAutomaticInputChange,
  handleAutomaticSubmit,
  isSubmittingAutomatic,
  suffixToggleMessages,
  mutateSuffixesSubmitData,
  handleMutateSuffixesInputChange,
  handleSuffixesSubmit,
  isSubmittingSuffixes,
  mutateSuffixesErrors,
  connectionStatus,
  countries
}: any) => {
  const [isAutomatic, setIsAutomatic] = useState(true);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center mb-8">
        <div className="flex space-x-1 rounded-lg bg-gray-800 p-1 border border-gray-700">
          <button
            className={`px-6 py-2 text-sm font-semibold rounded-md transition-all duration-300 ease-in-out ${
              isAutomatic
                ? 'bg-primary text-white shadow-md'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={() => setIsAutomatic(true)}
          >
            Automatic
          </button>
          <button
            className={`px-6 py-2 text-sm font-semibold rounded-md transition-all duration-300 ease-in-out ${
              !isAutomatic
                ? 'bg-primary text-white shadow-md'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={() => setIsAutomatic(false)}
          >
            Manual
          </button>
        </div>
      </div>

      {isAutomatic ? (
        <div className="mx-auto bg-gray-900 p-8 rounded-lg">
          
          <form onSubmit={handleAutomaticSubmit}>
            <div className="mb-4">
              <label htmlFor="customerId" className="block text-gray-300 mb-2">Customer ID</label>
              <input type="text" id="customerId" value={automaticFormData.customerId} onChange={handleAutomaticInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:border-emerald-500" 
              placeholder="Enter customer ID, format: 111-111-1111 or 1111111111" 
              />
            </div>
            <div className="mb-4">
              <CountryDropdown 
                countries={countries}
                selectedCountry={automaticFormData.country}
                onSelect={(countryCode: any) => handleAutomaticInputChange({ target: { id: 'country', value: countryCode } } as any)}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="proxyAddress" className="block text-gray-300 mb-2">Proxy Address</label>
              <input type="text" id="proxyAddress" value={automaticFormData.proxyAddress} onChange={handleAutomaticInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:border-emerald-500" 
              placeholder='host:port:user:pass'
              />
            </div>
            <div className="mb-4">
              <label htmlFor="affiliateLink" className="block text-gray-300 mb-2">Affiliate Link</label>
              <input type="text" id="affiliateLink" value={automaticFormData.affiliateLink} onChange={handleAutomaticInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:border-emerald-500" 
              />
            </div>
            <div className="mb-4">
              <label htmlFor="fetchCount" className="block text-gray-300 mb-2">Number of Final Params to Fetch</label>
              <input type="number" id="fetchCount" value={automaticFormData.fetchCount} onChange={handleAutomaticInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:border-emerald-500"
              placeholder='4'
              />
            </div>
            <button type="submit" className="w-full bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-primary/90 disabled:bg-gray-500 transition-colors" disabled={isSubmittingAutomatic || connectionStatus !== 'connected'}>
              {isSubmittingAutomatic ? 'Processing...' : 'Submit'}
            </button>
          </form>
        </div>
      ) : (
        <div className="mx-auto bg-gray-900 p-8 rounded-lg">
        
          <form id="submitSuffixesForm" onSubmit={handleSuffixesSubmit}>
            <div className="mb-4">
              <label htmlFor="manualCustomerId" className="block text-gray-300 mb-2">Customer ID</label>
              <input 
                type="text" 
                id="manualCustomerId" 
                name="customerId" 
                value={mutateSuffixesSubmitData.customerId} 
                onChange={handleMutateSuffixesInputChange} 
                className={`w-full bg-gray-800 border rounded-md py-2 px-3 text-white focus:outline-none focus:border-emerald-500 ${mutateSuffixesErrors.customerId ? 'border-red-500' : 'border-gray-700'}`}
                placeholder="Enter customer ID, format: 111-111-1111 or 1111111111"
              />
              {mutateSuffixesErrors.customerId && <p className="mt-1 text-sm text-red-500">{mutateSuffixesErrors.customerId}</p>}
            </div>
            <div className="mb-4">
              <CountryDropdown 
                countries={countries}
                selectedCountry={mutateSuffixesSubmitData.country}
                onSelect={(countryCode: any) => handleMutateSuffixesInputChange({ target: { name: 'country', value: countryCode, form: {id: 'submitSuffixesForm'} } } as any)}
                error={mutateSuffixesErrors.country}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="finalUrlSuffixes" className="block text-gray-300 mb-2">Final URL Suffixes (one per line)</label>
              <textarea 
                id="finalUrlSuffixes" 
                name="suffixes" 
                rows={5} 
                value={mutateSuffixesSubmitData.suffixes} 
                onChange={handleMutateSuffixesInputChange} 
                className={`w-full bg-gray-800 border rounded-md py-2 px-3 text-white focus:outline-none focus:border-emerald-500 ${mutateSuffixesErrors.suffixes ? 'border-red-500' : 'border-gray-700'}`}
                placeholder="suffix1=value1&suffix2=value2"
              ></textarea>
              {mutateSuffixesErrors.suffixes && <p className="mt-1 text-sm text-red-500">{mutateSuffixesErrors.suffixes}</p>}
            </div>
            <button type="submit" className="w-full bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-primary/90 disabled:bg-gray-500 transition-colors" disabled={isSubmittingSuffixes}>
              {isSubmittingSuffixes ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        </div>
      )}
      {isAutomatic && (
        <div className="mt-8 bg-dark-light rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-medium text-gray-300 mb-4">Processing Results</h2>
          <div className="min-h-[100px] max-h-[300px] overflow-y-auto border border-gray-700 rounded-lg p-4 bg-dark text-sm text-gray-300 space-y-2 font-mono">
            {suffixToggleMessages.length > 0 ? (
              suffixToggleMessages.map((msg: any, index: number) => (
                <div key={index} className="py-1 border-b border-gray-800 last:border-0 flex items-start">
                  <span className="text-gray-500 mr-2">[{new Date(msg.timestamp!).toLocaleTimeString()}]</span>
                  <span className="flex-1 whitespace-pre-wrap">{msg.message}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Waiting for backend processing...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const CountryDropdown = ({ countries, selectedCountry, onSelect, error }: any) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredCountries = searchTerm
    ? countries.filter((country: any) =>
        country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.code.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : countries;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <label htmlFor="country" className="block text-gray-300 mb-2">Country</label>
      <button
        type="button"
        className={`w-full bg-gray-800 border rounded-md py-2 px-3 text-white text-left flex justify-between items-center focus:outline-none focus:border-emerald-500 ${error ? 'border-red-500' : 'border-gray-700'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedCountry ? `${countries.find((c:any) => c.code === selectedCountry)?.name} - ${selectedCountry}` : 'Select a country'}</span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </button>
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2">
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:border-emerald-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <ul>
            {filteredCountries.map((country: any) => (
              <li
                key={country.code}
                className="px-4 py-2 text-white hover:bg-gray-700 cursor-pointer"
                onClick={() => {
                  onSelect(country.code);
                  setIsOpen(false);
                  setSearchTerm('');
                }}
              >
                {country.name} - {country.code}
              </li>
            ))}
          </ul>
        </div>
      )}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default function Home() {
  // 添加新的标签页类型
  const [activeTab, setActiveTab] = useState<'refresh' | 'proxy' | 'clickFarming' | 'mutateSuffixes' | 'suffixToggle'>('refresh');
  const [formData, setFormData] = useState({
    refreshProxyUrl: '',
    affLink: '',
    proxiesList: ''
  });
  // 添加Click Farming表单状态
  const [clickFarmingFormData, setClickFarmingFormData] = useState({
    proxy: '',
    targetUrl: '',
    totalClicks: '',
    referer: 'Google',
    customReferer: ''
  });
  // 为Mutate Suffixes添加新的状态
  const [mutateSuffixesAuthData, setMutateSuffixesAuthData] = useState({ customerIds: '' });
  const [mutateSuffixesSubmitData, setMutateSuffixesSubmitData] = useState({ customerId: '', suffixes: '', country: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [mutateSuffixesErrors, setMutateSuffixesErrors] = useState<Record<string, string>>({});
  const [modalState, setModalState] = useState({ isOpen: false, title: '', content: '' });
  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [clientId, setClientId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isAuthorizing, setIsAuthorizing] = useState<boolean>(false);
  const [isSubmittingSuffixes, setIsSubmittingSuffixes] = useState<boolean>(false);
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected'); // disconnected, connecting, connected, error
  const [processingMessages, setProcessingMessages] = useState<Array<{type: string; message: string; timestamp?: string}>>([]);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [sseMessages, setSseMessages] = useState<Array<{type: string; data: string; timestamp: string}>>([]);
  const [suffixToggleMessages, setSuffixToggleMessages] = useState<Array<{type: string; message: string; timestamp?: string}>>([]);
  const [automaticFormData, setAutomaticFormData] = useState({
    customerId: '',
    proxyAddress: '',
    affiliateLink: '',
    fetchCount: '4',
    country: ''
  });
  const [isSubmittingAutomatic, setIsSubmittingAutomatic] = useState<boolean>(false);
  const [countries, setCountries] = useState([
    { name: 'United States', code: 'US' },
    { name: 'China', code: 'CN' },
    { name: 'United Kingdom', code: 'GB' },
    { name: 'Canada', code: 'CA' },
    { name: 'Australia', code: 'AU' },
    { name: 'Germany', code: 'DE' },
    { name: 'France', code: 'FR' },
    { name: 'Japan', code: 'JP' },
    { name: 'India', code: 'IN' },
    { name: 'Brazil', code: 'BR' },
    { name: 'Russia', code: 'RU' },
    { name: 'South Korea', code: 'KR' },
    { name: 'Italy', code: 'IT' },
    { name: 'Spain', code: 'ES' },
    { name: 'Mexico', code: 'MX' },
    { name: 'Indonesia', code: 'ID' },
    { name: 'Netherlands', code: 'NL' },
    { name: 'Saudi Arabia', code: 'SA' },
    { name: 'Switzerland', code: 'CH' },
    { name: 'Sweden', code: 'SE' },
    { name: 'Turkey', code: 'TR' },
    { name: 'Argentina', code: 'AR' },
    { name: 'Austria', code: 'AT' },
    { name: 'Belgium', code: 'BE' },
    { name: 'Chile', code: 'CL' },
    { name: 'Colombia', code: 'CO' },
    { name: 'Czech Republic', code: 'CZ' },
    { name: 'Denmark', code: 'DK' },
    { name: 'Egypt', code: 'EG' },
    { name: 'Finland', code: 'FI' },
    { name: 'Greece', code: 'GR' },
    { name: 'Hong Kong', code: 'HK' },
    { name: 'Hungary', code: 'HU' },
    { name: 'Ireland', code: 'IE' },
    { name: 'Israel', code: 'IL' },
    { name: 'Malaysia', code: 'MY' },
    { name: 'New Zealand', code: 'NZ' },
    { name: 'Nigeria', code: 'NG' },
    { name: 'Norway', code: 'NO' },
    { name: 'Pakistan', code: 'PK' },
    { name: 'Peru', code: 'PE' },
    { name: 'Philippines', code: 'PH' },
    { name: 'Poland', code: 'PL' },
    { name: 'Portugal', code: 'PT' },
    { name: 'Qatar', code: 'QA' },
    { name: 'Romania', code: 'RO' },
    { name: 'Singapore', code: 'SG' },
    { name: 'South Africa', code: 'ZA' },
    { name: 'Taiwan', code: 'TW' },
    { name: 'Thailand', code: 'TH' },
    { name: 'Ukraine', code: 'UA' },
    { name: 'United Arab Emirates', code: 'AE' },
    { name: 'Vietnam', code: 'VN' },
    { name: 'Albania', code: 'AL' },
    { name: 'Andorra', code: 'AD' },
    { name: 'Armenia', code: 'AM' },
    { name: 'Azerbaijan', code: 'AZ' },
    { name: 'Belarus', code: 'BY' },
    { name: 'Bosnia and Herzegovina', code: 'BA' },
    { name: 'Bulgaria', code: 'BG' },
    { name: 'Croatia', code: 'HR' },
    { name: 'Cyprus', code: 'CY' },
    { name: 'Estonia', code: 'EE' },
    { name: 'Georgia', code: 'GE' },
    { name: 'Iceland', code: 'IS' },
    { name: 'Kazakhstan', code: 'KZ' },
    { name: 'Latvia', code: 'LV' },
    { name: 'Liechtenstein', code: 'LI' },
    { name: 'Lithuania', code: 'LT' },
    { name: 'Luxembourg', code: 'LU' },
    { name: 'Malta', code: 'MT' },
    { name: 'Moldova', code: 'MD' },
    { name: 'Monaco', code: 'MC' },
    { name: 'Montenegro', code: 'ME' },
    { name: 'North Macedonia', code: 'MK' },
    { name: 'San Marino', code: 'SM' },
    { name: 'Serbia', code: 'RS' },
    { name: 'Slovakia', code: 'SK' },
    { name: 'Slovenia', code: 'SI' },
    { name: 'Vatican City', code: 'VA' },
    { name: 'Antigua and Barbuda', code: 'AG' },
    { name: 'Bahamas', code: 'BS' },
    { name: 'Barbados', code: 'BB' },
    { name: 'Belize', code: 'BZ' },
    { name: 'Bolivia', code: 'BO' },
    { name: 'Costa Rica', code: 'CR' },
    { name: 'Cuba', code: 'CU' },
    { name: 'Dominica', code: 'DM' },
    { name: 'Dominican Republic', code: 'DO' },
    { name: 'Ecuador', code: 'EC' },
    { name: 'El Salvador', code: 'SV' },
    { name: 'Grenada', code: 'GD' },
    { name: 'Guatemala', code: 'GT' },
    { name: 'Guyana', code: 'GY' },
    { name: 'Haiti', code: 'HT' },
    { name: 'Honduras', code: 'HN' },
    { name: 'Jamaica', code: 'JM' },
    { name: 'Nicaragua', code: 'NI' },
    { name: 'Panama', code: 'PA' },
    { name: 'Paraguay', code: 'PY' },
    { name: 'Saint Kitts and Nevis', code: 'KN' },
    { name: 'Saint Lucia', code: 'LC' },
    { name: 'Saint Vincent and the Grenadines', code: 'VC' },
    { name: 'Suriname', code: 'SR' },
    { name: 'Trinidad and Tobago', code: 'TT' },
    { name: 'Uruguay', code: 'UY' },
    { name: 'Venezuela', code: 'VE' },
    { name: 'Afghanistan', code: 'AF' },
    { name: 'Bahrain', code: 'BH' },
    { name: 'Bangladesh', code: 'BD' },
    { name: 'Bhutan', code: 'BT' },
    { name: 'Brunei', code: 'BN' },
    { name: 'Cambodia', code: 'KH' },
    { name: 'Iran', code: 'IR' },
    { name: 'Iraq', code: 'IQ' },
    { name: 'Jordan', code: 'JO' },
    { name: 'Kuwait', code: 'KW' },
    { name: 'Kyrgyzstan', code: 'KG' },
    { name: 'Laos', code: 'LA' },
    { name: 'Lebanon', code: 'LB' },
    { name: 'Maldives', code: 'MV' },
    { name: 'Mongolia', code: 'MN' },
    { name: 'Myanmar (Burma)', code: 'MM' },
    { name: 'Nepal', code: 'NP' },
    { name: 'North Korea', code: 'KP' },
    { name: 'Oman', code: 'OM' },
    { name: 'Palestine', code: 'PS' },
    { name: 'Sri Lanka', code: 'LK' },
    { name: 'Syria', code: 'SY' },
    { name: 'Tajikistan', code: 'TJ' },
    { name: 'Timor-Leste', code: 'TL' },
    { name: 'Turkmenistan', code: 'TM' },
    { name: 'Uzbekistan', code: 'UZ' },
    { name: 'Yemen', code: 'YE' },
  ]);
  const [currentJobType, setCurrentJobType] = useState<'proxy' | 'automatic' | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPongRef = useRef<number>(0);
  const isUnmountingRef = useRef(false);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

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
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const createWebSocketConnection = () => {
        cleanupConnection();
        setConnectionStatus('connecting');
        console.log('Attempting to connect WebSocket...');

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
            console.log(`Attempting reconnection #${reconnectAttemptsRef.current} in ${delay}ms`);

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
              console.error('WebSocket connection timed out after 10 seconds.');
              setConnectionStatus('error');
              newSocket.close();
            }
          }, 10000);

          newSocket.onopen = () => {
            if (connectionTimeoutRef.current) clearTimeout(connectionTimeoutRef.current);
            reconnectAttemptsRef.current = 0;
            setConnectionStatus('connected');
            console.log('WebSocket connection established successfully.');

            const storedClientId = localStorage.getItem('ws_client_id');
            if (storedClientId) {
              newSocket.send(JSON.stringify({ type: 'SYNC_CLIENT_ID', client_id: storedClientId }));
            }

            pingIntervalRef.current = setInterval(() => {
              if (Date.now() - lastPongRef.current > 30000) {
                console.error('Heartbeat timeout. No pong received for 30 seconds.');
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
              } else if (data.type === 'PROCESSING') {
                if (inactivityTimerRef.current) {
                    clearTimeout(inactivityTimerRef.current);
                }
                inactivityTimerRef.current = setTimeout(() => {
                    setIsSubmittingAutomatic(false);
                    console.log('Re-enabling submit button due to inactivity.');
                }, 20000);

                if (typeof data.data === 'string' && data.data.includes('Successfully')) {
                    setIsSubmittingAutomatic(false);
                    if (inactivityTimerRef.current) {
                        clearTimeout(inactivityTimerRef.current);
                        inactivityTimerRef.current = null;
                    }
                }

                const message = { type: 'PROCESSING', message: data.data, timestamp: new Date().toISOString() };
                if (data.before_mutation === true) {
                    setSuffixToggleMessages(prev => [...prev, message]);
                } else if (data.before_mutation === false || data.before_mutation === undefined) {
                    setProcessingMessages(prev => [...prev, message]);
                }

                if (data.data?.includes('Final Params')) {
                  setIsSubmitting(false);
                  setSubmissionStatus('Job Done!');
                }
              }
            } catch (error) {
              console.error('Error processing WebSocket message:', error, 'Raw data:', event.data);
            }
          };

          newSocket.onclose = (event: CloseEvent) => {
            console.log(`WebSocket disconnected. Code: ${event.code}, Reason: ${event.reason || 'N/A'}`);
            cleanupConnection();
            setConnectionStatus('disconnected');
            if (!isUnmountingRef.current && event.code !== 1000) {
              attemptReconnect();
            }
          };

          newSocket.onerror = (error: Event) => {
            console.error('WebSocket error:', error);
            setConnectionStatus('error');
          };

        } catch (error) {
          console.error('Failed to create WebSocket connection:', error);
          setConnectionStatus('error');
          attemptReconnect();
        }
    };

    isUnmountingRef.current = false;
    const storedClientId = localStorage.getItem('ws_client_id');
    if (storedClientId) {
      setClientId(storedClientId);
    }
    createWebSocketConnection();

    return () => {
      isUnmountingRef.current = true;
      console.log('Component unmounting. Cleaning up WebSocket connection.');
      cleanupConnection();
    };
  }, [cleanupConnection]);

  

  useEffect(() => {
    if (!taskId) return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setTaskStatus('running');
    const sseUrl = `${process.env.NEXT_PUBLIC_API_URL}/sse/${taskId}`;
    console.log(`[SSE] Attempting to connect to: ${sseUrl}`);

    const eventSource = new EventSource(sseUrl);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('[SSE] Connection successfully established.');
    };

    eventSource.onmessage = (event) => {
      console.log('[SSE] Message received:', event.data);
      try {
        const message = JSON.parse(event.data);
        const timestamp = new Date().toISOString();

        switch (message.type) {
          case 'msg.process.info':
            setSseMessages(prev => [...prev, { type: 'info', data: message.data, timestamp }]);
            if (typeof message.data === 'string' && message.data.includes('Job Finished')) {
              setTaskStatus('done');
              if (eventSourceRef.current) {
                eventSourceRef.current.close();
                console.log('[SSE] Job Finished message received. Closing connection.');
              }
            }
            break;

          case 'msg.process.error':
            setSseMessages(prev => [...prev, { type: 'error', data: message.data, timestamp }]);
            break;

          case 'msg.process.result':
            const { total_attempted, succeeded } = message.data;
            const displayMessage = `Progress update: ${succeeded} succeeded / ${total_attempted} attempted.`;
            setSseMessages(prev => [...prev, { type: 'info', data: displayMessage, timestamp }]);
            
            setCompletedCount(succeeded);
            localStorage.setItem(`progress_${taskId}`, String(succeeded));
            
            if (totalCount > 0) {
              const percentage = (succeeded / totalCount) * 100;
              setProgress(percentage);
            }

            if (succeeded >= totalCount) {
              setTaskStatus('done');
              if (progress < 100) setProgress(100);
            }
            break;

          default:
            const unknownMessage = `Unknown message type: ${message.type}, data: ${JSON.stringify(message.data)}`;
            setSseMessages(prev => [...prev, { type: 'error', data: unknownMessage, timestamp }]);
            console.warn(`[SSE] Received unhandled message type: ${message.type}`);
            break;
        }
      } catch (error) {
        console.error('[SSE] Error parsing message data:', error);
        setSseMessages(prev => [...prev, { type: 'error', data: `Failed to parse message: ${event.data}`, timestamp: new Date().toISOString() }]);
      }
    };

    eventSource.onerror = (error) => {
      console.error('[SSE] Connection error:', error);
      setSseMessages(prev => [...prev, { type: 'error', data: 'A connection error occurred.', timestamp: new Date().toISOString() }]);
      setTaskStatus('error');
      eventSource.close();
    };

    return () => {
      console.log('[SSE] Cleaning up connection.');
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [taskId, totalCount]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent, endpoint: string, payload: object, clearForm: boolean = false) => {
    e.preventDefault();
    if (!clientId) {
        setNotificationMessage('WebSocket is not connected. Please wait.');
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
        return;
    }
    setProcessingMessages([]);
    setSubmissionStatus(null);
    setIsSubmitting(true);
    try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, payload);
        setNotificationMessage('Job submitted successfully!');
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
        setSubmissionStatus('Job successfully submitted. Waiting for processing...');
        if (clearForm) {
          setFormData({ refreshProxyUrl: '', affLink: '', proxiesList: '' });
        }
    } catch (error) {
        console.error('Submission failed:', error);
        setSubmissionStatus('Submission failed. Please check the console and try again.');
        setIsSubmitting(false);
    }
  };

  const handleRefreshProxySubmit = (e: React.FormEvent) => {
    setCurrentJobType('proxy');
    handleSubmit(e, '/job/refresh-proxy', {
      client_id: clientId,
      init_url: formData.affLink,
      refresh_proxy_url: formData.refreshProxyUrl
    }, false);
  };

  const handleProxyListSubmit = (e: React.FormEvent) => {
    setCurrentJobType('proxy');
    handleSubmit(e, '/job/proxy-list', {
      client_id: clientId,
      init_url: formData.affLink,
      proxies: formData.proxiesList.split('\n').filter(line => line.trim() !== '')
    }, false);
  };

  // 添加Click Farming表单处理函数
  const handleClickFarmingInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setClickFarmingFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // 添加表单验证函数
  const validateClickFarmingForm = () => {
    const errors: Record<string, string> = {};
    // 将密码部分的数字限制改为允许任意字符（除冒号外）
    const proxyRegex = /^[^:]+:[0-9]+:[^:]+:[^:]+$/;
    const urlRegex = /^https?:\/\/.+$/;
    const numberRegex = /^[1-9]\d*$/;

    if (!clickFarmingFormData.proxy) {
      errors.proxy = 'Proxy is required';
    } else if (!proxyRegex.test(clickFarmingFormData.proxy)) {
      errors.proxy = 'Invalid format. Use host:port:user:pass';
    }

    if (!clickFarmingFormData.targetUrl) {
      errors.targetUrl = 'Target URL is required';
    } else if (!urlRegex.test(clickFarmingFormData.targetUrl)) {
      errors.targetUrl = 'Invalid URL format';
    }

    if (!clickFarmingFormData.totalClicks) {
      errors.totalClicks = 'Total Clicks is required';
    } else if (!numberRegex.test(clickFarmingFormData.totalClicks)) {
      errors.totalClicks = 'Must be a positive integer';
    }

    if (clickFarmingFormData.referer === 'Custom' && (!clickFarmingFormData.customReferer || !urlRegex.test(clickFarmingFormData.customReferer))) {
      errors.customReferer = 'Valid URL is required for custom referer';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleClickFarmingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateClickFarmingForm() || !clientId) {
      if (!clientId) {
        setNotificationMessage('WebSocket is not connected. Please wait.');
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
      }
      return;
    }

    setIsSubmitting(true);
    setSseMessages([]);
    setProgress(0);
    setCompletedCount(0);
    setTaskId(null);
    setTaskStatus('idle'); // Reset task status before starting

    const total = parseInt(clickFarmingFormData.totalClicks, 10);
    setTotalCount(total);

    const payload = {
      proxy: clickFarmingFormData.proxy,
      target_url: clickFarmingFormData.targetUrl,
      total: total,
      referer: clickFarmingFormData.referer === 'Custom' ? clickFarmingFormData.customReferer : clickFarmingFormData.referer,
      client_id: clientId,
    };

    console.log('Sending payload to /job/click-farming:', JSON.stringify(payload, null, 2));

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/job/click-farming`, payload);
      if (response.data && response.data.task_id) {
        setTaskId(response.data.task_id);
        setNotificationMessage('Click farming task started!');
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Submission failed:', error);
      setNotificationMessage('Submission failed. Please check console.');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      setTaskStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateCustomerId = (id: string): boolean => {
    const pattern = /^(\d{3}-\d{3}-\d{4}|\d{10})$/;
    return pattern.test(id.trim());
  };

  const handleMutateSuffixesInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, form } = e.target;
    const formId = form?.id;

    if (formId === 'authorizeForm') {
      setMutateSuffixesAuthData(prev => ({ ...prev, [name]: value }));
      if (mutateSuffixesErrors.customerIds) {
        setMutateSuffixesErrors(prev => ({ ...prev, customerIds: '' }));
      }
    } else if (formId === 'submitSuffixesForm') {
      setMutateSuffixesSubmitData(prev => ({ ...prev, [name]: value }));
      if (mutateSuffixesErrors[name]) {
        setMutateSuffixesErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };

  const handleAuthorizeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    const customerIds = mutateSuffixesAuthData.customerIds.split('\n').filter(id => id.trim() !== '');
    
    if (customerIds.length === 0) {
      errors.customerIds = 'At least one Customer ID is required.';
    } else {
      const allValid = customerIds.every(validateCustomerId);
      if (!allValid) {
        errors.customerIds = 'One or more Customer IDs are invalid. Use 111-111-1111 or 1111111111 format.';
      }
    }

    setMutateSuffixesErrors(errors);

    if (Object.keys(errors).length === 0) {
      setIsAuthorizing(true);
      try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/send-invitations`, { customer_ids: customerIds });
        setModalState({ isOpen: true, title: 'Invitation Results', content: response.data.data });
        setMutateSuffixesAuthData({ customerIds: '' });
      } catch (error) {
        console.error('Authorization failed:', error);
        const errorMessage = axios.isAxiosError(error) && error.response ? JSON.stringify(error.response.data) : 'An unexpected error occurred.';
        setModalState({ isOpen: true, title: 'Authorization Failed', content: errorMessage });
      } finally {
        setIsAuthorizing(false);
      }
    }
  };

  const handleSuffixesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!validateCustomerId(mutateSuffixesSubmitData.customerId)) {
      errors.customerId = 'Invalid Customer ID format. Use 111-111-1111 or 1111111111.';
    }

    if (!mutateSuffixesSubmitData.country) {
      errors.country = 'Please select a country.';
    }

    const suffixes = mutateSuffixesSubmitData.suffixes.split('\n').filter(s => s.trim() !== '');
    if (suffixes.length === 0) {
      errors.suffixes = 'Suffixes cannot be empty.';
    }
    
    setMutateSuffixesErrors(errors);

    if (Object.keys(errors).length === 0) {
      setIsSubmittingSuffixes(true);
      try {
        const payload = {
          customer_id: mutateSuffixesSubmitData.customerId.replace(/-/g, ''),
          final_url_suffixes: suffixes,
          country: mutateSuffixesSubmitData.country
        };
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/mutate-suffixes`, payload);
        setModalState({ isOpen: true, title: 'Submission Successful', content: response.data.data || 'Suffixes have been submitted successfully.' });
        setMutateSuffixesSubmitData({ customerId: '', suffixes: '', country: '' });
      } catch (error) {
        console.error('Suffix submission failed:', error);
        const errorMessage = axios.isAxiosError(error) && error.response ? JSON.stringify(error.response.data) : 'An unexpected error occurred.';
        setModalState({ isOpen: true, title: 'Submission Failed', content: errorMessage });
      } finally {
        setIsSubmittingSuffixes(false);
      }
    }
  };

  const handleAutomaticInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setAutomaticFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleAutomaticSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
        setNotificationMessage('WebSocket is not connected. Please wait.');
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
        return;
    }
    setSuffixToggleMessages([]);
    setIsSubmittingAutomatic(true);
    setCurrentJobType('automatic');

    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(() => {
        setIsSubmittingAutomatic(false);
        setNotificationMessage('Request timed out. Re-enabling form.');
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
    }, 20000);

    try {
        const payload = {
            client_id: clientId,
            customer_id: automaticFormData.customerId,
            proxy: automaticFormData.proxyAddress,
            affiliate_link: automaticFormData.affiliateLink,
            fetch_count: parseInt(automaticFormData.fetchCount, 10),
            country: automaticFormData.country
        };
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/job/params-suffixes`, payload);
        setNotificationMessage(response.data.data || 'Job submitted successfully!');
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 2000);
    } catch (error) {
        console.error('Automatic form submission failed:', error);
        const errorMessage = axios.isAxiosError(error) && error.response ? JSON.stringify(error.response.data) : 'An unexpected error occurred.';
        setNotificationMessage(`Error: ${errorMessage}`);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 5000);
        setIsSubmittingAutomatic(false);
        if (inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current);
            inactivityTimerRef.current = null;
        }
    }
  };

  const handleCopyFinalParams = (text: string, index: number) => {
    const paramsToCopy = text.substring(text.indexOf('Final Params:') + 'Final Params:'.length).trim();
    navigator.clipboard.writeText(paramsToCopy).then(() => {
      setCopiedMessageIndex(index);
      setTimeout(() => setCopiedMessageIndex(null), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-dark to-dark-light">
      <div className="w-full max-w-3xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          GETAFF.LINK
        </h1>
        <p className="mt-2 text-lg text-gray-400">
          Uncover the true destination and tracking parameters of any affiliate link
        </p>
        </div>

        {showNotification && (
          <div className="fixed top-4 right-4 bg-primary text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
            {notificationMessage}
          </div>
        )}

        <div className="mb-4 flex items-center justify-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${
            connectionStatus === 'connected' ? 'bg-green-500' :
            connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
            'bg-red-500'
          }`}></div>
          <span className="text-sm text-gray-400 capitalize">
            {connectionStatus}
          </span>
        </div>

        <div className="bg-dark-light rounded-xl shadow-lg overflow-hidden border border-gray-700">
          <div className="flex border-b border-gray-700">
            <button
              className={`flex-1 py-4 px-6 text-center font-semibold transition-all ${activeTab === 'refresh' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-dark-light text-gray-400 hover:bg-dark-light/80'}`}
              onClick={() => setActiveTab('refresh')}
            >
              Refresh Proxy API
            </button>
            <button
              className={`flex-1 py-4 px-6 text-center font-semibold transition-all ${activeTab === 'proxy' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-dark-light text-gray-400 hover:bg-dark-light/80'}`}
              onClick={() => setActiveTab('proxy')}
            >
              Proxy List
            </button>
            
            <button
              className={`flex-1 py-4 px-6 text-center font-semibold transition-all ${activeTab === 'clickFarming' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-dark-light text-gray-400 hover:bg-dark-light/80'}`}
              onClick={() => setActiveTab('clickFarming')}
            >
              Click Farming
            </button>
            <button
              className={`flex-1 py-4 px-6 text-center font-semibold transition-all ${activeTab === 'mutateSuffixes' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-dark-light text-gray-400 hover:bg-dark-light/80'}`}
              onClick={() => setActiveTab('mutateSuffixes')}
            >
              Authorization
            </button>
            <button
              className={`flex-1 py-4 px-6 text-center font-semibold transition-all ${activeTab === 'suffixToggle' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-dark-light text-gray-400 hover:bg-dark-light/80'}`}
              onClick={() => setActiveTab('suffixToggle')}
            >
              Mutate Suffixes
            </button>
          </div>

          <div className="p-6 space-y-6">
            {activeTab === 'refresh' ? (
              <form onSubmit={handleRefreshProxySubmit} className="space-y-6">
                <div>
                  <label htmlFor="refreshProxyUrl" className="block text-sm font-medium text-gray-300 mb-1">
                    Refresh Proxy URL
                  </label>
                  <input
                    type="text"
                    id="refreshProxyUrl"
                    name="refreshProxyUrl"
                    value={formData.refreshProxyUrl}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-dark border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://api.example.com/proxy"
                  />
                </div>

                <div>
                  <label htmlFor="affLink" className="block text-sm font-medium text-gray-300 mb-1">
                    Affiliate Link
                  </label>
                  <input
                    type="text"
                    id="affLink"
                    name="affLink"
                    value={formData.affLink}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-dark border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://example.com/affiliate-link"
                  />
                </div>

                <button type="submit" className="w-full bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-primary/90 disabled:bg-gray-500 transition-colors" disabled={isSubmitting || connectionStatus !== 'connected'}>
                  {isSubmitting ? 'Processing...' : 'Get Final Params'}
                </button>
              </form>
            ) : activeTab === 'proxy' ? (
              <form onSubmit={handleProxyListSubmit} className="space-y-6">
                <div>
                  <label htmlFor="proxiesList" className="block text-sm font-medium text-gray-300 mb-1">
                    Proxies List (one per line)
                  </label>
                  <textarea
                    id="proxiesList"
                    name="proxiesList"
                    value={formData.proxiesList}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full bg-dark border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="host:port:user:pass\n192.168.1.1:8080:user1:pass1\n192.168.1.2:8080:user2:pass2"
                  />
                </div>

                <div>
                  <label htmlFor="affLinkProxy" className="block text-sm font-medium text-gray-300 mb-1">
                    Affiliate Link
                  </label>
                  <input
                    type="text"
                    id="affLinkProxy"
                    name="affLink"
                    value={formData.affLink}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-dark border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://example.com/affiliate-link"
                  />
                </div>

                <button type="submit" className="w-full bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-primary/90 disabled:bg-gray-500 transition-colors" disabled={isSubmitting || connectionStatus !== 'connected'}>
                  {isSubmitting ? 'Processing...' : 'Submit Proxy List'}
                </button>
              </form>
            ) : activeTab === 'clickFarming' ? (
              <form onSubmit={handleClickFarmingSubmit} className="space-y-6">
                <div>
                  <label htmlFor="proxy" className="block text-sm font-medium text-gray-300 mb-1">
                    Proxy
                  </label>
                  <input
                    type="text"
                    id="proxy"
                    name="proxy"
                    value={clickFarmingFormData.proxy}
                    onChange={handleClickFarmingInputChange}
                    required
                    className={`w-full bg-dark border rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary ${formErrors.proxy ? 'border-red-500' : 'border-gray-600'}`}
                    placeholder="host:port:user:pass"
                  />
                  {formErrors.proxy && <p className="mt-1 text-sm text-red-500">{formErrors.proxy}</p>}
                </div>

                <div>
                  <label htmlFor="targetUrl" className="block text-sm font-medium text-gray-300 mb-1">
                    Target URL
                  </label>
                  <input
                    type="url"
                    id="targetUrl"
                    name="targetUrl"
                    value={clickFarmingFormData.targetUrl}
                    onChange={handleClickFarmingInputChange}
                    required
                    className={`w-full bg-dark border rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary ${formErrors.targetUrl ? 'border-red-500' : 'border-gray-600'}`}
                    placeholder="https://example.com"
                  />
                  {formErrors.targetUrl && <p className="mt-1 text-sm text-red-500">{formErrors.targetUrl}</p>}
                </div>

                <div>
                  <label htmlFor="totalClicks" className="block text-sm font-medium text-gray-300 mb-1">
                    Total Clicks
                  </label>
                  <input
                    type="number"
                    id="totalClicks"
                    name="totalClicks"
                    value={clickFarmingFormData.totalClicks}
                    onChange={handleClickFarmingInputChange}
                    required
                    min="1"
                    className={`w-full bg-dark border rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary ${formErrors.totalClicks ? 'border-red-500' : 'border-gray-600'}`}
                    placeholder="100"
                  />
                  {formErrors.totalClicks && <p className="mt-1 text-sm text-red-500">{formErrors.totalClicks}</p>}
                </div>

                <div>
                  <label htmlFor="referer" className="block text-sm font-medium text-gray-300 mb-1">
                    Referer
                  </label>
                  <select
                    id="referer"
                    name="referer"
                    value={clickFarmingFormData.referer}
                    onChange={handleClickFarmingInputChange}
                    className="w-full bg-dark border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="https://google.com">Google</option>
                    <option value="https://www.youtube.com">YouTube</option>
                    <option value="https://t.co">X</option>
                    <option value="https://facebook.com">Facebook</option>
                    <option value="https://www.bing.com">Bing</option>
                    <option value="https://instagram.com">Instagram</option>
                    <option value="https://reddit.com">Reddit</option>
                    <option value="https://www.tumblr.com">Tumblr</option>
                    <option value="https://tiktok.com">Tiktok</option>
                    <option value="https://duckduckgo.com">Duckduckgo</option>
                    <option value="https://yandex.ru">Yandex</option>
                  
                    <option value="https://pinterest.com">Pinterest</option>  
                    <option value="https://xiaohongshu.com">Xiaohongshu</option>         
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                {clickFarmingFormData.referer === 'Custom' && (
                  <div>
                    <label htmlFor="customReferer" className="block text-sm font-medium text-gray-300 mb-1">
                      Custom Referer URL
                    </label>
                    <input
                      type="url"
                      id="customReferer"
                      name="customReferer"
                      value={clickFarmingFormData.customReferer}
                      onChange={handleClickFarmingInputChange}
                      required
                      className={`w-full bg-dark border rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary ${formErrors.customReferer ? 'border-red-500' : 'border-gray-600'}`}
                      placeholder="https://custom-referer.com"
                    />
                    {formErrors.customReferer && <p className="mt-1 text-sm text-red-500">{formErrors.customReferer}</p>}
                  </div>
                )}

                <button 
                  type="submit" 
                  className="w-full bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-primary/90 disabled:bg-gray-500 transition-colors"
                  disabled={isSubmitting || connectionStatus !== 'connected' || taskStatus === 'running'}
                >
                  {taskStatus === 'running' ? 'Task Running...' : (isSubmitting ? 'Processing...' : 'Start')}
                </button>
              </form>
            ) : activeTab === 'mutateSuffixes' ? (
              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                {/* Left Form: Authorize */}
                <form id="authorizeForm" onSubmit={handleAuthorizeSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="customerIds" className="block text-sm font-medium text-gray-300 mb-1">
                      Customer IDs (one per line)
                    </label>
                    <textarea
                      id="customerIds"
                      name="customerIds"
                      value={mutateSuffixesAuthData.customerIds}
                      onChange={handleMutateSuffixesInputChange}
                      required
                      rows={8}
                      className={`w-full bg-dark border rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-2 focus:ring-primary ${mutateSuffixesErrors.customerIds ? 'border-red-500' : 'border-gray-600'}`}
                      placeholder="111-111-1111 or 1111111111"
                    />
                    {mutateSuffixesErrors.customerIds && <p className="mt-1 text-sm text-red-500">{mutateSuffixesErrors.customerIds}</p>}
                  </div>
                  <button 
                    type="submit" 
                    className="w-full bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-primary/90 disabled:bg-gray-500 transition-colors"
                    disabled={isAuthorizing || isSubmittingSuffixes}
                  >
                    {isAuthorizing ? 'Authorizing...' : 'Authorize'}
                  </button>
                </form>
              </div>
            ) : activeTab === 'suffixToggle' ? (
              <SuffixTogglePage
                automaticFormData={automaticFormData}
                handleAutomaticInputChange={handleAutomaticInputChange}
                handleAutomaticSubmit={handleAutomaticSubmit}
                isSubmittingAutomatic={isSubmittingAutomatic}
                suffixToggleMessages={suffixToggleMessages}
                mutateSuffixesSubmitData={mutateSuffixesSubmitData}
                handleMutateSuffixesInputChange={handleMutateSuffixesInputChange}
                handleSuffixesSubmit={handleSuffixesSubmit}
                isSubmittingSuffixes={isSubmittingSuffixes}
                mutateSuffixesErrors={mutateSuffixesErrors}
                connectionStatus={connectionStatus}
                countries={countries}
              />
            ) : null}
          </div>
        </div>

        {taskStatus !== 'idle' && (
          <div className="bg-dark-light rounded-xl p-6 border border-gray-700">
            <h2 className="text-lg font-medium text-gray-300 mb-4">Task Progress</h2>
            <div className="w-full bg-dark rounded-full h-4 mb-2 border border-gray-600">
              <div 
                className="bg-primary h-full rounded-full transition-all duration-500 ease-out text-center text-xs text-white leading-none"
                style={{ width: `${progress}%` }}
              >
                {Math.round(progress)}%
              </div>
            </div>
            <div className="text-right text-gray-400 text-sm">
              {completedCount} / {totalCount}
            </div>
            <div className="min-h-[100px] max-h-[300px] overflow-y-auto border border-gray-700 rounded-lg p-4 bg-dark text-sm text-gray-300 space-y-2 font-mono mt-4">
              {sseMessages.length > 0 ? (
                sseMessages.map((msg, index) => (
                  <div key={index} className="py-1 border-b border-gray-800 last:border-0 flex items-start">
                    <span className="text-gray-500 mr-2">[{new Date(msg.timestamp).toLocaleTimeString()}]</span>
                    <span className={`flex-1 whitespace-pre-wrap ${msg.type === 'error' ? 'text-red-400' : 'text-gray-300'}`}>{msg.data}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Waiting for task events...</p>
              )}
              {taskStatus === 'running' && (
                <div className="flex items-center text-yellow-400 mt-2 animate-pulse">
                  <span>Task is running...</span>
                </div>
              )}
              {taskStatus === 'done' && (
                <div className="flex items-center text-green-400 mt-2">
                  <span>Task Done!</span>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab !== 'clickFarming' && activeTab !== 'mutateSuffixes' && activeTab !== 'suffixToggle' && (
          <>
            {submissionStatus && (
              <div className="bg-secondary/20 border border-secondary/40 rounded-lg p-4 text-center text-secondary animate-fade-in">
                {submissionStatus}
              </div>
            )}

            <div className="bg-dark-light rounded-xl p-6 border border-gray-700">
              <h2 className="text-lg font-medium text-gray-300 mb-4">Processing Results</h2>
              <div className="min-h-[100px] max-h-[300px] overflow-y-auto border border-gray-700 rounded-lg p-4 bg-dark text-sm text-gray-300 space-y-2 font-mono">
                {processingMessages.length > 0 ? (
                  processingMessages.map((msg, index) => (
                    <div key={index} className="py-1 border-b border-gray-800 last:border-0 flex items-start">
                      <span className="text-gray-500 mr-2">[{new Date(msg.timestamp!).toLocaleTimeString()}]</span>
                      {msg.message.includes('Final Params:') && (
                        <div className="mr-2 flex-shrink-0">
                          <button 
                            onClick={() => handleCopyFinalParams(msg.message, index)}
                            className="px-2 py-1 text-xs bg-primary hover:bg-primary/90 rounded-md text-white transition-all"
                          >
                            {copiedMessageIndex === index ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      )}
                      <span className="flex-1 whitespace-pre-wrap">{msg.message}</span>
                      {msg.message.includes('Mission Aborted') && (
                        <span className="text-red-400 ml-2 self-center">✗ Failed</span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">Waiting for backend processing...</p>
                )}
                {isSubmitting && (
                  <div className="flex items-center text-yellow-400 mt-2 animate-pulse">
                    <span>Processing...</span>
                  </div>
                )}
                {submissionStatus === 'Job Done!' && (
                  <div className="flex items-center text-green-400 mt-2">
                    <span>Job Done!</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      <Modal 
          isOpen={modalState.isOpen} 
          onClose={() => setModalState({ isOpen: false, title: '', content: '' })} 
          title={modalState.title}
        >
          <pre className="whitespace-pre-wrap text-sm">{modalState.content}</pre>
        </Modal>
      </div>
    </main>
  );
}