# Adobe PDF Embed API Setup Instructions

## Quick Setup

1. **Get Adobe Client ID**

   - Visit: https://developer.adobe.com/document-services/docs/overview/pdf-embed-api/gettingstarted/
   - Sign up for a free Adobe Developer account
   - Create a new project and add PDF Embed API
   - Copy your Client ID

2. **Configure Environment Variable**

   - Create a `.env` file in your project root (if it doesn't exist)
   - Add: `VITE_ADOBE_CLIENT_ID=your_client_id_here`
   - Replace `your_client_id_here` with your actual client ID

3. **Domain Configuration**
   - In Adobe Developer Console, make sure to add your domain(s):
     - `localhost:5173` (for development)
     - Your production domain
   - The API is domain-restricted for security

## Troubleshooting

- **"Cannot read properties of undefined (reading 'View')"**: Script not loaded properly
- **"Client ID not found"**: Environment variable not set correctly
- **CORS errors**: Domain not configured in Adobe Developer Console
- **Network errors**: Check if Adobe's CDN is accessible

## Testing

The component will show detailed error messages in the console to help with debugging.
