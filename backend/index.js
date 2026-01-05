import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose"; 
import cors from "cors"; 
import cookieParser from "cookie-parser";

import tourRoute from './routes/tours.js';
import userRoute from './routes/users.js';
import authRoute from './routes/auth.js';
import reviewRoute from './routes/reviews.js';
import bookingRoute from './routes/booking.js';

dotenv.config();
const app = express();
const port = process.env.PORT || 8000;
const corsOptions = {
	origin: true,
	credentials: true
}

// database connection
mongoose.set('strictQuery',false);

let isConnected = false;

const connect = async () => {
	if (isConnected) {
		console.log('Using existing database connection');
		return;
	}
	
	try {
		const db = await mongoose.connect(process.env.MONGO_URL, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		
		isConnected = db.connections[0].readyState === 1;
		console.log('MongoDB database connected');
	} catch (err) {
		console.log('MongoDB database connection failed:', err.message);
		throw err;
	}	
};

// Middleware to ensure DB connection for each request in serverless
app.use(async (req, res, next) => {
	try {
		await connect();
		next();
	} catch (error) {
		res.status(500).json({ 
			success: false, 
			message: 'Database connection failed' 
		});
	}
});

//middleware
app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());

// Health check route
app.get('/', (req, res) => {
	res.status(200).json({
		success: true,
		message: 'Tour Management API is running'
	});
});

app.get('/api/v1', (req, res) => {
	res.status(200).json({
		success: true,
		message: 'API v1 is working'
	});
});

// Routes
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/tours', tourRoute);
app.use('/api/v1/users', userRoute);
app.use('/api/v1/reviews', reviewRoute);
app.use('/api/v1/booking', bookingRoute);

// Error handling middleware
app.use((err, req, res, next) => {
	const errorStatus = err.status || 500;
	const errorMessage = err.message || "Something went wrong!";
	
	return res.status(errorStatus).json({
		success: false,
		status: errorStatus,
		message: errorMessage,
		stack: err.stack
	});
});

// Handle 404 routes
app.use("*", (req, res) => {
	res.status(404).json({
		success: false,
		message: "Route not found"
	});
});

// For local development
if (process.env.NODE_ENV !== 'production') {
	app.listen(port, async () => {
		await connect();
		console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`);
	});
}

// Export for Vercel serverless
export default app;