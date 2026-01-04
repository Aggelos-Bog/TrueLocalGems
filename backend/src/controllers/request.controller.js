import * as requestService from "../services/request.service.js";

export async function createRequest(req, res) {
  try {
    const requestData = req.body;
    // We could add validation here
    
    // Assuming the user ID is needed, we usually get it from req.user (middleware)
    // But based on the image provided, we will just insert the payload data for now.
    // If the table requires a user_id, we might need to update this.
    // const userId = req.user?.id; 

    const userId = req.user?.id;
    const newRequest = await requestService.createRequest(requestData, userId);
    res.status(201).json(newRequest);
  } catch (err) {
    console.error("Error creating request:", err);
    res.status(500).json({ error: "Failed to create trip request" });
  }
}

export async function getAllRequests(req, res) {
  try {
    const { country } = req.query;
    const requests = await requestService.getAllRequests(country);
    res.status(200).json(requests);
  } catch (err) {
    console.error("Error fetching requests:", err);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
}

export async function getRequestById(req, res) {
  try {
    const { id } = req.params;
    const request = await requestService.getRequestById(id);
    
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }
    
    res.status(200).json(request);
  } catch (err) {
    console.error("Error fetching request:", err);
    res.status(500).json({ error: "Failed to fetch request details" });
  }
}

export async function getMyRequests(req, res) {
  try {
    const userId = req.user.id;
    const requests = await requestService.getRequestsByUserId(userId);
    res.status(200).json(requests);
  } catch (err) {
    console.error("Error fetching my requests:", err);
    res.status(500).json({ error: "Failed to fetch your requests" });
  }
}

export async function updateRequest(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user.id;

    // 1. Check if request exists
    const existingRequest = await requestService.getRequestById(id);
    if (!existingRequest) {
      return res.status(404).json({ error: "Request not found" });
    }

    // 2. Check ownership
    // Note: getRequestById returns "u.user_id" as "user_id" from the query I modified earlier.
    // However, looking at services/request.service.js, getRequestById returns "u.user_id". 
    // Wait, in Step 27 I modified getRequestById to return `u.user_id`.
    // The query is: `SELECT r.*, u.name as user_name, u.user_id ...`
    // So `existingRequest.user_id` should be the creator's ID.
    
    if (existingRequest.user_id != userId) {
      return res.status(403).json({ error: "Unauthorized: You are not the creator of this request" });
    }

    // 3. Perform patch
    const updatedRequest = await requestService.patchRequest(id, updates);
    res.status(200).json(updatedRequest);
  } catch (err) {
    console.error("Error updating request:", err);
    res.status(500).json({ error: "Failed to update request" });
  }
}
