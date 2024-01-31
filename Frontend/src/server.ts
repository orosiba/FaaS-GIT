import express from 'express';
import routes from './routes/apiRoutes';
import { connect, StringCodec } from "nats"
import { Job, JobQueue } from './models/jobModel'

const app = express();
app.use(express.json());
// Mount routes
app.use('/', routes);

const PORT = process.env.PORT || 3000;

//Subscribe to the NATS QUEUE
async function subscribe(){
    try {
  
        const sc = StringCodec();
  
        let nc = await connect({ servers: ['nats://nats:4222', 'nats://nats-1:4222', 'nats://nats-2:4222']})

        const sub = nc.subscribe("FrontQueue", {
            callback: (err, msg) => {
                if (err) {
                    console.log(err.message)
                } else {
                    let job = JSON.parse(sc.decode(msg.data))
                    console.log(job)
                    if(job.status === 'working') JobQueue[job.jobID].status = `working`
                    else{
                        JobQueue[job.jobID].status = 'finished'
                        JobQueue[job.jobID].result = job.result
                    }
                }
            }
        })
  
    } catch(ex) {
        console.log(ex)
    }
  }
  
  subscribe()

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});