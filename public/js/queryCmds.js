function fetchMethod(url, callback, method = "GET", data = null, token = null) {
  console.log("fetchMethod: ", url, method, data, token);

  const headers = {};

  if (data) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = "Bearer " + token;
  }

  let options = {
    method: method.toUpperCase(),
    headers: headers,
  };

  if (method.toUpperCase() !== "GET" && data !== null) {
    options.body = JSON.stringify(data);
  }

  fetch(url, options)
    .then((response) => {
      if (response.status === 204) {
        callback(response.status, {});  // No content, return empty object
      } else {
        response.text()  // Get raw response text first
          .then((text) => {
            // Only parse if there is content
            let responseData = {};
            if (text) {
              try {
                responseData = JSON.parse(text);  // Attempt to parse as JSON
              } catch (e) {
                console.error("Error parsing JSON:", e);
              }
            }
            callback(response.status, responseData);  // Return response
          })
          .catch((error) => console.error("Error reading response body:", error));
      }
    })
    .catch((error) => console.error(`Error from ${method} ${url}:`, error));
}
