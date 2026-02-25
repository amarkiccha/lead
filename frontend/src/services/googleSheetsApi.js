const GOOGLE_SCRIPT_URL = process.env.REACT_APP_GOOGLE_SCRIPT_URL;

// Extract time components from ISO string or time string
const extractTimeComponents = (timeStr) => {
  if (!timeStr) return { hours: 0, minutes: 0, seconds: 0 };
  
  try {
    const date = new Date(timeStr);
    if (!isNaN(date.getTime())) {
      return {
        hours: date.getUTCHours(),
        minutes: date.getUTCMinutes(),
        seconds: date.getUTCSeconds()
      };
    }
    
    // Try parsing as HH:MM or HH:MM:SS
    const timeParts = timeStr.split(':');
    if (timeParts.length >= 2) {
      return {
        hours: parseInt(timeParts[0], 10) || 0,
        minutes: parseInt(timeParts[1], 10) || 0,
        seconds: parseInt(timeParts[2], 10) || 0
      };
    }
  } catch (e) {
    console.error('Error extracting time:', e);
  }
  
  return { hours: 0, minutes: 0, seconds: 0 };
};

// Parse date and combine with time for accurate timestamp
export const parseDateTime = (dateStr, timeStr) => {
  if (!dateStr) return 0;
  
  try {
    // Parse the date
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 0;
    
    // Extract time components
    const time = extractTimeComponents(timeStr);
    
    // Create combined timestamp using UTC to avoid timezone issues
    const combined = new Date(Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      time.hours,
      time.minutes,
      time.seconds
    ));
    
    return combined.getTime();
  } catch (e) {
    console.error('Error parsing date/time:', e);
    return 0;
  }
};

// Sort leads by date + time ascending (oldest first, newest last)
export const sortLeadsByDateTime = (leads) => {
  return [...leads].sort((a, b) => {
    const timestampA = parseDateTime(a.date, a.time);
    const timestampB = parseDateTime(b.date, b.time);
    return timestampA - timestampB; // Ascending order (oldest first, newest last)
  });
};

// Format date for display (e.g., "Feb 24, 2026")
export const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC'
    });
  } catch (e) {
    return dateStr;
  }
};

// Format time for display (e.g., "9:21 AM")
export const formatTime = (timeStr) => {
  if (!timeStr) return '-';
  
  try {
    const time = extractTimeComponents(timeStr);
    
    // Format as 12-hour time
    const hours12 = time.hours % 12 || 12;
    const ampm = time.hours >= 12 ? 'PM' : 'AM';
    const minutes = time.minutes.toString().padStart(2, '0');
    
    return `${hours12}:${minutes} ${ampm}`;
  } catch (e) {
    return timeStr;
  }
};

// Normalize lead data from API to consistent format
const normalizeLead = (lead, index) => {
  return {
    id: lead.id || lead._id || `lead-${index}`,
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
    
    // Normalize leads
    const normalizedLeads = leads.map((lead, index) => normalizeLead(lead, index));
    
    // Sort by date + time descending
    const sortedLeads = sortLeadsByDateTime(normalizedLeads);
    
    console.log('Sorted leads:', sortedLeads.map(l => ({
      name: l.name,
      date: l.date,
      time: l.time,
      timestamp: parseDateTime(l.date, l.time)
    })));
    
    return sortedLeads;
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
