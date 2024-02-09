const express = require('express');
const { faker } = require('@faker-js/faker');
const admin = require('firebase-admin');
const cors = require('cors');
const serviceAccount = require('./project-f6242-firebase-adminsdk-5yciz-70c842b3ba.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();



const app = express();
app.use(cors()); // Use CORS if needed
app.use(express.json()); // For parsing application/json


// const generateData = async () => {
//     const collection = db.collection('cars');

//     for (let i = 0; i < 100; i++) {
//         const car = {
//             make: faker.vehicle.manufacturer(),
//             model: faker.vehicle.model(),
//             year: faker.date.between('2000-01-01', '2021-12-31').getFullYear(),
//             color: faker.vehicle.color(),
//             price: faker.datatype.number({ min: 10000, max: 100000 }),
//             photoUrl: faker.image.transport() + "?random=" + Date.now() + i
//         };

//         await collection.add(car);
//     }


//     console.log('Data generation complete.');
// };

const carMakesAndModels = {
    "Toyota": ["Camry", "Corolla", "Prius"],
    "Ford": ["Fiesta", "Focus", "Mustang"],
    "Honda": ["Civic", "Accord", "CR-V"],
    "Tesla": ["Model S", "Model 3", "Model X"],
    "Chevrolet": ["Spark", "Sonic", "Malibu"],
    "BMW": ["3 Series", "5 Series", "7 Series"],
    "Mercedes-Benz": ["A-Class", "C-Class", "E-Class"],
    "Audi": ["A3", "A4", "A6"],
    "Nissan": ["Versa", "Sentra", "Altima"]
};

function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

const generateData = async () => {
    const collection = db.collection('cars');

    for (let i = 0; i < 100; i++) {
        const make = getRandomItem(Object.keys(carMakesAndModels));
        const model = getRandomItem(carMakesAndModels[make]);
        const car = {
            make,
            model,
            year: faker.date.between('2000-01-01', '2021-12-31').getFullYear(),
            color: faker.vehicle.color(),
            price: faker.datatype.number({ min: 10000, max: 100000 }),
            photoUrl: `https://loremflickr.com/640/480/transport?lock=` + i
        };

        await collection.add(car);
    }

    console.log('Data generation complete.');
};


generateData().catch(console.error);

// Endpoint to fetch cars
app.get('/api/cars', async (req, res) => {
    try {
        const carsSnapshot = await db.collection('cars').get();
        const cars = carsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(cars);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


//remove the data from the cars collection, keeping only the first 100 entries, sorted by manufacturer
const removeData = async () => {
    const collection = db.collection('cars');
    const snapshot = await collection.orderBy('make').limit(100).get();

    snapshot.forEach(doc => {
        doc.ref.delete();
    });
    //print the number of remaining cars
    const remainingSnapshot = await collection.get();
    console.log(`Remaining cars: ${remainingSnapshot.size}`);



    console.log('Data removal complete.');
};

//removeData().catch(console.error);


// Define routes here


app.get('/', (req, res) => {
    res.send('Hello World!');
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));

//=================================================================================================

app.get('/cars', async (req, res) => {
    try {
        const carsSnapshot = await db.collection('cars').get();
        const cars = carsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(cars);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// app.get('/cars/:id', async (req, res) => {
//     try {
//         const carSnapshot = await db.collection('cars').doc(req.params.id).get();
//         if (!carSnapshot.exists) {
//             res.status(404).send('Car not found');
//         } else {
//             res.status(200).json({ id: carSnapshot.id, ...carSnapshot.data() });
//         }
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// app.post('/cars', async (req, res) => {
//     try {
//         const newCar = req.body;
//         const addedCar = await db.collection('cars').add(newCar);
//         res.status(201).json({ id: addedCar.id, ...newCar });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// app.put('/cars/:id', async (req, res) => {
//     try {
//         const carUpdateData = req.body;
//         const carRef = db.collection('cars').doc(req.params.id);
//         await carRef.update(carUpdateData);
//         res.status(200).json({ id: req.params.id, ...carUpdateData });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// app.delete('/cars/:id', async (req, res) => {
//     try {
//         const carRef = db.collection('cars').doc(req.params.id);
//         await carRef.delete();
//         res.status(200).send(`Deleted car with ID: ${req.params.id}`);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

//=================================================================================================

// Function to create a new user document in Firestore
const createUserDocument = async (uid, email) => {
    try {
        await admin.firestore().collection('Users').doc(uid).set({
            uid: uid,
            email: email,
            ownedCars: [],
            cart: []
        });
    } catch (error) {
        console.error("Error creating user document:", error);
        throw error; // Rethrow the error for handling in the calling function
    }
};

// POST endpoint to create a new user
app.post('/create-user', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Create user in Firebase Authentication
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password,
            // other properties if needed, like displayName
        });

        // Create user document in Firestore
        await admin.firestore().collection('Users').doc(userRecord.uid).set({
            uid: userRecord.uid,
            email: email,
            ownedCars: [],
            cart: [],
            address: {
                addressLine: '',
                city: '',
                country: ''
            }
        });

        res.status(201).json({ message: `User created with UID: ${userRecord.uid}` });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: 'Error creating user' });
    }
});


// Middleware to authenticate the Firebase token
const authenticateToken = async (req, res, next) => {
    const headerToken = req.headers.authorization;
    if (!headerToken) {
        return res.status(401).send('No token provided');
    }

    try {
        const token = headerToken.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        res.status(403).send('Unauthorized');
    }
};


// // POST endpoint to add a car to a user's cart
// firebase.auth().currentUser.getIdToken(true).then(function (idToken) {
//     // Send token as an Authorization header in your fetch request
//     fetch('http://localhost:3000/add-to-cart', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${idToken}`
//         },
//         body: JSON.stringify({ carId: carId })
//     })
//         .then(response => response.json())
//         .then(data => console.log(data))
//         .catch(error => console.error('Error:', error));
// }).catch(function (error) {
//     // Handle error
// });

app.get('/validate-token', authenticateToken, async (req, res) => {
    try {
        // If the request reaches here, it means the token is valid (handled by authenticateToken middleware)
        res.status(200).send('Token is valid');
    } catch (error) {
        // If any error occurs, it means the token is not valid
        console.error("Error validating token:", error);
        res.status(500).send('Error validating token');
    }
});


// POST endpoint to add a car to the user's cart
app.post('/add-to-cart', authenticateToken, async (req, res) => {
    const userId = req.user.uid; // Extracted from decoded token
    const { carId } = req.body;   // ID of the car to add to cart

    const carRef = admin.firestore().collection('cars').doc(carId);
    const userRef = admin.firestore().collection('Users').doc(userId);

    try {
        // Retrieve the car's details
        const carDoc = await carRef.get();
        if (!carDoc.exists) {
            throw new Error('Car not found');
        }

        const carData = carDoc.data();

        // Create an object with car ID and details
        const carDataWithId = { ...carData, carId: carId };

        // Add the car object to the user's cart
        await userRef.update({
            cart: admin.firestore.FieldValue.arrayUnion(carDataWithId)
        });

        res.status(200).send(`Car ${carId} added to user ${userId}'s cart with details`);
    } catch (error) {
        console.error("Error adding car to cart:", error);
        res.status(500).send('Error adding car to cart');
    }
});


// POST endpoint for a user to purchase all cars in their cart
app.post('/purchase-cars', authenticateToken, async (req, res) => {
    const userId = req.user.uid; // Extracted from decoded token

    const userRef = admin.firestore().collection('Users').doc(userId);

    try {
        // Transaction to ensure atomicity of the operations
        await admin.firestore().runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists) {
                throw new Error('User not found');
            }

            const userData = userDoc.data();
            const cart = userData.cart;

            if (cart.length === 0) {
                throw new Error('No cars in the user\'s cart');
            }

            // First, gather all car details
            const carsData = [];
            for (const car of cart) {
                const carRef = admin.firestore().collection('cars').doc(car.carId);
                const carDoc = await transaction.get(carRef);
                if (!carDoc.exists) {
                    throw new Error(`Car not found: ${car.carId}`);
                }
                carsData.push({ carId: car.carId, ...carDoc.data() });
            }

            // Then, perform all write operations
            for (const carData of carsData) {
                transaction.update(userRef, {
                    ownedCars: admin.firestore.FieldValue.arrayUnion(carData)
                });
                const carRef = admin.firestore().collection('cars').doc(carData.carId);
                transaction.delete(carRef);
            }

            // Clear the user's cart
            transaction.update(userRef, { cart: [] });
        });

        res.status(200).send(`All cars in the cart purchased successfully`);
    } catch (error) {
        console.error("Error purchasing cars:", error);
        res.status(500).send('Error purchasing cars');
    }
});


// DELETE endpoint to remove a car from the user's cart
app.delete('/remove-from-cart', authenticateToken, async (req, res) => {
    const userId = req.user.uid; // Extracted from decoded token
    const { carId } = req.body;   // ID of the car to remove from cart

    try {
        const userRef = admin.firestore().collection('Users').doc(userId);
        const userSnapshot = await userRef.get();
        const userData = userSnapshot.data();

        // Check if the car is in the user's cart
        const carInCart = userData.cart.some(car => car.carId === carId);
        if (!carInCart) {
            return res.status(404).send('Car not found in cart');
        }

        // Create a new cart array without the specified car
        const updatedCart = userData.cart.filter(car => car.carId !== carId);

        // Update the user's cart
        await userRef.update({
            cart: updatedCart
        });

        res.status(200).send(`Car ${carId} removed from user ${userId}'s cart`);
    } catch (error) {
        console.error("Error removing car from cart:", error);
        res.status(500).send('Error removing car from cart');
    }
});

//get to get the cart of the logged in user
app.get('/cart', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.uid; // Retrieved from decoded token via middleware

        const userRef = admin.firestore().collection('Users').doc(userId);
        const userSnapshot = await userRef.get();

        if (!userSnapshot.exists) {
            return res.status(404).send('User not found');
        }

        const userData = userSnapshot.data();
        const cart = userData.cart || []; // Default to an empty array if no cars are in cart

        res.status(200).json(cart);
    } catch (error) {
        console.error("Error retrieving cart:", error);
        res.status(500).send('Error retrieving cart');
    }
});


app.post('/submit-review', authenticateToken, async (req, res) => {
    const userId = req.user.uid; // Extracted from decoded token
    const { carId, review, grade } = req.body; // Including grade in the request

    // Validate the grade
    if (!grade || grade < 1 || grade > 5) {
        return res.status(400).send('Grade must be between 1 and 5');
    }

    const userRef = admin.firestore().collection('Users').doc(userId);

    try {
        const userSnapshot = await userRef.get();
        if (!userSnapshot.exists) {
            return res.status(404).send('User not found');
        }

        const userData = userSnapshot.data();

        // Find the car in the user's ownedCars
        const carData = userData.ownedCars.find(car => car.carId === carId);
        if (!carData) {
            return res.status(404).send('Car not found in user\'s owned cars');
        }

        // Add review along with car details and grade to the reviews collection
        const reviewRef = admin.firestore().collection('reviews').doc();
        await reviewRef.set({
            userId: userId,
            carId: carId,
            carDetails: carData, // Include car details from ownedCars
            review: review,
            grade: grade // Including the grade in the review document
        });

        res.status(200).send('Review and grade submitted successfully');
    } catch (error) {
        console.error("Error submitting review and grade:", error);
        res.status(500).send('Error submitting review and grade');
    }
});




app.get('/reviews', async (req, res) => {
    try {
        const reviewsSnapshot = await admin.firestore().collection('reviews').get();
        const reviews = reviewsSnapshot.docs.map(doc => doc.data());

        res.status(200).json(reviews);
    } catch (error) {
        console.error("Error retrieving reviews:", error);
        res.status(500).send('Error retrieving reviews');
    }
});


app.get('/owned-cars', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.uid; // Retrieved from decoded token via middleware

        const userRef = admin.firestore().collection('Users').doc(userId);
        const userSnapshot = await userRef.get();

        if (!userSnapshot.exists) {
            return res.status(404).send('User not found');
        }

        const userData = userSnapshot.data();
        const ownedCars = userData.ownedCars || []; // Default to an empty array if no cars are owned

        res.status(200).json(ownedCars);
    } catch (error) {
        console.error("Error retrieving owned cars:", error);
        res.status(500).send('Error retrieving owned cars');
    }
});

app.post('/api/users', async (req, res) => {
    const { uid, email } = req.body;

    try {
        await admin.firestore().collection('Users').doc(uid).set({
            uid: uid,
            email: email,
            ownedCars: [],
            cart: []
        });
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error("Error adding user to Firestore:", error);
        res.status(500).json('Error adding user to database');
    }
});

//get user by id
app.get('/users/:userId', async (req, res) => {
    const userId = req.params.userId;
    const userRef = admin.firestore().collection('Users').doc(userId);

    try {
        const userSnapshot = await userRef.get();
        if (!userSnapshot.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = userSnapshot.data();
        // Return user data in JSON format
        res.status(200).json(userData);
    } catch (error) {
        console.error("Error retrieving user data:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.post('/update-address', authenticateToken, async (req, res) => {
    const userId = req.user.uid; // Extracted from the decoded token
    const { addressLine, city, country } = req.body; // Address details from the request body

    const userRef = admin.firestore().collection('Users').doc(userId);

    try {
        await userRef.update({
            'address.addressLine': addressLine,
            'address.city': city,
            'address.country': country
        });

        res.status(200).send('Address updated successfully');
    } catch (error) {
        console.error("Error updating address:", error);
        res.status(500).send('Error updating address');
    }
});

//get address of logged in user
app.get('/address', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.uid; // Retrieved from decoded token via middleware

        const userRef = admin.firestore().collection('Users').doc(userId);
        const userSnapshot = await userRef.get();

        if (!userSnapshot.exists) {
            return res.status(404).send('User not found');
        }

        const userData = userSnapshot.data();
        const address = userData.address || {}; // Default to an empty object if no address is set

        res.status(200).json(address);
    } catch (error) {
        console.error("Error retrieving address:", error);
        res.status(500).send('Error retrieving address');
    }
});

//post to add a name to the user
app.post('/add-name', authenticateToken, async (req, res) => {
    const userId = req.user.uid; // Extracted from decoded token
    const { name } = req.body;   // Name to add to the user

    const userRef = admin.firestore().collection('Users').doc(userId);

    try {
        await userRef.update({
            name: name
        });

        res.status(200).send('Name added successfully');
    } catch (error) {
        console.error("Error adding name:", error);
        res.status(500).send('Error adding name');
    }
});

//get name of logged in user
app.get('/name', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.uid; // Retrieved from decoded token via middleware

        const userRef = admin.firestore().collection('Users').doc(userId);
        const userSnapshot = await userRef.get();

        if (!userSnapshot.exists) {
            return res.status(404).send('User not found');
        }

        const userData = userSnapshot.data();
        const name = userData.name || ''; // Default to an empty string if no name is set

        // Wrap the name in an object and return as JSON
        res.status(200).json({ name: name });
    } catch (error) {
        console.error("Error retrieving name:", error);
        res.status(500).send('Error retrieving name');
    }
});

//get function to get the account name, taken from email without the @
app.get('/account-name', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.uid; // Retrieved from decoded token via middleware

        const userRef = admin.firestore().collection('Users').doc(userId);
        const userSnapshot = await userRef.get();

        if (!userSnapshot.exists) {
            return res.status(404).send('User not found');
        }

        const userData = userSnapshot.data();
        const email = userData.email || ''; // Default to an empty string if no email is set

        // Wrap the name in an object and return as JSON
        res.status(200).json({ accountName: email.split('@')[0] });
    } catch (error) {
        console.error("Error retrieving account name:", error);
        res.status(500).send('Error retrieving account name');
    }
});
