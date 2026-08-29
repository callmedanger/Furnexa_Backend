const express = require('express');
const cors = require('cors');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const orderRoutes = require('./routes/orderRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const productRoutes = require('./routes/productRoutes');
const aiReportRoutes = require('./routes/aiReport');
const emailRoutes = require('./routes/emailRoutes');
const riderRoutes = require('./routes/riderRoutes');
const designerRoutes = require('./routes/designerRoutes');


const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reports', aiReportRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/riders', riderRoutes);
app.use('/api/designers', designerRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});