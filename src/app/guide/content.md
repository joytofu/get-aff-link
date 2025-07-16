# How to Use GETAFF.LINK

Welcome to GETAFF.LINK! Our tool helps you get the query parameters from the final destination of an affiliate link by using proxies. This guide will walk you through the two modes available: **Refresh Proxy API** and **Proxies List**.

## Mode 1: Refresh Proxy API

This mode is ideal if you have a proxy service that provides a refreshable API endpoint. This allows you to fetch new proxies on demand.

### Steps:

1.  **Select "Refresh Proxy API" mode:** This is the default mode when you visit the tool.

2.  **Enter your Refresh Proxy API URL:** In the "Refresh proxy api" input field, paste the URL provided by your proxy service.
    *   **Optional - Specify Proxy Count:** If your proxy API supports it, you can specify the number of proxies to be returned by adding the appropriate parameter to your API URL. For example, `https://api.iprocket.io/api?username=xxxxxx&password=yyyyyyy&ips=3`. Our tool will then use 3 different proxies to access your affiliate link.

3.  **Enter your Affiliate Link:** In the "Affiliate Link" input field, paste the affiliate link you want to analyze.

4.  **Click "Submit Request":** Our tool will then:
    *   Make a request to your refresh proxy API to get one or more proxies.
    *   Access your affiliate link using each of the fetched proxies.
    *   Display the final redirected URL and its query parameters for each successful request.

## Mode 2: Proxies List

Use this mode if you have a list of individual proxies you want to use.

### Steps:

1.  **Select "Proxies List" mode:** Click on the "Proxies List" tab.

2.  **Enter your Proxies:** In the "Proxies" text area, paste your list of proxies. **Important:** Enter one proxy per line.

3.  **Enter your Affiliate Link:** In the "Affiliate Link" input field, paste the affiliate link you want to analyze.

4.  **Click "Submit":** Our tool will simultaneously access your affiliate link using each of the proxies you provided. The final redirected URL and its query parameters for each successful request will be displayed.

## Understanding the Results

After you click "Submit Request", the process and results will be displayed, showing you how the final destination URL and its query parameters were captured using each proxy. This allows you to see what information is being passed along in the final redirect.