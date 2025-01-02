const API_URL = 'http://localhost:5000/api';

export const saveCode = async (code, language) => {
  const response = await fetch(`${API_URL}/save`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code, language }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to save code');
  }
  
  return response.json();
};

export const executeCode = async (code, language) => {
  try {
    const response = await fetch(`${API_URL}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, language }),
    });

    if (!response.ok) {
      throw new Error('Execution failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`Execution failed: ${error.message}`);
  }
};
