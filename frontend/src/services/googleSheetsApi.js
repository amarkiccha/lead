const GOOGLE_SCRIPT_URL = process.env.REACT_APP_GOOGLE_SCRIPT_URL;

// Helper to parse date from various formats
const parseDate = (dateStr) => {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  } catch (e) {
    return null;
  }
};

// Helper to extract time from ISO date string or time string
const extractTime = (timeStr) => {
  if (!timeStr) return null;
  try {
    const date = new Date(timeStr);
    if (!isNaN(date.getTime())) {
      return date;
    }
    // Try parsing as time only
    const today = new Date().toDateString();
    const dateTime = new Date(`${today} ${timeStr}`);
    return isNaN(dateTime.getTime()) ? null : dateTime;
  } catch (e) {
    return null;
  }
};

// Helper to parse date and time into a sortable timestamp
export const parseDateTime = (dateStr, timeStr) => {
  const date = parseDate(dateStr);
  const time = extractTime(timeStr);
  
  if (!date) return 0;
  
  // If we have a time, combine date and time
  if (time) {
    const combined = new Date(date);
    combined.setHours(time.getHours(), time.getMinutes(), time.getSeconds());
    return combined.getTime();
  }
  
  return date.getTime();
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
  
  const date = parseDate(dateStr);
  if (!date) return dateStr;
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

// Format time for display (e.g., "2:30 PM")
export const formatTime = (timeStr) => {
  if (!timeStr) return '-';
  
  const time = extractTime(timeStr);
  if (!time) return timeStr;
  
  return time.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

// Normalize lead data from API to consistent format
const normalizeLead = (lead) => {
  return {
    id: lead.id || lead._id || Math.random().toString(36).substr(2, 9),
    name: lead.name || '',
    projectName: lead.projectName || lead.project_name || lead.project || '',
    phoneNumber: lead.phoneNumber || lead.phone_number || lead.phone || '',
    date: lead.date || '',
    time: lead.time || ''
  };
};

// Fetch all leads from Google Apps Script
export const fetchLeads = async () => {
  try {
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
    
    // Normalize and sort leads
    const normalizedLeads = leads.map(normalizeLead);
    return sortLeadsByDateTime(normalizedLeads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    throw error;
  }
};

// Add a new lead via Google Apps Script
export const addLead = async (leadData) => {
  try {
    // Build URL with parameters for Google Apps Script
    const params = new URLSearchParams({
      action: 'addLead',
      name: leadData.name,
      project: leadData.projectName,
      phone: leadData.phoneNumber,
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
