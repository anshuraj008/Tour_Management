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
mongoose.set('strictQuery',false)
const connect = async()=>{
	try {
	     await mongoose.connect(process.env.MONGO_URL)

	console.log('MongoDB database connected');

	} catch (err) {
		console.log('MongoDB database connection failed:', err.message)
	}	
};



//middleware
app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());

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

// Connect to database immediately
connect();

// For Vercel serverless deployment
if (process.env.VERCEL) {
	// Export the Express app for Vercel
	export default app;
} else {
	// For local development
	app.listen(port, () => {
		console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`);
	});
}