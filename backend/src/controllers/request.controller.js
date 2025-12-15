import * as requestService from "../services/request.service.js";

export async function createRequest(req, res) {
  try {
    const requestData = req.body;
    // We could add validation here
    
    // Assuming the user ID is needed, we usually get it from req.user (middleware)
    // But based on the image provided, we will just insert the payload data for now.
    // If the table requires a user_id, we might need to update this.
    // const userId = req.user?.id; 

    const newRequest = await requestService.createRequest(requestData);
    res.status(201).json(newRequest);
  } catch (err) {
    console.error("Error creating request:", err);
    res.status(500).json({ error: "Failed to create trip request" });
  }
}

export async function getAllRequests(req, res) {
  try {
    const requests = await requestService.getAllRequests();
    res.status(200).json(requests);
  } catch (err) {
    console.error("Error fetching requests:", err);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
}
