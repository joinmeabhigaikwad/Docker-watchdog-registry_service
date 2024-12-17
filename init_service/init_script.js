const axios = require('axios');
const Docker = require('dockerode');
const cron = require('node-cron');

// Initialize Docker client
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

// REST endpoint to send data to
const REST_ENDPOINT = 'http://115.112.141.156:5102/api/v1/container-activity';

// Function to fetch container activity and determine status (Active or Inactive)
const getContainerActivity = async () => {
  try {
    const containers = await docker.listContainers({ all: true });

    containers.forEach(async (containerInfo) => {
      const container = docker.getContainer(containerInfo.Id);
      const isRunning = containerInfo.State === 'running';
      const startTime = containerInfo.Created ? new Date(containerInfo.Created * 1000) : null;

      const data = {
        container_id: containerInfo.Id,
        image_name: containerInfo.Image,
        start_time: startTime?.toISOString() || null,
        stop_time: isRunning ? null : new Date().toISOString(),
        activity_status: isRunning ? 'Active' : 'Inactive',
        updated_at: new Date().toISOString(),
      };

      await updateOrCreateRecord(data);
    });
  } catch (err) {
    console.error('Error fetching container activity:', err);
  }
};

// Function to check if a container record exists and update it, otherwise create a new record
const updateOrCreateRecord = async (data) => {
  try {
    const response = await axios.get(`${REST_ENDPOINT}?container_id=${data.container_id}`);

    if (response.data?.length > 0) {
      await axios.put(`${REST_ENDPOINT}/${data.container_id}`, data);
      console.log(`Updated record for container: ${data.container_id}`);
    } else {
      await axios.post(REST_ENDPOINT, data);
      console.log(`Created new record for container: ${data.container_id}`);
    }
  } catch (err) {
    if (err.response?.status === 404) {
      await axios.post(REST_ENDPOINT, data);
      console.log(`Created new record for container: ${data.container_id}`);
    } else {
      console.error('Error checking or updating container record:', err);
    }
  }
};

// Schedule a task to run every 1 minute
cron.schedule('* * * * *', async () => {
  console.log('Cron job triggered');
  await getContainerActivity();
});

console.log('Init script running. Container activity tracking started.');
