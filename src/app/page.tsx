'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

export default function Home() {
  // 添加新的标签页类型
  const [activeTab, setActiveTab] = useState<'refresh' | 'proxy' | 'clickFarming'>('refresh');
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
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [clientId, setClientId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected'); // disconnected, connecting, connected, error
  const [processingMessages, setProcessingMessages] = useState<Array<{type: string; message: string; timestamp?: string}>>([]);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPongRef = useRef<number>(0);
  const isUnmountingRef = useRef(false);

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
                setProcessingMessages(prev => [...prev, { type: 'PROCESSING', message: data.data, timestamp: new Date().toISOString() }]);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent, endpoint: string, payload: object) => {
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
        setFormData({ refreshProxyUrl: '', affLink: '', proxiesList: '' });
    } catch (error) {
        console.error('Submission failed:', error);
        setSubmissionStatus('Submission failed. Please check the console and try again.');
        setIsSubmitting(false);
    }
  };

  const handleRefreshProxySubmit = (e: React.FormEvent) => {
    handleSubmit(e, '/job/refresh-proxy', {
      client_id: clientId,
      init_url: formData.affLink,
      refresh_proxy_url: formData.refreshProxyUrl
    });
  };

  const handleProxyListSubmit = (e: React.FormEvent) => {
    handleSubmit(e, '/job/proxy-list', {
      client_id: clientId,
      init_url: formData.affLink,
      proxies: formData.proxiesList.split('\n').filter(line => line.trim() !== '')
    });
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
    const proxyRegex = /^[^:]+:[0-9]+:[^:]+:[0-9]+$/;
    const urlRegex = /^https?:\/\/.+$/;
    const numberRegex = /^[1-9]\d*$/;

    if (!clickFarmingFormData.proxy) {
      errors.proxy = 'Proxy is required';
    } else if (!proxyRegex.test(clickFarmingFormData.proxy)) {
      errors.proxy = 'Invalid format. Use host:port:user:port';
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

  // 添加表单提交处理
  const handleClickFarmingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateClickFarmingForm()) {
      // 暂不实现后端交互，仅显示提示
      setNotificationMessage('Click farming task started!');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }
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
                  {isSubmitting ? 'Processing...' : 'Refresh Proxy'}
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
                    placeholder="host:port:user:pass
192.168.1.1:8080:user1:pass1
192.168.1.2:8080:user2:pass2"
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
            ) : (
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
                    placeholder="host:port:user:port"
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
                    <option value="Google">Google</option>
                    <option value="YouTube">YouTube</option>
                    <option value="X">X</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Bing">Bing</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Tumblr">Tumblr</option>
                    <option value="Tiktok">Tiktok</option>
                    <option value="Duckduckgo">Duckduckgo</option>
                    <option value="Yandex">Yandex</option>
                    <option value="Pinterest">Pinterest</option>
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

                <button type="submit" className="w-full bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-primary/90 disabled:bg-gray-500 transition-colors" disabled={isSubmitting || connectionStatus !== 'connected'}>
                  {isSubmitting ? 'Processing...' : 'Start'}
                </button>
              </form>
            )}
          </div>
        </div>

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
                  <span className="flex-1 whitespace-pre-wrap">{msg.message}</span>
                   {msg.message.includes('Final Params') && (
                    <span className="text-green-400 ml-2 self-center">✓ Done</span>
                  )}
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
      </div>
    </main>
  );
}