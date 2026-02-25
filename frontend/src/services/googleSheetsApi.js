const GOOGLE_SCRIPT_URL = process.env.REACT_APP_GOOGLE_SCRIPT_URL;

// Helper to parse date and time into a sortable timestamp
export const parseDateTime = (dateStr, timeStr) => {
  if (!dateStr) return 0;
  
  try {
    // Combine date and time
    const dateTimeStr = timeStr ? `${dateStr} ${timeStr}` : dateStr;
    const date = new Date(dateTimeStr);
    return date.getTime();
  } catch (e) {
    console.error('Error parsing date/time:', e);
    return 0;
  }
};

// Sort leads by date + time descending (latest first)
export const sortLeadsByDateTime = (leads) => {
  return [...leads].sort((a, b) => {
    const timestampA = parseDateTime(a.date, a.time);
    const timestampB = parseDateTime(b.date, b.time);
    return timestampB - timestampA; // Descending order
  });
};

// Format date for display (e.g., "Oct 12, 2023")
export const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
};

// Format time for display (e.g., "2:30 PM")
export const formatTime = (timeStr) => {
  if (!timeStr) return '-';
  
  try {
    // Handle various time formats
    const today = new Date().toDateString();
    const dateTime = new Date(`${today} ${timeStr}`);
    return dateTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch (e) {
    return timeStr;
  }
};

// Fetch all leads from Google Apps Script
export const fetchLeads = async () => {
  try {
    const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getLeads`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch leads');
    }
    
    const data = await response.json();
    
    // Handle different response formats from Apps Script
    let leads = [];
    if (Array.isArray(data)) {
      leads = data;
    } else if (data.leads && Array.isArray(data.leads)) {
      leads = data.leads;
    } else if (data.data && Array.isArray(data.data)) {
      leads = data.data;
    }
    
    // Sort by date + time descending
    return sortLeadsByDateTime(leads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    throw error;
  }
};

// Add a new lead via Google Apps Script
export const addLead = async (leadData) => {
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'addLead',
        ...leadData
      }),
      mode: 'no-cors' // Required for Google Apps Script
    });
    
    // With no-cors, we can't read the response
    // Assume success if no error thrown
    return { success: true };
  } catch (error) {
    console.error('Error adding lead:', error);
    throw error;
  }
};
