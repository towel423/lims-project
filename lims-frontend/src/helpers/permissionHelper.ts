/**
 * Helper function to check if a user has permission
 * based on the rules stored in localStorage.
 */

/**
 * Check if a specific permission exists in rules
 * @param {string} resource - The resource to check (e.g., "document-control")
 * @param {string} action - The action to check (e.g., "read")
 * @returns {boolean} - True if the permission exists, otherwise false
 */
export const can = (resource: string, action: string, detail?: string): boolean => {
  if (typeof window === "undefined") {
    return false; // LocalStorage is not available on the server
  }

  const rules = localStorage.getItem("rules");
  if (!rules) {
    return false; // No rules found
  }

  try {
    const parsedRules = JSON.parse(rules);
    // Check if any rule matches the resource and action
    return parsedRules.some(
      (rule: { v1: string; v2: string }) => rule.v1 === resource && rule.v2 === action
    );
  } catch (error) {
    console.error("Failed to parse rules from localStorage:", error);
    return false;
  }
};

export const view = (resource: string, action: string, categoryPrefix?: string, typePrefix?: string, docControlID?: string): boolean => {
  if (typeof window === "undefined") {
    return false; // LocalStorage is not available on the server
  }

  const rpd = localStorage.getItem("rpd");
  console.log(rpd)
  if (!rpd) {
    return false; // No rules found
  }

  try {
    const parsedRpd = JSON.parse(rpd);
    // console.log(parsedRpd)

    // console.log(parsedRpd.some(
    //   (rule: { v1: string; v2: string, v3: string, v4: string, v5: string }) => rule.v1 == resource && rule.v2 == action && rule.v3 == categoryPrefix && rule.v4 == typePrefix && rule.v5 == docControlID
    // ))
    // Check if any rule matches the resource and action
        // ... existing code ...
    return parsedRpd.some(
      (rule: { v1: string; v2: string, v3: string, v4: string, v5: string }) => 
        rule.v1 === resource && 
        rule.v2 === action && 
        (categoryPrefix ? rule.v3 === categoryPrefix : true) && 
        (typePrefix ? rule.v4 === typePrefix : true) && 
        (docControlID ? rule.v5 === docControlID : true)
    );

   
  } catch (error) {
    console.error("Failed to parse rpd from localStorage:", error);
    return false;
  }
};
