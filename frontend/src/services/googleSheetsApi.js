const GOOGLE_SCRIPT_URL = process.env.REACT_APP_GOOGLE_SCRIPT_URL;

// Helper to parse date and time into a sortable timestamp
export const parseDateTime = (dateStr, timeStr) => {
  if (!dateStr) return 0;
  
  try {
    // Combine date and time
    const dateTimeStr = timeStr ? `${dateStr} ${timeStr}` : dateStr;
    const date = new Date(dateTimeStr);
    return isNaN(date.getTime()) ? 0 : date.getTime();
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
    if (isNaN(date.getTime())) return dateStr;
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
    if (isNaN(dateTime.getTime())) return timeStr;
    return dateTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch (e) {
    return timeStr;
  }
};

// Fetch all leads from Google Apps Script using fetch with redirect follow
export const fetchLeads = async () => {
  try {
    // Use fetch with redirect: 'follow' which is important for Google Apps Script
    const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getLeads`, {
      method: 'GET',
      redirect: 'follow',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const text = await response.text();
    
    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', text);
      throw new Error('Invalid JSON response from server');
    }
    
    // Handle different response formats from Apps Script
    let leads = [];
    if (Array.isArray(data)) {
      leads = data;
    } else if (data.leads && Array.isArray(data.leads)) {
      leads = data.leads;
    } else if (data.data && Array.isArray(data.data)) {
      leads = data.data;
    } else if (data.error) {
      throw new Error(data.error);
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
    // Build URL with parameters for Google Apps Script
    // Using GET with parameters since Google Apps Script handles it better for CORS
    const params = new URLSearchParams({
      action: 'addLead',
      name: leadData.name,
      projectName: leadData.projectName,
      phoneNumber: leadData.phoneNumber,
      date: leadData.date,
      time: leadData.time
    });

    const response = await fetch(`${GOOGLE_SCRIPT_URL}?${params.toString()}`, {
      method: 'GET',
      redirect: 'follow',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const text = await response.text();
    
    // Try to parse response
    try {
      const data = JSON.parse(text);
      if (data.error) {
        throw new Error(data.error);
      }
      return data;
    } catch (parseError) {
      // If we can't parse, assume success if we got a response
      return { success: true };
    }
  } catch (error) {
    console.error('Error adding lead:', error);
    throw error;
  }
};
